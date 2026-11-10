# Microservice 4 (MS4: `submission-service`) — Candidate Exam Taker & Auto-Grading Portal

A high-performance, resilient microservice for the **Online Examination Portal** that powers the candidate examination lifecycle, **MANDATORY candidate & real Client IP proctoring tracking**, real-time state persistence (auto-save), and automated instant grading with tamper-proof cryptographic receipts.

---

## 🌟 Key Features

### 1. Mandatory Candidate Tracking & IP Proctoring
- **Strict Anti-Anonymous Entry**: Every test session requires Exam Code, Full Name, and Email Address.
- **Real Client IP Extraction**: Automatically inspects network headers in strict priority order:
  1. `X-Forwarded-For` (first IP in chain, trimmed)
  2. `CF-Connecting-IP` (Cloudflare edge)
  3. `X-Real-IP` (Nginx / proxy edge)
  4. Fallback to `request.getRemoteAddr()` (with IPv6 loopback normalization to `127.0.0.1`).
- **Immediate Persistence**: Candidate Name, Email, Client IP, and User-Agent are saved with `started_at` at session initiation, ensuring a full audit trail even if the test is later abandoned.

### 2. Session Lifecycle & API Contract
- `POST /api/v1/public/attempts/start`: Validates exam status and duration with MS2, retrieves sanitized questions from MS3, calculates expiration, and creates an `IN_PROGRESS` attempt.
- `GET /api/v1/public/attempts/{attemptId}`: State-restoring endpoint that reloads questions, remaining seconds, and previously saved answers if the student refreshes their browser.
- `PUT /api/v1/public/attempts/{attemptId}/answers`: Instant auto-save endpoint triggered as candidate options are clicked.
- `POST /api/v1/public/attempts/{attemptId}/submit`: Final submission & grading triggered on manual user click or automatically when the live countdown reaches `00:00` (with a 30s grace window).

### 3. Instant Auto-Grading & Proctoring Receipts
- Communicates with MS3 internal endpoint (`GET /api/v1/internal/exams/{examId}/answer-key`).
- **Grading Logic**:
  - `SINGLE_CHOICE` & `TRUE_FALSE`: Full points if candidate's choice matches the correct option ID; 0 otherwise.
  - `MULTIPLE_CHOICE`: Full points only if **all** correct option IDs are selected and zero incorrect options are chosen.
- Evaluates `totalScore`, `maxScore`, `percentage`, and `isPassed = (totalScore >= passingMarks)`.
- Generates an official completion receipt with a **SHA-256 tamper-proof verification checksum**.
- Protected creator audit endpoint (`GET /api/v1/exams/{examId}/submissions`) with MS1 Bearer JWT.

### 4. Modern Glassmorphic Frontend (React 19 + Vite + TypeScript)
- **Entry Screen**: 3-field card with auto-fill from URL query params (`?code=...`) and Render cold-start status indicator.
- **Exam Runner**: Sticky header with Live Countdown Timer (normal -> amber <5m -> pulsing red <1m), candidate Name & IP badge, and color-coded question palette grid (Green = Answered, Gray = Unanswered, Yellow = Flagged).
- **Instant Result Card**: Celebratory pass/fail banner (with celebratory confetti on pass), percentage badge, score summary, and official submission timestamp receipt showing Name, Email, and IP Address.
- **Creator Audit Portal**: Real-time table of candidate attempts, Client IPs, status, and CSV export.

---

## 🏗️ Architecture & Inter-Service Topology

```
+-----------------------------------------------------------------------------------+
|                            Online Examination Portal                              |
+-----------------------------------------------------------------------------------+
       |                                       |                               |
       v                                       v                               v
[ MS1: Auth Service ]              [ MS2: Exam Management ]       [ MS3: Question Service ]
(JWT Secret: 404E63...)            (https://ms2-w51n...)          (https://ms3-2...)
       |                                       |                               |
       | Bearer JWT (Creator Audit)            | Share Link / Duration         | Questions & Answer Key
       +-----------------------+               |                               |
                               |               |                               |
                               v               v                               v
                  +-----------------------------------------------------------------+
                  |       MS4: submission-service (Port 8084)                       |
                  |  - Candidate Entry & Real IP Tracking                          |
                  |  - Real-Time Auto-Save Engine                                   |
                  |  - Instant Auto-Grading Service                                 |
                  |  - Cryptographic Verification & Audit Receipts                  |
                  +-----------------------------------------------------------------+
                                           |
                                           v
                         +-----------------------------------+
                         | Neon PostgreSQL Serverless DB     |
                         | Table: exam_attempts              |
                         | Table: candidate_answers          |
                         | Flyway: flyway_schema_history_... |
                         +-----------------------------------+
```

---

## 📡 API Reference

### 1. Start Exam Attempt
`POST /api/v1/public/attempts/start`

**Request Body:**
```json
{
  "examCode": "EXAM-A1B2C3D4",
  "studentName": "John Doe",
  "studentEmail": "john@example.com"
}
```

