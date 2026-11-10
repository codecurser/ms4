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

    public Ms2ExamResponse validateAndGetExam(String rawExamCode) {
        if (rawExamCode == null || rawExamCode.isBlank()) {
            throw new ExamValidationException("Exam code or share link must not be empty");
        }

        // Clean and extract actual exam code or UUID if a full share link / URL was provided
        String cleanCode = extractExamCode(rawExamCode);
        log.info("Validating exam with MS2 for raw input '{}' extracted code '{}'", rawExamCode, cleanCode);

        // 1. Try: /api/v1/public/exams/{shareCode} (Standard MS2 endpoint)
        String directEndpoint = ms2BaseUrl + "/api/v1/public/exams/" + cleanCode;
        try {
            Ms2ExamResponse exam = restClient.get()
                    .uri(directEndpoint)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, resp) -> {
                        log.debug("MS2 direct endpoint returned client status: {}", resp.getStatusCode());
                    })
                    .body(Ms2ExamResponse.class);

            if (exam != null && exam.getExamId() != null) {
                validateExamStatus(exam);
                return exam;
            }
        } catch (ExamValidationException eve) {
            throw eve;
        } catch (Exception e) {
            log.info("MS2 /api/v1/public/exams/{} attempt: {}", cleanCode, e.getMessage());
        }

        // 2. Try: /api/v1/public/exams/share/{shareCode}
        String shareEndpoint = ms2BaseUrl + "/api/v1/public/exams/share/" + cleanCode;
        try {
            Ms2ExamResponse exam = restClient.get()
                    .uri(shareEndpoint)
                    .retrieve()
                    .body(Ms2ExamResponse.class);

            if (exam != null && exam.getExamId() != null) {
                validateExamStatus(exam);
                return exam;
            }
        } catch (ExamValidationException eve) {
            throw eve;
        } catch (Exception e) {
            log.info("MS2 /share endpoint attempt failed: {}", e.getMessage());
        }

        // If neither worked, provide clear, descriptive error
        throw new ExamValidationException(
                "Exam not found or inactive for code/link '" + cleanCode + "'. " +
                "Please verify the share code in MS2 or ensure the exam is PUBLISHED."
        );
    }

    /**
     * Sanitizes raw exam input. If candidate pasted a full share URL like:
     * - https://ms2-w51n.onrender.com/api/v1/public/exams/share/EXAM-1234
     * - http://localhost:5173/exam?code=EXAM-1234
     * - /share/EXAM-1234
     * Extracts just 'EXAM-1234'.
     */
    public static String extractExamCode(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String clean = input.trim();

        // Strip trailing slashes
        while (clean.endsWith("/")) {
            clean = clean.substring(0, clean.length() - 1);
        }

        // 1. Check query parameter ?code= or ?examCode= or ?shareCode=
        if (clean.contains("?")) {
            String[] parts = clean.split("\\?", 2);
            clean = parts[0];
            String query = parts[1];
            for (String param : query.split("&")) {
                String[] pair = param.split("=", 2);
                if (pair.length == 2) {
                    String key = pair[0].toLowerCase();
                    if ("code".equals(key) || "examcode".equals(key) || "sharecode".equals(key)) {
                        return pair[1].trim();
                    }
                }
            }
        }

        // 2. If it's a URL or contains slashes, take the last non-empty segment
        if (clean.contains("/")) {
            String[] segments = clean.split("/");
            for (int i = segments.length - 1; i >= 0; i--) {
                String seg = segments[i].trim();
                if (!seg.isEmpty()
                        && !"share".equalsIgnoreCase(seg)
                        && !"exams".equalsIgnoreCase(seg)
                        && !"exam".equalsIgnoreCase(seg)
                        && !"public".equalsIgnoreCase(seg)) {
                    return seg;
                }
            }
        }

        return clean;
    }

    private void validateExamStatus(Ms2ExamResponse exam) {
        if (exam.getStatus() != null) {
            String status = exam.getStatus().toUpperCase();
            if ("DRAFT".equals(status)) {
                throw new ExamValidationException("This examination is currently in draft mode and has not been published yet.");
            }
            if ("ARCHIVED".equals(status) || "CLOSED".equals(status)) {
                throw new ExamValidationException("This examination has closed or been archived.");
            }
        }

        if (exam.getDurationMinutes() == null || exam.getDurationMinutes() <= 0) {
            exam.setDurationMinutes(60);
        }
    }
}
