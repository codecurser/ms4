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
public class ExamAnswerKeyDto {

    private UUID examId;
    private int totalQuestions;
    private int totalPoints;
    private List<QuestionAnswerKeyDto> questions;
}

