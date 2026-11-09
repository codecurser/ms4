package com.examportal.submission.controller;

import com.examportal.submission.dto.request.SaveAnswerRequest;
import com.examportal.submission.dto.request.StartAttemptRequest;
import com.examportal.submission.dto.response.SaveAnswerResponse;
import com.examportal.submission.dto.response.ScorecardResponse;
import com.examportal.submission.dto.response.StartAttemptResponse;
import com.examportal.submission.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/public/attempts")
@RequiredArgsConstructor
@Tag(name = "Candidate Exam Session Lifecycle", description = "Public candidate exam portal endpoints (start, auto-save, auto-submit, results)")
public class PublicAttemptController {

    private final SubmissionService submissionService;

    @PostMapping("/start")
    @Operation(summary = "Start candidate examination session", description = "Validates exam code with MS2, captures candidate real client IP & browser user-agent, fetches sanitized questions from MS3, and initiates the timed attempt session.")
    public ResponseEntity<StartAttemptResponse> startAttempt(
            @Valid @RequestBody StartAttemptRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("Received request to start exam session for code: {}", request.getExamCode());
        StartAttemptResponse response = submissionService.startAttempt(request, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{attemptId}")
    @Operation(summary = "Get candidate attempt progress", description = "Retrieves current session state, remaining timer seconds, questions, and already saved answers for seamless resume on page reload.")
    public ResponseEntity<StartAttemptResponse> getAttemptProgress(
            @PathVariable UUID attemptId
    ) {
        log.info("Fetching attempt progress for attemptId: {}", attemptId);
        StartAttemptResponse response = submissionService.getAttemptProgress(attemptId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{attemptId}/answers")
    @Operation(summary = "Real-time answer auto-save", description = "Auto-saves candidate choices immediately as options are clicked; ensures no progress is lost on page refresh or network glitch.")
    public ResponseEntity<SaveAnswerResponse> saveAnswer(
            @PathVariable UUID attemptId,
            @Valid @RequestBody SaveAnswerRequest request
    ) {
        SaveAnswerResponse response = submissionService.saveAnswer(attemptId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{attemptId}/submit")
    @Operation(summary = "Final exam submission & instant auto-grading", description = "Submits exam either on manual user click or automatically when timer reaches 00:00 (with 30s grace period). Fetches answer key from MS3 and instantly auto-grades.")
    public ResponseEntity<ScorecardResponse> submitAttempt(
            @PathVariable UUID attemptId
    ) {
        log.info("Final submission initiated for attemptId: {}", attemptId);
        ScorecardResponse scorecard = submissionService.submitAttempt(attemptId);
        return ResponseEntity.ok(scorecard);
    }

    @GetMapping("/{attemptId}/result")
    @Operation(summary = "Get candidate scorecard & completion receipt", description = "Returns score, percentage, pass/fail status, duration spent, and official completion receipt displaying candidate Name, Email, and recorded Client IP.")
    public ResponseEntity<ScorecardResponse> getAttemptResult(
            @PathVariable UUID attemptId
    ) {
        log.info("Retrieving scorecard for attemptId: {}", attemptId);
        ScorecardResponse scorecard = submissionService.getAttemptResult(attemptId);
        return ResponseEntity.ok(scorecard);
    }
}

