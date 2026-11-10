-- ============================================================================
-- Microservice 4 (MS4: submission-service) - Database Schema
-- Online Examination Portal
-- Neon PostgreSQL Dialect
-- Isolated Flyway Table: flyway_schema_history_submissions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: exam_attempts
-- Stores candidate session data, proctoring IP logs, timer state, and final scores
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY,
    exam_id UUID NOT NULL,
    exam_code VARCHAR(64) NOT NULL,
    exam_title VARCHAR(255),
    student_name VARCHAR(150) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    client_ip VARCHAR(64) NOT NULL,
    user_agent TEXT,
    duration_minutes INT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) NOT NULL DEFAULT 'IN_PROGRESS',
    total_score DOUBLE PRECISION DEFAULT 0.0,
    max_score INT DEFAULT 0,
    percentage DOUBLE PRECISION DEFAULT 0.0,
    is_passed BOOLEAN DEFAULT FALSE,
    passing_marks INT DEFAULT 0,
    receipt_id VARCHAR(64) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: candidate_answers
-- Stores real-time candidate answers per question
CREATE TABLE IF NOT EXISTS candidate_answers (
    id UUID PRIMARY KEY,
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL,
    selected_option_ids TEXT NOT NULL,
    is_correct BOOLEAN,
    points_awarded INT DEFAULT 0,
    answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
);

-- 3. Indexes for fast performance and audit queries
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON exam_attempts (exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student_email ON exam_attempts (student_email);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON exam_attempts (status);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_client_ip ON exam_attempts (client_ip);
CREATE INDEX IF NOT EXISTS idx_candidate_answers_attempt_id ON candidate_answers (attempt_id);
CREATE INDEX IF NOT EXISTS idx_candidate_answers_question_id ON candidate_answers (question_id);
