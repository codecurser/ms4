package com.examportal.submission.service;

import com.examportal.submission.dto.response.CompletionReceiptDto;
import com.examportal.submission.dto.response.ExamAnswerKeyDto;
import com.examportal.submission.dto.response.QuestionAnswerKeyDto;
import com.examportal.submission.dto.response.QuestionScoreDetailDto;
import com.examportal.submission.dto.response.ScorecardResponse;
import com.examportal.submission.entity.CandidateAnswer;
import com.examportal.submission.entity.SubmissionAttempt;
import com.examportal.submission.util.ChecksumUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class GradingService {

    public ScorecardResponse gradeAttempt(
            SubmissionAttempt attempt,
            ExamAnswerKeyDto answerKey
    ) {
        log.info("Executing auto-grading for attempt: {} (Exam: {})", attempt.getId(), attempt.getExamId());

        // Map candidate answers by questionId
        Map<UUID, CandidateAnswer> candidateAnswerMap = new HashMap<>();
        if (attempt.getAnswers() != null) {
            for (CandidateAnswer ca : attempt.getAnswers()) {
                candidateAnswerMap.put(ca.getQuestionId(), ca);
            }
        }

        double totalScore = 0.0;
        int maxScore = 0;
        List<QuestionScoreDetailDto> questionDetails = new ArrayList<>();

        List<QuestionAnswerKeyDto> questions = answerKey.getQuestions() != null ? answerKey.getQuestions() : Collections.emptyList();

        for (QuestionAnswerKeyDto qKey : questions) {
            UUID qId = qKey.getQuestionId();
            String qType = qKey.getQuestionType() != null ? qKey.getQuestionType().toUpperCase() : "SINGLE_CHOICE";
            int questionPoints = qKey.getPoints() > 0 ? qKey.getPoints() : 1;
            maxScore += questionPoints;

            List<UUID> correctOptionIds = qKey.getCorrectOptionIds() != null ? qKey.getCorrectOptionIds() : Collections.emptyList();
            Set<UUID> correctSet = new HashSet<>(correctOptionIds);

            CandidateAnswer answer = candidateAnswerMap.get(qId);
            List<UUID> selectedOptionIds = (answer != null) ? answer.getSelectedOptionIdList() : Collections.emptyList();
            Set<UUID> selectedSet = new HashSet<>(selectedOptionIds);

            boolean isCorrect = false;
            int pointsEarned = 0;

            if ("SINGLE_CHOICE".equals(qType) || "TRUE_FALSE".equals(qType)) {
                // Single Choice / True False: exactly matches the correct option ID
                if (selectedSet.size() == 1 && correctSet.size() == 1 && selectedSet.equals(correctSet)) {
                    isCorrect = true;
                    pointsEarned = questionPoints;
                }
            } else if ("MULTIPLE_CHOICE".equals(qType)) {
                // Multiple Choice: full points only if all correct options are selected and zero incorrect options are chosen
                if (!correctSet.isEmpty() && selectedSet.equals(correctSet)) {
                    isCorrect = true;
                    pointsEarned = questionPoints;
                }
            } else {
                // Default fallback: set equality
                if (!correctSet.isEmpty() && selectedSet.equals(correctSet)) {
                    isCorrect = true;
                    pointsEarned = questionPoints;
                }
            }

            totalScore += pointsEarned;

            if (answer != null) {
                answer.setIsCorrect(isCorrect);
                answer.setPointsAwarded(pointsEarned);
            }

            questionDetails.add(QuestionScoreDetailDto.builder()
                    .questionId(qId)
                    .questionType(qType)
                    .candidateSelectedOptionIds(selectedOptionIds)
                    .correctOptionIds(correctOptionIds)
                    .pointsAwarded(pointsEarned)
                    .maxPoints(questionPoints)
                    .isCorrect(isCorrect)
                    .explanation(qKey.getExplanation())
                    .build());
        }

        // Total score calculation
        double percentage = 0.0;
        if (maxScore > 0) {
            percentage = BigDecimal.valueOf((totalScore * 100.0) / maxScore)
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        int passingMarks = attempt.getPassingMarks() != null && attempt.getPassingMarks() > 0
                ? attempt.getPassingMarks()
                : (int) Math.ceil(maxScore * 0.50); // Standard 50% passing marks

        boolean isPassed = totalScore >= passingMarks;

        // Generate receipt if not already present
        if (attempt.getReceiptId() == null || attempt.getReceiptId().isBlank()) {
            String receiptSuffix = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
            attempt.setReceiptId("REC-" + receiptSuffix);
        }

        attempt.setTotalScore(totalScore);
        attempt.setMaxScore(maxScore);
        attempt.setPercentage(percentage);
        attempt.setIsPassed(isPassed);
        attempt.setPassingMarks(passingMarks);

        Instant submittedAt = attempt.getSubmittedAt() != null ? attempt.getSubmittedAt() : Instant.now();
        long durationSpent = Duration.between(attempt.getStartedAt(), submittedAt).getSeconds();
        if (durationSpent < 0) durationSpent = 0;

        String verificationChecksum = ChecksumUtil.generateReceiptChecksum(
                attempt.getReceiptId(),
                attempt.getStudentEmail(),
                attempt.getClientIp(),
                attempt.getExamId().toString(),
                totalScore,
                submittedAt.toString()
        );

        CompletionReceiptDto receipt = CompletionReceiptDto.builder()
                .receiptId(attempt.getReceiptId())
                .studentName(attempt.getStudentName())
                .studentEmail(attempt.getStudentEmail())
                .clientIp(attempt.getClientIp())
                .examTitle(attempt.getExamTitle())
                .submissionTimestamp(submittedAt)
                .status(attempt.getStatus().name())
                .totalScore(totalScore)
                .maxScore(maxScore)
                .percentage(percentage)
                .isPassed(isPassed)
                .verificationChecksum(verificationChecksum)
                .build();

        return ScorecardResponse.builder()
                .attemptId(attempt.getId())
                .examId(attempt.getExamId())
                .examTitle(attempt.getExamTitle())
                .studentName(attempt.getStudentName())
                .studentEmail(attempt.getStudentEmail())
                .clientIp(attempt.getClientIp())
                .totalScore(totalScore)
                .maxScore(maxScore)
                .percentage(percentage)
                .isPassed(isPassed)
                .passingMarks(passingMarks)
                .durationSpentSeconds(durationSpent)
                .startedAt(attempt.getStartedAt())
                .submittedAt(submittedAt)
                .status(attempt.getStatus())
                .completionReceipt(receipt)
                .questionBreakdown(questionDetails)
                .build();
    }
}