**Response (`201 Created`):**
```json
{
  "attemptId": "4fed31db-286f-45e3-9085-4cde614f3967",
  "examId": "8a32bbdf-3801-460d-8557-4fe76d2e65c8",
  "examTitle": "Advanced Cloud Engineering Certification",
  "studentName": "John Doe",
  "studentEmail": "john@example.com",
  "clientIp": "203.0.113.195",
  "durationMinutes": 60,
  "remainingSeconds": 3600,
  "startedAt": "2026-11-09T15:30:00Z",
  "expiresAt": "2026-11-09T16:30:00Z",
  "status": "IN_PROGRESS",
  "questions": [
    {
      "id": "e5c7cf1b-410e-4aa2-8a9d-161b9b6e8211",
      "examId": "8a32bbdf-3801-460d-8557-4fe76d2e65c8",
      "questionText": "Which protocol provides reliable, ordered byte streams?",
      "questionType": "SINGLE_CHOICE",
      "points": 2,
      "orderIndex": 0,
      "options": [
        { "id": "11111111-1111-1111-1111-111111111111", "optionText": "UDP", "orderIndex": 0 },
        { "id": "22222222-2222-2222-2222-222222222222", "optionText": "TCP", "orderIndex": 1 }
      ]
    }
  ],
  "savedAnswers": {}
}
```

---

### 2. Auto-Save Candidate Answer
`PUT /api/v1/public/attempts/{attemptId}/answers`

**Request Body:**
```json
{
  "questionId": "e5c7cf1b-410e-4aa2-8a9d-161b9b6e8211",
  "selectedOptionIds": ["22222222-2222-2222-2222-222222222222"]
}
```

**Response (`200 OK`):**
```json
{
  "attemptId": "4fed31db-286f-45e3-9085-4cde614f3967",
  "questionId": "e5c7cf1b-410e-4aa2-8a9d-161b9b6e8211",
  "selectedOptionIds": ["22222222-2222-2222-2222-222222222222"],
  "answeredQuestionsCount": 1,
  "savedAt": "2026-11-09T15:35:12Z"
}
```

---

### 3. Final Exam Submission & Instant Auto-Grading
`POST /api/v1/public/attempts/{attemptId}/submit`

**Response (`200 OK`):**
```json
{
  "attemptId": "4fed31db-286f-45e3-9085-4cde614f3967",
  "examId": "8a32bbdf-3801-460d-8557-4fe76d2e65c8",
  "examTitle": "Advanced Cloud Engineering Certification",
  "studentName": "John Doe",
  "studentEmail": "john@example.com",
  "clientIp": "203.0.113.195",
  "totalScore": 18.0,
  "maxScore": 20,
  "percentage": 90.0,
  "isPassed": true,
  "passingMarks": 10,
  "durationSpentSeconds": 1640,
  "startedAt": "2026-11-09T15:30:00Z",
  "submittedAt": "2026-11-09T15:57:20Z",
  "status": "SUBMITTED",
  "completionReceipt": {
    "receiptId": "REC-7B8A1D9C3E",
    "studentName": "John Doe",
    "studentEmail": "john@example.com",
    "clientIp": "203.0.113.195",
    "examTitle": "Advanced Cloud Engineering Certification",
    "submissionTimestamp": "2026-11-09T15:57:20Z",
    "status": "SUBMITTED",
    "totalScore": 18.0,
    "maxScore": 20,
    "percentage": 90.0,
    "isPassed": true,
    "verificationChecksum": "4F9E3D8A2B1C7E6D5A8B9C0D1E2F3A4B"
  }
}
```

---

### 4. Creator Submissions Audit & Analytics
`GET /api/v1/exams/{examId}/submissions`
*(Requires `Authorization: Bearer <JWT>`)*

**Response (`200 OK`):**
```json
{
  "examId": "8a32bbdf-3801-460d-8557-4fe76d2e65c8",
  "analytics": {
    "totalAttempts": 45,
    "submittedCount": 38,
    "inProgressCount": 4,
    "timedOutCount": 3,
    "passedCount": 32,
    "failedCount": 9,
    "averageScore": 16.4,
    "averagePercentage": 82.0,
    "passRate": 78.05
  },
  "submissions": [
    {
      "attemptId": "4fed31db-286f-45e3-9085-4cde614f3967",
      "candidateName": "John Doe",
      "candidateEmail": "john@example.com",
      "clientIp": "203.0.113.195",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "startTime": "2026-11-09T15:30:00Z",
      "submitTime": "2026-11-09T15:57:20Z",
      "score": 18.0,
      "maxScore": 20,
      "percentage": 90.0,
      "isPassed": true,
      "status": "SUBMITTED",
      "durationMinutesSpent": 27
    }
  ]
}
```

---

## 🛠️ Infrastructure Configuration

| Setting | Value |
|---|---|
| **Spring Boot** | `3.3.2` |
| **Java** | `21` |
| **Neon PostgreSQL JDBC** | `jdbc:postgresql://ep-wild-cherry-b5ctexgm-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| **DB Username** | `neondb_owner` |
| **DB Password** | `npg_pM6EYGjk2mXP` |
| **Isolated Flyway Table** | `flyway_schema_history_submissions` |
| **Hibernate Dialect** | `org.hibernate.dialect.PostgreSQLDialect` |
| **Temp JDBC Defaults** | `hibernate.temp.use_jdbc_metadata_defaults: false` |
| **Hikari Keep-Alive** | `30000 ms` |
| **Shared JWT Secret** | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` |
| **Default Port** | `8084` |

---

## 🚀 Running the Application

### Backend (Local)
```bash
# Set JAVA_HOME to JDK 21
export JAVA_HOME="/path/to/jdk-21"

# Run tests
mvn test

# Run application
mvn spring-boot:run
```

### Docker
```bash
docker compose up --build
```

### Frontend (React 19 + Vite + TypeScript)
```bash
cd frontend
npm install
npm run dev     # Starts Vite dev server at http://localhost:5174
npm run build   # Builds production bundle to frontend/dist
```

