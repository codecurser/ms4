package com.examportal.submission.repository;

import com.examportal.submission.entity.AttemptStatus;
import com.examportal.submission.entity.SubmissionAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubmissionAttemptRepository extends JpaRepository<SubmissionAttempt, UUID> {

    List<SubmissionAttempt> findByExamIdOrderByStartedAtDesc(UUID examId);

    Optional<SubmissionAttempt> findFirstByExamCodeAndStudentEmailAndStatusOrderByStartedAtDesc(
            String examCode,
            String studentEmail,
            AttemptStatus status
    );

    Optional<SubmissionAttempt> findFirstByExamIdAndStudentEmailAndStatusOrderByStartedAtDesc(
            UUID examId,
            String studentEmail,
            AttemptStatus status
    );

    long countByExamId(UUID examId);

    long countByExamIdAndStatus(UUID examId, AttemptStatus status);

    long countByExamIdAndIsPassed(UUID examId, Boolean isPassed);

    @Query("SELECT AVG(s.totalScore) FROM SubmissionAttempt s WHERE s.examId = :examId AND s.status IN ('SUBMITTED', 'TIMED_OUT')")
    Double findAverageScoreByExamId(@Param("examId") UUID examId);

    @Query("SELECT AVG(s.percentage) FROM SubmissionAttempt s WHERE s.examId = :examId AND s.status IN ('SUBMITTED', 'TIMED_OUT')")
    Double findAveragePercentageByExamId(@Param("examId") UUID examId);
}

