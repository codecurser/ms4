package com.examportal.submission.dto.response;

import com.examportal.submission.entity.AttemptStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response returned upon starting an exam attempt session")
public class StartAttemptResponse {

    @Schema(description = "Unique attempt identifier")
    private UUID attemptId;

    @Schema(description = "Exam unique identifier")
    private UUID examId;

    @Schema(description = "Exam title")
    private String examTitle;

    @Schema(description = "Candidate full name")
    private String studentName;

    @Schema(description = "Candidate email address")
    private String studentEmail;

    @Schema(description = "Candidate recorded Client IP address")
    private String clientIp;

    @Schema(description = "Exam total duration in minutes")
    private Integer durationMinutes;

    @Schema(description = "Remaining time in seconds until expiration")
    private long remainingSeconds;

    @Schema(description = "Session start timestamp")
    private Instant startedAt;

    @Schema(description = "Session expiration timestamp")
    private Instant expiresAt;

    @Schema(description = "Attempt session status")
    private AttemptStatus status;

    @Schema(description = "Sanitized exam questions for student test taker")
    private List<PublicQuestionDto> questions;

    @Schema(description = "Map of previously saved answers for this attempt (questionId -> list of selectedOptionIds)")
    private Map<UUID, List<UUID>> savedAnswers;
}

