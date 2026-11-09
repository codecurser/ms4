package com.examportal.submission.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request body to initiate an exam attempt session with mandatory candidate tracking")
public class StartAttemptRequest {

    @NotBlank(message = "Exam code is required")
    @Schema(description = "Exam code or UUID", example = "EXAM-A1B2C3D4")
    private String examCode;

    @NotBlank(message = "Candidate full name is required")
    @Schema(description = "Candidate full name", example = "John Doe")
    private String studentName;

    @NotBlank(message = "Candidate email address is required")
    @Email(message = "Candidate email must be valid")
    @Schema(description = "Candidate email address", example = "john@example.com")
    private String studentEmail;
}

