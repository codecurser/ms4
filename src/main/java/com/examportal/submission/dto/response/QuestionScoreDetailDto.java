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
@Schema(description = "Grading breakdown item for an individual question")
public class QuestionScoreDetailDto {

    @Schema(description = "Question ID")
    private UUID questionId;

    @Schema(description = "Question prompt text")
    private String questionText;

    @Schema(description = "Question type")
    private String questionType;

    @Schema(description = "Candidate selected option UUIDs")
    private List<UUID> candidateSelectedOptionIds;

    @Schema(description = "Correct option UUIDs from answer key")
    private List<UUID> correctOptionIds;

    @Schema(description = "Points awarded for this question")
    private int pointsAwarded;

    @Schema(description = "Maximum points possible for this question")
    private int maxPoints;

    @Schema(description = "Whether the question was answered correctly")
    private Boolean isCorrect;

    @Schema(description = "Explanation of the correct answer")
    private String explanation;
}

