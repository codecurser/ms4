import {
  CreatorSubmissionsResponse,
  SaveAnswerResponse,
  ScorecardResponse,
  StartAttemptRequest,
  StartAttemptResponse
} from '../types/exam';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Server error (${res.status})`;
    try {
      const data = await res.json();
      errorMsg = data.message || data.error || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  async checkHealth(): Promise<{ status: string; service: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async startAttempt(payload: StartAttemptRequest): Promise<StartAttemptResponse> {
    const res = await fetch(`${API_BASE}/api/v1/public/attempts/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return handleResponse<StartAttemptResponse>(res);
  },

  async getAttemptProgress(attemptId: string): Promise<StartAttemptResponse> {
    const res = await fetch(`${API_BASE}/api/v1/public/attempts/${attemptId}`);
    return handleResponse<StartAttemptResponse>(res);
  },

  async saveAnswer(attemptId: string, questionId: string, selectedOptionIds: string[]): Promise<SaveAnswerResponse> {
    const res = await fetch(`${API_BASE}/api/v1/public/attempts/${attemptId}/answers`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        questionId,
        selectedOptionIds
      })
    });
    return handleResponse<SaveAnswerResponse>(res);
  },

  async submitAttempt(attemptId: string): Promise<ScorecardResponse> {
    const res = await fetch(`${API_BASE}/api/v1/public/attempts/${attemptId}/submit`, {
      method: 'POST'
    });
    return handleResponse<ScorecardResponse>(res);
  },

  async getAttemptResult(attemptId: string): Promise<ScorecardResponse> {
    const res = await fetch(`${API_BASE}/api/v1/public/attempts/${attemptId}/result`);
    return handleResponse<ScorecardResponse>(res);
  },

  async getCreatorSubmissions(examId: string, jwtToken: string): Promise<CreatorSubmissionsResponse> {
    const cleanToken = jwtToken.startsWith('Bearer ') ? jwtToken : `Bearer ${jwtToken}`;
    const res = await fetch(`${API_BASE}/api/v1/exams/${examId}/submissions`, {
      headers: {
        Authorization: cleanToken
      }
    });
    return handleResponse<CreatorSubmissionsResponse>(res);
  },

  getExportCsvUrl(examId: string): string {
    return `${API_BASE}/api/v1/exams/${examId}/submissions/export`;
  }
};

