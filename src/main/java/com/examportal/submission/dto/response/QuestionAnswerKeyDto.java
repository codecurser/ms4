package com.examportal.submission.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class QuestionAnswerKeyDto {

    private UUID questionId;
    private String questionType;
    private int points;
    private int orderIndex;
    private String explanation;
    private List<UUID> correctOptionIds;
}

