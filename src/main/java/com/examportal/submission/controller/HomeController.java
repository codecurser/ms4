package com.examportal.submission.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "service", "submission-service",
                "version", "1.0.0",
                "status", "UP",
                "description", "Online Examination Portal - Candidate Exam Taker & Auto-Grading Portal (MS4)",
                "documentation", "/swagger-ui.html",
                "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping({"/health", "/actuator/health"})
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "submission-service",
                "timestamp", Instant.now().toString()
        ));
    }
}

