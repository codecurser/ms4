export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

export interface PublicOption {
  id: string;
  optionText: string;
  orderIndex: number;
}

export interface PublicQuestion {
  id: string;
  examId: string;
  questionText: string;
  questionType: QuestionType;
  points: number;
  orderIndex: number;
  options: PublicOption[];
}

export interface StartAttemptRequest {
  examCode: string;
  studentName: string;
  studentEmail: string;
}

export interface StartAttemptResponse {
  attemptId: string;
  examId: string;
  examTitle: string;
  studentName: string;
  studentEmail: string;
  clientIp: string;
  durationMinutes: number;
  remainingSeconds: number;
  startedAt: string;
  expiresAt: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT' | 'ABANDONED';
  questions: PublicQuestion[];
  savedAnswers: Record<string, string[]>;
}

export interface SaveAnswerRequest {
  questionId: string;
  selectedOptionIds: string[];
}

export interface SaveAnswerResponse {
  attemptId: string;
  questionId: string;
  selectedOptionIds: string[];
  answeredQuestionsCount: number;
  savedAt: string;
}

export interface CompletionReceipt {
  receiptId: string;
  studentName: string;
  studentEmail: string;
  clientIp: string;
  examTitle: string;
  submissionTimestamp: string;
  status: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  verificationChecksum: string;
}

export interface QuestionScoreDetail {
  questionId: string;
  questionText?: string;
  questionType: string;
  candidateSelectedOptionIds: string[];
  correctOptionIds: string[];
  pointsAwarded: number;
  maxPoints: number;
  isCorrect: boolean;
  explanation?: string;
}

export interface ScorecardResponse {
  attemptId: string;
  examId: string;
  examTitle: string;
  studentName: string;
  studentEmail: string;
  clientIp: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  passingMarks: number;
  durationSpentSeconds: number;
  startedAt: string;
  submittedAt: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT' | 'ABANDONED';
  completionReceipt: CompletionReceipt;
  questionBreakdown?: QuestionScoreDetail[];
}

export interface CandidateSubmissionItem {
  attemptId: string;
  candidateName: string;
  candidateEmail: string;
  clientIp: string;
  userAgent: string;
  startTime: string;
  submitTime?: string;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT' | 'ABANDONED';
  durationMinutesSpent: number;
}

export interface SubmissionsAnalytics {
  totalAttempts: number;
  submittedCount: number;
  inProgressCount: number;
  timedOutCount: number;
  passedCount: number;
  failedCount: number;
  averageScore: number;
  averagePercentage: number;
  passRate: number;
}

export interface CreatorSubmissionsResponse {
  examId: string;
  analytics: SubmissionsAnalytics;
  submissions: CandidateSubmissionItem[];
}

