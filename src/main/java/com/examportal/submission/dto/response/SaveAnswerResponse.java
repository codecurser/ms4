package com.examportal.submission.dto.response;

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
@Schema(description = "Confirmation response after saving an answer")
public class SaveAnswerResponse {

    @Schema(description = "Attempt UUID")
    private UUID attemptId;

    @Schema(description = "Question UUID")
    private UUID questionId;

    @Schema(description = "Persisted list of selected option UUIDs")
    private List<UUID> selectedOptionIds;

    @Schema(description = "Total number of questions answered so far in this attempt")
    private int answeredQuestionsCount;

    @Schema(description = "Timestamp when the answer was persisted")
    private Instant savedAt;
}

