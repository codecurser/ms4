package com.examportal.submission.service;

import com.examportal.submission.dto.response.ExamAnswerKeyDto;
import com.examportal.submission.dto.response.QuestionAnswerKeyDto;
import com.examportal.submission.dto.response.ScorecardResponse;
import com.examportal.submission.entity.AttemptStatus;
import com.examportal.submission.entity.CandidateAnswer;
import com.examportal.submission.entity.SubmissionAttempt;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GradingServiceTest {

    private final GradingService gradingService = new GradingService();

    @Test
    @DisplayName("Should correctly grade SINGLE_CHOICE, MULTIPLE_CHOICE, and TRUE_FALSE questions")
    void testGradingLogic() {
        UUID q1Id = UUID.randomUUID();
        UUID q1CorrectOpt = UUID.randomUUID();
        UUID q1WrongOpt = UUID.randomUUID();

        UUID q2Id = UUID.randomUUID();
        UUID q2CorrectOpt1 = UUID.randomUUID();
        UUID q2CorrectOpt2 = UUID.randomUUID();
        UUID q2WrongOpt = UUID.randomUUID();

        UUID q3Id = UUID.randomUUID();
        UUID q3CorrectOpt = UUID.randomUUID();

        ExamAnswerKeyDto answerKey = ExamAnswerKeyDto.builder()
                .examId(UUID.randomUUID())
                .totalQuestions(3)
                .totalPoints(6)
                .questions(List.of(
                        // Q1: SINGLE_CHOICE (2 points)
                        QuestionAnswerKeyDto.builder()
                                .questionId(q1Id)
                                .questionType("SINGLE_CHOICE")
                                .points(2)
                                .correctOptionIds(List.of(q1CorrectOpt))
                                .build(),
                        // Q2: MULTIPLE_CHOICE (3 points)
                        QuestionAnswerKeyDto.builder()
                                .questionId(q2Id)
                                .questionType("MULTIPLE_CHOICE")
                                .points(3)
                                .correctOptionIds(List.of(q2CorrectOpt1, q2CorrectOpt2))
                                .build(),
                        // Q3: TRUE_FALSE (1 point)
                        QuestionAnswerKeyDto.builder()
                                .questionId(q3Id)
                                .questionType("TRUE_FALSE")
                                .points(1)
                                .correctOptionIds(List.of(q3CorrectOpt))
                                .build()
                ))
                .build();

        SubmissionAttempt attempt = SubmissionAttempt.builder()
                .id(UUID.randomUUID())
                .examId(answerKey.getExamId())
                .studentName("Alice Smith")
                .studentEmail("alice@example.com")
                .clientIp("198.51.100.22")
                .examTitle("Java Certification")
                .startedAt(Instant.now().minusSeconds(1200))
                .submittedAt(Instant.now())
                .status(AttemptStatus.SUBMITTED)
                .answers(new ArrayList<>())
                .build();

        // Q1: Candidate chose correct option -> 2 points
        CandidateAnswer a1 = CandidateAnswer.builder()
                .attempt(attempt)
                .questionId(q1Id)
                .build();
        a1.setSelectedOptionIdList(List.of(q1CorrectOpt));
        attempt.addAnswer(a1);

        // Q2: Candidate chose both correct options -> 3 points
        CandidateAnswer a2 = CandidateAnswer.builder()
                .attempt(attempt)
                .questionId(q2Id)
                .build();
        a2.setSelectedOptionIdList(List.of(q2CorrectOpt1, q2CorrectOpt2));
        attempt.addAnswer(a2);

        // Q3: Candidate did not answer or chose wrong -> 0 points
        CandidateAnswer a3 = CandidateAnswer.builder()
                .attempt(attempt)
                .questionId(q3Id)
                .build();
        a3.setSelectedOptionIdList(List.of(UUID.randomUUID())); // wrong option
        attempt.addAnswer(a3);

        ScorecardResponse result = gradingService.gradeAttempt(attempt, answerKey);

        assertEquals(5.0, result.getTotalScore());
        assertEquals(6, result.getMaxScore());
        assertEquals(83.33, result.getPercentage());
        assertTrue(result.getIsPassed()); // 5 >= 3 (50% passing)
        assertNotNull(result.getCompletionReceipt());
        assertEquals("Alice Smith", result.getCompletionReceipt().getStudentName());
        assertEquals("198.51.100.22", result.getCompletionReceipt().getClientIp());
        assertNotNull(result.getCompletionReceipt().getVerificationChecksum());
    }

    @Test
    @DisplayName("MULTIPLE_CHOICE must award 0 if candidate selects only partial correct answers")
    void testMultipleChoicePartialAwardZero() {
        UUID qId = UUID.randomUUID();
        UUID correct1 = UUID.randomUUID();
        UUID correct2 = UUID.randomUUID();

        ExamAnswerKeyDto answerKey = ExamAnswerKeyDto.builder()
                .examId(UUID.randomUUID())
                .totalQuestions(1)
                .totalPoints(4)
                .questions(List.of(
                        QuestionAnswerKeyDto.builder()
                                .questionId(qId)
                                .questionType("MULTIPLE_CHOICE")
                                .points(4)
                                .correctOptionIds(List.of(correct1, correct2))
                                .build()
                ))
                .build();

        SubmissionAttempt attempt = SubmissionAttempt.builder()
                .id(UUID.randomUUID())
                .examId(answerKey.getExamId())
                .studentName("Bob")
                .studentEmail("bob@example.com")
                .clientIp("10.0.0.5")
                .startedAt(Instant.now().minusSeconds(300))
                .submittedAt(Instant.now())
                .status(AttemptStatus.SUBMITTED)
                .answers(new ArrayList<>())
                .build();

        // Candidate chose only one of the two correct options
        CandidateAnswer a = CandidateAnswer.builder()
                .attempt(attempt)
                .questionId(qId)
                .build();
        a.setSelectedOptionIdList(List.of(correct1));
        attempt.addAnswer(a);

        ScorecardResponse result = gradingService.gradeAttempt(attempt, answerKey);

        assertEquals(0.0, result.getTotalScore());
        assertEquals(4, result.getMaxScore());
        assertEquals(0.0, result.getPercentage());
        assertFalse(result.getIsPassed());
    }
}

