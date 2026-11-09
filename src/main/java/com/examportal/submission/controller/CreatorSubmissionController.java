package com.examportal.submission.controller;

import com.examportal.submission.dto.response.CreatorSubmissionsResponse;
import com.examportal.submission.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
@Tag(name = "Creator Audit & Analytics", description = "Protected endpoints for exam creators to audit candidate submissions and monitor real-time exam attempts")
@SecurityRequirement(name = "Bearer Authentication")
public class CreatorSubmissionController {

    private final SubmissionService submissionService;

    @GetMapping("/{examId}/submissions")
    @PreAuthorize("hasAnyAuthority('ROLE_CREATOR', 'CREATOR', 'ROLE_USER', 'USER', 'ROLE_ADMIN', 'ADMIN')")
    @Operation(summary = "Audit exam submissions", description = "Protected endpoint (MS1 Bearer JWT) allowing creators to audit all candidate attempts, displaying Candidate Name, Email, Client IP, Start Time, Submit Time, Score, and Status.")
    public ResponseEntity<CreatorSubmissionsResponse> getExamSubmissions(
            @PathVariable UUID examId
    ) {
        log.info("Creator requested submissions audit for examId: {}", examId);
        CreatorSubmissionsResponse response = submissionService.getExamSubmissions(examId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{examId}/submissions/export")
    @PreAuthorize("hasAnyAuthority('ROLE_CREATOR', 'CREATOR', 'ROLE_USER', 'USER', 'ROLE_ADMIN', 'ADMIN')")
    @Operation(summary = "Export submissions audit log as CSV", description = "Exports all candidate submissions with IP address, timestamps, and scores in CSV format.")
    public ResponseEntity<byte[]> exportSubmissionsCsv(
            @PathVariable UUID examId
    ) {
        log.info("Exporting submissions CSV for examId: {}", examId);
        String csvData = submissionService.exportExamSubmissionsCsv(examId);
        byte[] bytes = csvData.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"exam-" + examId + "-submissions.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }
}

