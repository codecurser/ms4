package com.examportal.submission.service;

import com.examportal.submission.dto.request.SaveAnswerRequest;
import com.examportal.submission.dto.request.StartAttemptRequest;
import com.examportal.submission.dto.response.CandidateSubmissionItemDto;
import com.examportal.submission.dto.response.CreatorSubmissionsResponse;
import com.examportal.submission.dto.response.ExamAnswerKeyDto;
import com.examportal.submission.dto.response.Ms2ExamResponse;
import com.examportal.submission.dto.response.PublicQuestionDto;
import com.examportal.submission.dto.response.SaveAnswerResponse;
import com.examportal.submission.dto.response.ScorecardResponse;
import com.examportal.submission.dto.response.StartAttemptResponse;
import com.examportal.submission.dto.response.SubmissionsAnalyticsDto;
import com.examportal.submission.entity.AttemptStatus;
import com.examportal.submission.entity.CandidateAnswer;
import com.examportal.submission.entity.SubmissionAttempt;
import com.examportal.submission.exception.AttemptNotFoundException;
import com.examportal.submission.exception.InvalidAttemptStateException;
import com.examportal.submission.repository.CandidateAnswerRepository;
import com.examportal.submission.repository.SubmissionAttemptRepository;
import com.examportal.submission.util.ClientIpUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionAttemptRepository attemptRepository;
    private final CandidateAnswerRepository answerRepository;
    private final ExamValidationService examValidationService;
    private final QuestionClientService questionClientService;
    private final GradingService gradingService;

    @Transactional
    public StartAttemptResponse startAttempt(StartAttemptRequest request, HttpServletRequest httpRequest) {
        String clientIp = ClientIpUtil.getClientIp(httpRequest);
        String userAgent = ClientIpUtil.getUserAgent(httpRequest);
        String cleanEmail = request.getStudentEmail().trim().toLowerCase();
        String cleanName = request.getStudentName().trim();
        String examCode = request.getExamCode().trim();

        log.info("Candidate starting session: {} ({}) from IP: {} for examCode: {}",
                cleanName, cleanEmail, clientIp, examCode);

        // 1. Validate exam status and duration with MS2
        Ms2ExamResponse exam = examValidationService.validateAndGetExam(examCode);
        UUID examId = exam.getExamId();
        int durationMinutes = exam.getDurationMinutes() != null && exam.getDurationMinutes() > 0
                ? exam.getDurationMinutes()
                : 60;

        // 2. Check for an existing unexpired IN_PROGRESS attempt for this candidate
        Optional<SubmissionAttempt> existingAttemptOpt = attemptRepository
                .findFirstByExamIdAndStudentEmailAndStatusOrderByStartedAtDesc(
                        examId, cleanEmail, AttemptStatus.IN_PROGRESS
                );

        Instant now = Instant.now();
        if (existingAttemptOpt.isPresent()) {
            SubmissionAttempt existing = existingAttemptOpt.get();
            // If still active (within expiration + 30s grace)
            if (now.isBefore(existing.getExpiresAt().plusSeconds(30))) {
                log.info("Resuming active session {} for candidate {}", existing.getId(), cleanEmail);
                long remainingSec = Math.max(0, Duration.between(now, existing.getExpiresAt()).getSeconds());
                List<PublicQuestionDto> questions = questionClientService.getPublicQuestions(examId);

                return StartAttemptResponse.builder()
                        .attemptId(existing.getId())
                        .examId(examId)
                        .examTitle(existing.getExamTitle() != null ? existing.getExamTitle() : exam.getTitle())
                        .studentName(existing.getStudentName())
                        .studentEmail(existing.getStudentEmail())
                        .clientIp(existing.getClientIp())
                        .durationMinutes(existing.getDurationMinutes())
                        .remainingSeconds(remainingSec)
                        .startedAt(existing.getStartedAt())
                        .expiresAt(existing.getExpiresAt())
                        .status(existing.getStatus())
                        .questions(questions)
                        .savedAnswers(buildSavedAnswersMap(existing))
                        .build();
            } else {
                // Mark previous expired attempt as TIMED_OUT
                existing.setStatus(AttemptStatus.TIMED_OUT);
                attemptRepository.save(existing);
            }
        }

        // 3. Fetch sanitized questions (without answers) from MS3
        List<PublicQuestionDto> questions = questionClientService.getPublicQuestions(examId);

        // 4. Calculate timing
        Instant startedAt = now;
        Instant expiresAt = startedAt.plus(Duration.ofMinutes(durationMinutes));
        long remainingSeconds = Duration.between(startedAt, expiresAt).getSeconds();

        // 5. Store student_name, student_email, client_ip, user_agent, started_at immediately
        SubmissionAttempt attempt = SubmissionAttempt.builder()
                .examId(examId)
                .examCode(examCode)
                .examTitle(exam.getTitle() != null ? exam.getTitle() : "Online Examination")
                .studentName(cleanName)
                .studentEmail(cleanEmail)
                .clientIp(clientIp)
                .userAgent(userAgent)
                .durationMinutes(durationMinutes)
                .startedAt(startedAt)
                .expiresAt(expiresAt)
                .status(AttemptStatus.IN_PROGRESS)
                .totalScore(0.0)
                .maxScore(0)
                .percentage(0.0)
                .isPassed(false)
                .passingMarks(0)
                .build();

        attempt = attemptRepository.save(attempt);
        log.info("Exam attempt persisted: {} with Client IP: {}", attempt.getId(), clientIp);

        return StartAttemptResponse.builder()
                .attemptId(attempt.getId())
                .examId(examId)
                .examTitle(attempt.getExamTitle())
                .studentName(attempt.getStudentName())
                .studentEmail(attempt.getStudentEmail())
                .clientIp(attempt.getClientIp())
                .durationMinutes(attempt.getDurationMinutes())
                .remainingSeconds(remainingSeconds)
                .startedAt(startedAt)
                .expiresAt(expiresAt)
                .status(AttemptStatus.IN_PROGRESS)
                .questions(questions)
                .savedAnswers(Collections.emptyMap())
                .build();
    }

    @Transactional(readOnly = true)
    public StartAttemptResponse getAttemptProgress(UUID attemptId) {
        SubmissionAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new AttemptNotFoundException("Attempt not found with ID: " + attemptId));

        Instant now = Instant.now();
        long remainingSec = 0;
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            remainingSec = Math.max(0, Duration.between(now, attempt.getExpiresAt()).getSeconds());
        }

        List<PublicQuestionDto> questions = questionClientService.getPublicQuestions(attempt.getExamId());

        return StartAttemptResponse.builder()
                .attemptId(attempt.getId())
                .examId(attempt.getExamId())
                .examTitle(attempt.getExamTitle())
                .studentName(attempt.getStudentName())
                .studentEmail(attempt.getStudentEmail())
                .clientIp(attempt.getClientIp())
                .durationMinutes(attempt.getDurationMinutes())
                .remainingSeconds(remainingSec)
                .startedAt(attempt.getStartedAt())
                .expiresAt(attempt.getExpiresAt())
                .status(attempt.getStatus())
                .questions(questions)
                .savedAnswers(buildSavedAnswersMap(attempt))
                .build();
    }

    @Transactional
    public SaveAnswerResponse saveAnswer(UUID attemptId, SaveAnswerRequest request) {
        SubmissionAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new AttemptNotFoundException("Attempt not found with ID: " + attemptId));

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new InvalidAttemptStateException("Cannot save answer. Attempt status is: " + attempt.getStatus());
        }

        Instant now = Instant.now();
        // Check timer with 30s grace period
        if (now.isAfter(attempt.getExpiresAt().plusSeconds(30))) {
            log.warn("Attempt {} exceeded expiration time + 30s grace period. Marking TIMED_OUT.", attemptId);
            attempt.setStatus(AttemptStatus.TIMED_OUT);
            attemptRepository.save(attempt);
            throw new InvalidAttemptStateException("Exam time has expired. Submissions are no longer accepted.");
        }

        UUID questionId = request.getQuestionId();
        List<UUID> selectedOptionIds = request.getSelectedOptionIds() != null
                ? request.getSelectedOptionIds()
                : Collections.emptyList();

        Optional<CandidateAnswer> existingOpt = answerRepository.findByAttemptIdAndQuestionId(attemptId, questionId);
        CandidateAnswer answer;
        if (existingOpt.isPresent()) {
            answer = existingOpt.get();
            answer.setSelectedOptionIdList(selectedOptionIds);
            answer.setAnsweredAt(now);
        } else {
            answer = CandidateAnswer.builder()
                    .attempt(attempt)
                    .questionId(questionId)
                    .selectedOptionIds("[]")
                    .pointsAwarded(0)
                    .answeredAt(now)
                    .build();
            answer.setSelectedOptionIdList(selectedOptionIds);
            attempt.addAnswer(answer);
        }

        answer = answerRepository.save(answer);
        long answeredCount = answerRepository.findByAttemptId(attemptId).stream()
                .filter(a -> !a.getSelectedOptionIdList().isEmpty())
                .count();

        return SaveAnswerResponse.builder()
                .attemptId(attemptId)
                .questionId(questionId)
                .selectedOptionIds(selectedOptionIds)
                .answeredQuestionsCount((int) answeredCount)
                .savedAt(now)
                .build();
    }

    @Transactional
    public ScorecardResponse submitAttempt(UUID attemptId) {
        SubmissionAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new AttemptNotFoundException("Attempt not found with ID: " + attemptId));

        // If already submitted or timed out, return current scorecard
        if (attempt.getStatus() == AttemptStatus.SUBMITTED || attempt.getStatus() == AttemptStatus.TIMED_OUT) {
            log.info("Attempt {} already completed ({}), returning existing result", attemptId, attempt.getStatus());
            ExamAnswerKeyDto answerKey = questionClientService.getExamAnswerKey(attempt.getExamId());
            return gradingService.gradeAttempt(attempt, answerKey);
        }

        Instant now = Instant.now();
        // Automatic detection: if past timer + 30s grace period, mark TIMED_OUT, else SUBMITTED
        if (now.isAfter(attempt.getExpiresAt().plusSeconds(30))) {
            attempt.setStatus(AttemptStatus.TIMED_OUT);
        } else {
            attempt.setStatus(AttemptStatus.SUBMITTED);
        }

        attempt.setSubmittedAt(now);

        // Fetch answer key from MS3
        ExamAnswerKeyDto answerKey = questionClientService.getExamAnswerKey(attempt.getExamId());

        // Grade and populate attempt
        ScorecardResponse scorecard = gradingService.gradeAttempt(attempt, answerKey);

        // Persist graded attempt
        attemptRepository.save(attempt);
        log.info("Attempt {} graded and finalized: Score {}/{} ({}%) Status: {}",
                attemptId, attempt.getTotalScore(), attempt.getMaxScore(), attempt.getPercentage(), attempt.getStatus());

        return scorecard;
    }

    @Transactional(readOnly = true)
    public ScorecardResponse getAttemptResult(UUID attemptId) {
        SubmissionAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new AttemptNotFoundException("Attempt not found with ID: " + attemptId));

        ExamAnswerKeyDto answerKey = questionClientService.getExamAnswerKey(attempt.getExamId());
        return gradingService.gradeAttempt(attempt, answerKey);
    }

    @Transactional(readOnly = true)
    public CreatorSubmissionsResponse getExamSubmissions(UUID examId) {
        log.info("Creator auditing submissions for examId: {}", examId);
        List<SubmissionAttempt> attempts = attemptRepository.findByExamIdOrderByStartedAtDesc(examId);

        long totalAttempts = attempts.size();
        long submittedCount = 0;
        long inProgressCount = 0;
        long timedOutCount = 0;
        long passedCount = 0;
        long failedCount = 0;

        double sumScore = 0.0;
        double sumPercentage = 0.0;
        long completedCount = 0;

        for (SubmissionAttempt att : attempts) {
            if (att.getStatus() == AttemptStatus.IN_PROGRESS) {
                inProgressCount++;
            } else if (att.getStatus() == AttemptStatus.TIMED_OUT) {
                timedOutCount++;
                completedCount++;
                sumScore += (att.getTotalScore() != null ? att.getTotalScore() : 0.0);
                sumPercentage += (att.getPercentage() != null ? att.getPercentage() : 0.0);
                if (Boolean.TRUE.equals(att.getIsPassed())) passedCount++;
                else failedCount++;
            } else if (att.getStatus() == AttemptStatus.SUBMITTED) {
                submittedCount++;
                completedCount++;
                sumScore += (att.getTotalScore() != null ? att.getTotalScore() : 0.0);
                sumPercentage += (att.getPercentage() != null ? att.getPercentage() : 0.0);
                if (Boolean.TRUE.equals(att.getIsPassed())) passedCount++;
                else failedCount++;
            }
        }

        Double avgScore = completedCount > 0
                ? BigDecimal.valueOf(sumScore / completedCount).setScale(2, RoundingMode.HALF_UP).doubleValue()
                : 0.0;
        Double avgPercentage = completedCount > 0
                ? BigDecimal.valueOf(sumPercentage / completedCount).setScale(2, RoundingMode.HALF_UP).doubleValue()
                : 0.0;
        Double passRate = completedCount > 0
                ? BigDecimal.valueOf((passedCount * 100.0) / completedCount).setScale(2, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        SubmissionsAnalyticsDto analytics = SubmissionsAnalyticsDto.builder()
                .totalAttempts(totalAttempts)
                .submittedCount(submittedCount)
                .inProgressCount(inProgressCount)
                .timedOutCount(timedOutCount)
                .passedCount(passedCount)
                .failedCount(failedCount)
                .averageScore(avgScore)
                .averagePercentage(avgPercentage)
                .passRate(passRate)
                .build();

        List<CandidateSubmissionItemDto> list = attempts.stream().map(att -> {
            Instant submitTime = att.getSubmittedAt();
            long durationMins = 0;
            if (submitTime != null && att.getStartedAt() != null) {
                durationMins = Math.max(0, Duration.between(att.getStartedAt(), submitTime).toMinutes());
            }

            return CandidateSubmissionItemDto.builder()
                    .attemptId(att.getId())
                    .candidateName(att.getStudentName())
                    .candidateEmail(att.getStudentEmail())
                    .clientIp(att.getClientIp())
                    .userAgent(att.getUserAgent())
                    .startTime(att.getStartedAt())
                    .submitTime(submitTime)
                    .score(att.getTotalScore())
                    .maxScore(att.getMaxScore())
                    .percentage(att.getPercentage())
                    .isPassed(att.getIsPassed())
                    .status(att.getStatus())
                    .durationMinutesSpent(durationMins)
                    .build();
        }).toList();

        return CreatorSubmissionsResponse.builder()
                .examId(examId)
                .analytics(analytics)
                .submissions(list)
                .build();
    }

    @Transactional(readOnly = true)
    public String exportExamSubmissionsCsv(UUID examId) {
        List<SubmissionAttempt> attempts = attemptRepository.findByExamIdOrderByStartedAtDesc(examId);
        StringBuilder sb = new StringBuilder();
        sb.append("Attempt ID,Candidate Name,Candidate Email,Client IP,User Agent,Start Time,Submit Time,Status,Score,Max Score,Percentage,Pass Status\n");

        for (SubmissionAttempt a : attempts) {
            sb.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%.2f,%d,%.2f,\"%s\"\n",
                    a.getId(),
                    escapeCsv(a.getStudentName()),
                    escapeCsv(a.getStudentEmail()),
                    escapeCsv(a.getClientIp()),
                    escapeCsv(a.getUserAgent()),
                    a.getStartedAt() != null ? a.getStartedAt().toString() : "",
                    a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : "",
                    a.getStatus(),
                    a.getTotalScore() != null ? a.getTotalScore() : 0.0,
                    a.getMaxScore() != null ? a.getMaxScore() : 0,
                    a.getPercentage() != null ? a.getPercentage() : 0.0,
                    Boolean.TRUE.equals(a.getIsPassed()) ? "PASSED" : "FAILED"
            ));
        }

        return sb.toString();
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        return val.replace("\"", "\"\"");
    }

    private Map<UUID, List<UUID>> buildSavedAnswersMap(SubmissionAttempt attempt) {
        Map<UUID, List<UUID>> map = new HashMap<>();
        if (attempt.getAnswers() != null) {
            for (CandidateAnswer a : attempt.getAnswers()) {
                map.put(a.getQuestionId(), a.getSelectedOptionIdList());
            }
        }
        return map;
    }
}

