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
@Schema(description = "Public exam question without answer keys")
public class PublicQuestionDto {

    @Schema(description = "Question UUID")
    private UUID id;

    @Schema(description = "Exam UUID")
    private UUID examId;

    @Schema(description = "Question text prompt")
    private String questionText;

    @Schema(description = "Question type: SINGLE_CHOICE, MULTIPLE_CHOICE, or TRUE_FALSE")
    private String questionType;

    @Schema(description = "Points for answering correctly")
    private int points;

    @Schema(description = "Order sequence of question")
    private int orderIndex;

    @Schema(description = "List of options for this question")
    private List<PublicOptionDto> options;
}

