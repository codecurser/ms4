package com.examportal.submission.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Standard API error response")
public class ErrorResponse {

    @Schema(description = "HTTP status code", example = "400")
    private int status;

    @Schema(description = "HTTP error title", example = "Bad Request")
    private String error;

    @Schema(description = "Human-readable error explanation", example = "Exam not found or inactive")
    private String message;

    @Schema(description = "Request URI path", example = "/api/v1/public/attempts/start")
    private String path;

    @Schema(description = "Timestamp when error occurred")
    private Instant timestamp;

    @Schema(description = "Optional list of detailed field validation error messages")
    private List<String> details;
}

