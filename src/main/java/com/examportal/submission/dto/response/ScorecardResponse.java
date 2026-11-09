package com.examportal.submission.dto.response;

import com.examportal.submission.entity.AttemptStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Candidate scorecard result including scores, pass/fail status, and completion receipt")
public class ScorecardResponse {

    @Schema(description = "Attempt UUID")
    private UUID attemptId;

    @Schema(description = "Exam UUID")
    private UUID examId;

    @Schema(description = "Exam title")
    private String examTitle;

    @Schema(description = "Candidate full name")
    private String studentName;

    @Schema(description = "Candidate email address")
    private String studentEmail;

    @Schema(description = "Candidate recorded Client IP address")
    private String clientIp;

    @Schema(description = "Candidate total earned score")
    private Double totalScore;

    @Schema(description = "Total possible exam score")
    private Integer maxScore;

    @Schema(description = "Percentage score")
    private Double percentage;

    @Schema(description = "Whether the candidate met or exceeded passing marks")
    private Boolean isPassed;

    @Schema(description = "Minimum score required to pass")
    private Integer passingMarks;

    @Schema(description = "Duration spent in seconds")
    private Long durationSpentSeconds;

    @Schema(description = "Attempt start timestamp")
    private Instant startedAt;

    @Schema(description = "Attempt submission timestamp")
    private Instant submittedAt;

    @Schema(description = "Final attempt status")
    private AttemptStatus status;

    @Schema(description = "Official completion receipt")
    private CompletionReceiptDto completionReceipt;

    @Schema(description = "Optional question-by-question scoring breakdown")
    private List<QuestionScoreDetailDto> questionBreakdown;
}

