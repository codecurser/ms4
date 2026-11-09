package com.examportal.submission.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Official examination completion receipt and proctoring verification")
public class CompletionReceiptDto {

    @Schema(description = "Unique completion receipt reference ID", example = "REC-9A2F8D1E4C")
    private String receiptId;

    @Schema(description = "Candidate full name")
    private String studentName;

    @Schema(description = "Candidate email address")
    private String studentEmail;

    @Schema(description = "Candidate recorded Client IP address")
    private String clientIp;

    @Schema(description = "Examination title")
    private String examTitle;

    @Schema(description = "Official submission timestamp (UTC)")
    private Instant submissionTimestamp;

    @Schema(description = "Attempt status at completion")
    private String status;

    @Schema(description = "Total score achieved")
    private Double totalScore;

    @Schema(description = "Maximum possible marks")
    private Integer maxScore;

    @Schema(description = "Percentage achieved")
    private Double percentage;

    @Schema(description = "Whether candidate passed the examination")
    private Boolean isPassed;

    @Schema(description = "Cryptographic SHA-256 tamper-proof verification checksum")
    private String verificationChecksum;
}

