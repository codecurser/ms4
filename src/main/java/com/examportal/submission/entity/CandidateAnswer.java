package com.examportal.submission.entity;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "candidate_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateAnswer {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private SubmissionAttempt attempt;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "selected_option_ids", nullable = false, columnDefinition = "TEXT")
    private String selectedOptionIds;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "points_awarded")
    @Builder.Default
    private int pointsAwarded = 0;

    @Column(name = "answered_at", nullable = false)
    private Instant answeredAt;

    @PrePersist
    protected void onCreate() {
        if (this.answeredAt == null) {
            this.answeredAt = Instant.now();
        }
    }

    public List<UUID> getSelectedOptionIdList() {
        if (selectedOptionIds == null || selectedOptionIds.isBlank()) {
            return Collections.emptyList();
        }
        try {
            List<String> raw = MAPPER.readValue(selectedOptionIds, new TypeReference<List<String>>() {});
            List<UUID> list = new ArrayList<>();
            for (String s : raw) {
                if (s != null && !s.isBlank()) {
                    list.add(UUID.fromString(s.trim()));
                }
            }
            return list;
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    public void setSelectedOptionIdList(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            this.selectedOptionIds = "[]";
            return;
        }
        try {
            List<String> strList = ids.stream().map(UUID::toString).toList();
            this.selectedOptionIds = MAPPER.writeValueAsString(strList);
        } catch (Exception e) {
            this.selectedOptionIds = "[]";
        }
    }
}

