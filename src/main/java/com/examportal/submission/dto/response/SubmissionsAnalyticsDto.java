package com.examportal.submission.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Aggregated exam submissions analytics for exam creators")
public class SubmissionsAnalyticsDto {

    @Schema(description = "Total number of candidate attempts recorded")
    private long totalAttempts;

    @Schema(description = "Number of successfully submitted attempts")
    private long submittedCount;

    @Schema(description = "Number of ongoing attempts currently in progress")
    private long inProgressCount;

    @Schema(description = "Number of attempts that timed out")
    private long timedOutCount;

    @Schema(description = "Total candidates who passed")
    private long passedCount;

    @Schema(description = "Total candidates who failed")
    private long failedCount;

    @Schema(description = "Average score achieved across submitted exams")
    private Double averageScore;

    @Schema(description = "Average percentage achieved across submitted exams")
    private Double averagePercentage;

    @Schema(description = "Pass rate percentage", example = "78.5")
    private Double passRate;
}

