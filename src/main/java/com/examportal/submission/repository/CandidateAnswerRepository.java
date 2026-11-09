package com.examportal.submission.repository;

import com.examportal.submission.entity.CandidateAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateAnswerRepository extends JpaRepository<CandidateAnswer, UUID> {

    List<CandidateAnswer> findByAttemptId(UUID attemptId);

    Optional<CandidateAnswer> findByAttemptIdAndQuestionId(UUID attemptId, UUID questionId);
}

