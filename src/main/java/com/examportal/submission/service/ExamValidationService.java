package com.examportal.submission.service;

import com.examportal.submission.dto.response.Ms2ExamResponse;
import com.examportal.submission.exception.ExamValidationException;
import com.examportal.submission.exception.ExternalServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExamValidationService {

    private final RestClient restClient;

    @Value("${services.ms2.url:https://ms2-w51n.onrender.com}")
    private String ms2BaseUrl;

    public Ms2ExamResponse validateAndGetExam(String examCode) {
        if (examCode == null || examCode.isBlank()) {
            throw new ExamValidationException("Exam code must not be empty");
        }

        String cleanCode = examCode.trim();
        log.info("Validating exam with MS2 for code/link: {}", cleanCode);

        // First attempt: /api/v1/public/exams/share/{examCode}
        String shareEndpoint = ms2BaseUrl + "/api/v1/public/exams/share/" + cleanCode;
        try {
            Ms2ExamResponse exam = restClient.get()
                    .uri(shareEndpoint)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, resp) -> {
                        log.debug("MS2 /share endpoint returned client status: {}", resp.getStatusCode());
                    })
                    .body(Ms2ExamResponse.class);

            if (exam != null && exam.getExamId() != null) {
                validateExamStatus(exam);
                return exam;
            }
        } catch (ExamValidationException eve) {
            throw eve;
        } catch (Exception e) {
            log.info("MS2 /share endpoint attempt failed ({}), trying /api/v1/public/exams/{}", e.getMessage(), cleanCode);
        }

        // Fallback attempt: /api/v1/public/exams/{examCode}
        String fallbackEndpoint = ms2BaseUrl + "/api/v1/public/exams/" + cleanCode;
        try {
            Ms2ExamResponse exam = restClient.get()
                    .uri(fallbackEndpoint)
                    .retrieve()
                    .body(Ms2ExamResponse.class);

            if (exam == null || exam.getExamId() == null) {
                throw new ExamValidationException("Exam not found or inactive for code: " + cleanCode);
            }

            validateExamStatus(exam);
            return exam;
        } catch (ExamValidationException eve) {
            throw eve;
        } catch (Exception e) {
            log.error("Failed to reach MS2 Exam Service at {}: {}", ms2BaseUrl, e.getMessage());
            throw new ExternalServiceException("Unable to validate examination with MS2 service. Please ensure the exam code is correct or retry shortly.", e);
        }
    }

    private void validateExamStatus(Ms2ExamResponse exam) {
        if (exam.getStatus() != null) {
            String status = exam.getStatus().toUpperCase();
            if ("DRAFT".equals(status)) {
                throw new ExamValidationException("This examination is currently a draft and has not been published yet.");
            }
            if ("ARCHIVED".equals(status) || "CLOSED".equals(status)) {
                throw new ExamValidationException("This examination has closed or been archived.");
            }
        }

        if (exam.getDurationMinutes() == null || exam.getDurationMinutes() <= 0) {
            exam.setDurationMinutes(60); // sensible default if unspecified
        }
    }
}

