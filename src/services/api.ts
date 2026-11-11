const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/+$/, '');

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const token = localStorage.getItem('manganex_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      if (res.status === 401 && endpoint !== '/auth/login') {
        localStorage.removeItem('manganex_token');
        localStorage.removeItem('manganex_auth_user');
      }
      const errorJson = await res.json().catch(() => null);
      const detail = errorJson?.detail || errorJson?.message || `HTTP ${res.status}`;
      console.warn(`API request to ${endpoint} failed:`, detail);
      throw new Error(detail);
    }

    const json = await res.json();
    // Return data property if standard envelope, otherwise return top-level json
    return (json.data !== undefined ? json.data : json) as T;
  } catch (err: any) {
    console.warn(`API call failed for ${endpoint}:`, err?.message || err);
    throw err;
  }
}

export const api = {
  // ── Centralized Authentication & RBAC ───────────────────────────────────────
  login: async (credentials: { username: string; password: string; role?: string }) => {
    return fetchApi<{
      success: boolean;
      token: string;
      username: string;
      fullName: string;
      role: string;
      organization?: string;
      message: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  register: async (payload: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    organization?: string;
    role?: string;
  }) => {
    return fetchApi<{
      success: boolean;
      message: string;
      verificationToken?: string;
      emailVerified?: boolean;
      username: string;
      role: string;
      email: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  demoLogin: async (role: string) => {
    return fetchApi<{
      success: boolean;
      token: string;
      id?: string;
      username: string;
      email?: string;
      fullName: string;
      role: string;
      organization?: string;
      message: string;
    }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
  },

  verifyEmail: async (token: string) => {
    return fetchApi<{
      success: boolean;
      message: string;
    }>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  },

  getMe: async () => {
    return fetchApi<{
      success: boolean;
      id: string;
      username: string;
      email: string;
      fullName: string;
      role: string;
      organization: string;
      permissions: string[];
    }>('/auth/me');
  },

  logout: async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('manganex_token');
      localStorage.removeItem('manganex_auth_user');
    }
  },

  refreshToken: async () => {
    return fetchApi<any>('/auth/refresh', { method: 'POST' });
  },

  forgotPassword: async (email: string) => {
    return fetchApi<{ success: boolean; message: string; resetToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  resetPassword: async (payload: { token: string; new_password: string }) => {
    return fetchApi<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // ── Mines Cadastre ──────────────────────────────────────────────────────────
  getMines: () => fetchApi<any[]>('/mines'),
  getMineById: (id: string) => fetchApi<any>(`/mines/${id}`),

  // ── Geological Intelligence ─────────────────────────────────────────────────
  getProspects: () => fetchApi<any[]>('/geology/prospects'),
  getBoreholes: () => fetchApi<any[]>('/geology/boreholes'),
  explainProspect: (id: string) => fetchApi<any>(`/geology/prospects/${id}/explain`),
  scoreCustomProspect: (features: Record<string, number>) =>
    fetchApi<any>('/geology/prospectivity/score', {
      method: 'POST',
      body: JSON.stringify(features)
    }),

  // ── Production Forecasting ──────────────────────────────────────────────────
  getProductionForecast: (mineId: string, horizonDays: number = 30) =>
    fetchApi<any>(`/production/forecast/${mineId}?horizon_days=${horizonDays}`),
  getProductionHistory: (mineId: string, days: number = 90) =>
    fetchApi<any>(`/production/history/${mineId}?days=${days}`),
  getProductionSummary: () => fetchApi<any>('/production/summary'),

  // ── Operations & Simulation ─────────────────────────────────────────────────
  getRisks: () => fetchApi<any>('/risks/all'),
  getRiskSystemIndex: () => fetchApi<any>('/risks/system-index'),
  predictMineRisks: (mineId: string, overrides?: Record<string, number>) =>
    fetchApi<any>('/risks/predict', {
      method: 'POST',
      body: JSON.stringify({ mine_id: mineId, ...overrides })
    }),
  simulateScenario: (scenarioInput: any) =>
    fetchApi<any>('/operations/scenarios/simulate', {
      method: 'POST',
      body: JSON.stringify(scenarioInput)
    }),

  // ── Satellite Intelligence ──────────────────────────────────────────────────
  getSatelliteObservations: (mineId: string, days: number = 30) =>
    fetchApi<any>(`/satellite/observations/${mineId}?days=${days}`),
  getSatelliteComposite: (mineId: string, days: number = 30) =>
    fetchApi<any>(`/satellite/composite/${mineId}?days=${days}`),
  getSatelliteAnomalies: () => fetchApi<any>('/satellite/anomalies'),
  getSatelliteStatus: () => fetchApi<any>('/satellite/status'),

  // ── Optimization & Reports ──────────────────────────────────────────────────
  runOptimization: (optimizationInput: any) =>
    fetchApi<any>('/optimization/optimize', {
      method: 'POST',
      body: JSON.stringify(optimizationInput)
    }),
  generateReport: (mineId: string) =>
    fetchApi<any>('/optimization/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ mineId })
    }),

  // ── Data Hub & Ingestion ────────────────────────────────────────────────────
  getDatasets: () => fetchApi<any>('/datasets'),
  getDataset: (id: string) => fetchApi<any>(`/datasets/${id}`),
  uploadDataset: (payload: any) =>
    fetchApi<any>('/datasets/upload', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  searchKnowledge: (query: string) =>
    fetchApi<any>('/datasets/knowledge/search', {
      method: 'POST',
      body: JSON.stringify({ query })
    }),

  // ── Nexus AI Copilot & Voice ────────────────────────────────────────────────
  chatNexus: (query: string, mineId?: string, region?: string, language?: string, conversationId?: string) =>
    fetchApi<any>('/nexus/chat', {
      method: 'POST',
      body: JSON.stringify({
        query,
        mine_id: mineId,
        selected_region: region,
        language: language || 'en',
        conversation_id: conversationId
      })
    }),

  getNexusSessions: () =>
    fetchApi<{ success: boolean; sessions: any[] }>('/nexus/sessions'),

  createNexusSession: (title?: string) =>
    fetchApi<{ success: boolean; session: any }>('/nexus/sessions', {
      method: 'POST',
      body: JSON.stringify({ title })
    }),

  updateNexusSession: (sessionId: string, payload: { title?: string; pinned?: boolean }) =>
    fetchApi<{ success: boolean; session: any }>(`/nexus/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  deleteNexusSession: (sessionId: string) =>
    fetchApi<{ success: boolean; message: string }>(`/nexus/sessions/${sessionId}`, {
      method: 'DELETE'
    }),

  getNexusSessionMessages: (sessionId: string) =>
    fetchApi<{ success: boolean; messages: any[] }>(`/nexus/sessions/${sessionId}/messages`),

  // ── Global Intelligence Search ──────────────────────────────────────────────
  searchGlobal: (query: string) =>
    fetchApi<{ query: string; results: any[]; total: number }>(`/search?q=${encodeURIComponent(query)}`)
};
