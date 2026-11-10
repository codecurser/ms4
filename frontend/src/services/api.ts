import {
  CreatorSubmissionsResponse,
  SaveAnswerResponse,
  ScorecardResponse,
  StartAttemptRequest,
  StartAttemptResponse
} from '../types/exam';

export function getApiBaseUrl(): string {
  const localOverride = localStorage.getItem('ms4_api_base_url');
  if (localOverride && localOverride.trim()) {
    return localOverride.trim().replace(/\/+$/, '');
  }
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  // Default to deployed Render backend
  return 'https://ms4-d7da.onrender.com';
}

export function setApiBaseUrl(url: string): void {
  if (!url || !url.trim()) {
    localStorage.removeItem('ms4_api_base_url');
  } else {
    localStorage.setItem('ms4_api_base_url', url.trim().replace(/\/+$/, ''));
  }
}

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.toLowerCase().includes('failed to fetch')) {
      const target = getApiBaseUrl();
      throw new Error(
        `Cannot connect to MS4 backend at "${target}". ` +
        `The Render service may be waking from cold sleep (takes ~30-50s). Please wait a moment and try again.`
      );
    }
    throw err;
  }
}

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
  getApiBaseUrl,
  setApiBaseUrl,

  async checkHealth(): Promise<{ status: string; service: string }> {
    const base = getApiBaseUrl();
    const res = await safeFetch(`${base}/health`);
    return handleResponse(res);
  },

  async startAttempt(payload: StartAttemptRequest): Promise<StartAttemptResponse> {
    const base = getApiBaseUrl();
    const res = await safeFetch(`${base}/api/v1/public/attempts/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return handleResponse<StartAttemptResponse>(res);
  },

  async getAttemptProgress(attemptId: string): Promise<StartAttemptResponse> {
    const base = getApiBaseUrl();
    const res = await safeFetch(`${base}/api/v1/public/attempts/${attemptId}`);
    return handleResponse<StartAttemptResponse>(res);
  },

  async saveAnswer(attemptId: string, questionId: string, selectedOptionIds: string[]): Promise<SaveAnswerResponse> {
    const base = getApiBaseUrl();
    const res = await safeFetch(`${base}/api/v1/public/attempts/${attemptId}/answers`, {
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
    const base = getApiBaseUrl();
    const res = await safeFetch(`${base}/api/v1/public/attempts/${attemptId}/submit`, {
      method: 'POST'
    });
    return handleResponse<ScorecardResponse>(res);
  },

  async getAttemptResult(attemptId: string): Promise<ScorecardResponse> {
    const base = getApiBaseUrl();
    const res = await safeFetch(`${base}/api/v1/public/attempts/${attemptId}/result`);
    return handleResponse<ScorecardResponse>(res);
  },

  async getCreatorSubmissions(examId: string, jwtToken: string): Promise<CreatorSubmissionsResponse> {
    const base = getApiBaseUrl();
    const cleanToken = jwtToken.startsWith('Bearer ') ? jwtToken : `Bearer ${jwtToken}`;
    const res = await safeFetch(`${base}/api/v1/exams/${examId}/submissions`, {
      headers: {
        Authorization: cleanToken
      }
    });
    return handleResponse<CreatorSubmissionsResponse>(res);
  },

  getExportCsvUrl(examId: string): string {
    const base = getApiBaseUrl();
    return `${base}/api/v1/exams/${examId}/submissions/export`;
  }
};
