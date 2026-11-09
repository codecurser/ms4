package com.examportal.submission.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
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
@Schema(description = "Real-time answer auto-save request payload")
public class SaveAnswerRequest {

    @NotNull(message = "Question ID is required")
    @Schema(description = "Question UUID being answered")
    private UUID questionId;

    @Schema(description = "List of selected option UUIDs (empty if candidate clears selection)")
    private List<UUID> selectedOptionIds;
}

