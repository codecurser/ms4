package com.examportal.submission.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Creator audit and analytics response for an examination")
public class CreatorSubmissionsResponse {

    @Schema(description = "Exam UUID")
    private UUID examId;

    @Schema(description = "Aggregated performance and participation analytics")
    private SubmissionsAnalyticsDto analytics;

    @Schema(description = "List of all candidate attempts with IP tracking and scores")
    private List<CandidateSubmissionItemDto> submissions;
}

