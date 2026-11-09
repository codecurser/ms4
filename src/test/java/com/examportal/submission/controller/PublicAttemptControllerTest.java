package com.examportal.submission.controller;

import com.examportal.submission.dto.request.SaveAnswerRequest;
import com.examportal.submission.dto.request.StartAttemptRequest;
import com.examportal.submission.dto.response.CompletionReceiptDto;
import com.examportal.submission.dto.response.SaveAnswerResponse;
import com.examportal.submission.dto.response.ScorecardResponse;
import com.examportal.submission.dto.response.StartAttemptResponse;
import com.examportal.submission.entity.AttemptStatus;
import com.examportal.submission.exception.GlobalExceptionHandler;
import com.examportal.submission.service.SubmissionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PublicAttemptControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private final UUID attemptId = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private final UUID examId = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private final UUID questionId = UUID.fromString("33333333-3333-3333-3333-333333333333");
    private final UUID optionId = UUID.fromString("44444444-4444-4444-4444-444444444444");

    @BeforeEach
    void setUp() {
        SubmissionService stubService = new SubmissionService(null, null, null, null, null) {
            @Override
            public StartAttemptResponse startAttempt(StartAttemptRequest request, HttpServletRequest httpRequest) {
                return StartAttemptResponse.builder()
                        .attemptId(attemptId)
                        .examId(examId)
                        .examTitle("Java 21 Assessment")
                        .studentName(request.getStudentName())
                        .studentEmail(request.getStudentEmail())
                        .clientIp("203.0.113.1")
                        .durationMinutes(60)
                        .remainingSeconds(3600)
                        .startedAt(Instant.now())
                        .expiresAt(Instant.now().plusSeconds(3600))
                        .status(AttemptStatus.IN_PROGRESS)
                        .questions(Collections.emptyList())
                        .savedAnswers(Collections.emptyMap())
                        .build();
            }

            @Override
            public SaveAnswerResponse saveAnswer(UUID aId, SaveAnswerRequest req) {
                return SaveAnswerResponse.builder()
                        .attemptId(aId)
                        .questionId(req.getQuestionId())
                        .selectedOptionIds(req.getSelectedOptionIds())
                        .answeredQuestionsCount(1)
                        .savedAt(Instant.now())
                        .build();
            }

            @Override
            public ScorecardResponse submitAttempt(UUID aId) {
                CompletionReceiptDto receipt = CompletionReceiptDto.builder()
                        .receiptId("REC-TEST123456")
                        .studentName("Jane Doe")
                        .studentEmail("jane@example.com")
                        .clientIp("203.0.113.1")
                        .examTitle("Java 21 Assessment")
                        .submissionTimestamp(Instant.now())
                        .status("SUBMITTED")
                        .totalScore(10.0)
                        .maxScore(10)
                        .percentage(100.0)
                        .isPassed(true)
                        .verificationChecksum("A1B2C3D4E5F6")
                        .build();

                return ScorecardResponse.builder()
                        .attemptId(aId)
                        .examId(examId)
                        .examTitle("Java 21 Assessment")
                        .studentName("Jane Doe")
                        .studentEmail("jane@example.com")
                        .clientIp("203.0.113.1")
                        .totalScore(10.0)
                        .maxScore(10)
                        .percentage(100.0)
                        .isPassed(true)
                        .passingMarks(5)
                        .durationSpentSeconds(1500L)
                        .startedAt(Instant.now().minusSeconds(1500))
                        .submittedAt(Instant.now())
                        .status(AttemptStatus.SUBMITTED)
                        .completionReceipt(receipt)
                        .build();
            }

            @Override
            public ScorecardResponse getAttemptResult(UUID aId) {
                return ScorecardResponse.builder()
                        .attemptId(aId)
                        .studentName("Jane Doe")
                        .studentEmail("jane@example.com")
                        .clientIp("203.0.113.1")
                        .totalScore(9.0)
                        .maxScore(10)
                        .percentage(90.0)
                        .isPassed(true)
                        .status(AttemptStatus.SUBMITTED)
                        .build();
            }
        };

        PublicAttemptController controller = new PublicAttemptController(stubService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/v1/public/attempts/start should start session and extract client IP")
    void testStartAttempt() throws Exception {
        StartAttemptRequest request = StartAttemptRequest.builder()
                .examCode("EXAM-TEST-1234")
                .studentName("Jane Doe")
                .studentEmail("jane@example.com")
                .build();

        mockMvc.perform(post("/api/v1/public/attempts/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Forwarded-For", "203.0.113.1")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.attemptId").value(attemptId.toString()))
                .andExpect(jsonPath("$.studentName").value("Jane Doe"))
                .andExpect(jsonPath("$.clientIp").value("203.0.113.1"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    @DisplayName("PUT /api/v1/public/attempts/{attemptId}/answers should auto-save answer")
    void testSaveAnswer() throws Exception {
        SaveAnswerRequest request = SaveAnswerRequest.builder()
                .questionId(questionId)
                .selectedOptionIds(List.of(optionId))
                .build();

        mockMvc.perform(put("/api/v1/public/attempts/" + attemptId + "/answers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questionId").value(questionId.toString()))
                .andExpect(jsonPath("$.answeredQuestionsCount").value(1));
    }

    @Test
    @DisplayName("POST /api/v1/public/attempts/{attemptId}/submit should grade and return scorecard")
    void testSubmitAttempt() throws Exception {
        mockMvc.perform(post("/api/v1/public/attempts/" + attemptId + "/submit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isPassed").value(true))
                .andExpect(jsonPath("$.percentage").value(100.0))
                .andExpect(jsonPath("$.completionReceipt.receiptId").value("REC-TEST123456"))
                .andExpect(jsonPath("$.completionReceipt.clientIp").value("203.0.113.1"));
    }

    @Test
    @DisplayName("GET /api/v1/public/attempts/{attemptId}/result should return scorecard")
    void testGetResult() throws Exception {
        mockMvc.perform(get("/api/v1/public/attempts/" + attemptId + "/result"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.percentage").value(90.0))
                .andExpect(jsonPath("$.studentName").value("Jane Doe"));
    }
}
