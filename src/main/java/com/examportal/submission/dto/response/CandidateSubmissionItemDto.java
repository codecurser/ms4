package com.examportal.submission.dto.response;

import com.examportal.submission.entity.AttemptStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Creator audit item for a candidate's attempt")
public class CandidateSubmissionItemDto {

    @Schema(description = "Attempt UUID")
    private UUID attemptId;

    @Schema(description = "Candidate full name")
    private String candidateName;

    @Schema(description = "Candidate email address")
    private String candidateEmail;

    @Schema(description = "Real Client IP address captured at session start")
    private String clientIp;

    @Schema(description = "Candidate User-Agent / Browser info")
    private String userAgent;

    @Schema(description = "Exam session start time")
    private Instant startTime;

    @Schema(description = "Submission time (if completed)")
    private Instant submitTime;

    @Schema(description = "Total score achieved")
    private Double score;

    @Schema(description = "Maximum possible exam marks")
    private Integer maxScore;

    @Schema(description = "Percentage achieved")
    private Double percentage;

    @Schema(description = "Pass status")
    private Boolean isPassed;

    @Schema(description = "Current session status: IN_PROGRESS, SUBMITTED, TIMED_OUT")
    private AttemptStatus status;

    @Schema(description = "Total time spent in minutes")
    private Long durationMinutesSpent;
}

