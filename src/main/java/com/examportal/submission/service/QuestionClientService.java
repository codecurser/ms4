package com.examportal.submission.service;

import com.examportal.submission.dto.response.ExamAnswerKeyDto;
import com.examportal.submission.dto.response.PublicQuestionDto;
import com.examportal.submission.exception.ExternalServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionClientService {

    private final RestClient restClient;

    @Value("${services.ms3.url:https://ms3-1.onrender.com}")
    private String ms3BaseUrl;

    public List<PublicQuestionDto> getPublicQuestions(UUID examId) {
        log.info("Fetching public questions from MS3 for examId: {}", examId);
        String endpoint = ms3BaseUrl + "/api/v1/public/exams/" + examId + "/questions";

        try {
            List<PublicQuestionDto> questions = restClient.get()
                    .uri(endpoint)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<PublicQuestionDto>>() {});

            return questions != null ? questions : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to fetch sanitized questions from MS3 at {}: {}", endpoint, e.getMessage());
            throw new ExternalServiceException("Failed to retrieve exam questions from MS3 service. " + e.getMessage(), e);
        }
    }

    public ExamAnswerKeyDto getExamAnswerKey(UUID examId) {
        log.info("Fetching answer key from MS3 internal endpoint for examId: {}", examId);
        String endpoint = ms3BaseUrl + "/api/v1/internal/exams/" + examId + "/answer-key";

        try {
            ExamAnswerKeyDto answerKey = restClient.get()
                    .uri(endpoint)
                    .retrieve()
                    .body(ExamAnswerKeyDto.class);

            if (answerKey == null) {
                throw new ExternalServiceException("Received empty answer key from MS3 for exam: " + examId);
            }
            return answerKey;
        } catch (Exception e) {
            log.error("Failed to fetch answer key from MS3 at {}: {}", endpoint, e.getMessage());
            throw new ExternalServiceException("Failed to retrieve exam answer key for auto-grading from MS3. " + e.getMessage(), e);
        }
    }
}

