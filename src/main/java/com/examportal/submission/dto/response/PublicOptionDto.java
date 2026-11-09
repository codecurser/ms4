package com.examportal.submission.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Public option view without correct answers")
public class PublicOptionDto {

    @Schema(description = "Option unique identifier")
    private UUID id;

    @Schema(description = "Option text")
    private String optionText;

    @Schema(description = "Display order of option")
    private int orderIndex;
}

