import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_BASE}/api/v1/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ── Clients ───────────────────────────────────────────────────────
export const clientApi = {
  create: (data: any) => api.post('/clients', data),
  list: (params?: any) => api.get('/clients', { params }),
  get: (id: string) => api.get(`/clients/${id}`),
  update: (id: string, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
  metrics: (id: string) => api.get(`/clients/${id}/metrics`),
};

// ── Diet Plans ────────────────────────────────────────────────────
export const dietApi = {
  generate: (clientId: string) =>
    api.post(`/clients/${clientId}/diet-plans/generate`),
  list: (clientId: string) => api.get(`/clients/${clientId}/diet-plans`),
  get: (planId: string) => api.get(`/clients/diet-plans/${planId}`),
};

// ── Progress ──────────────────────────────────────────────────────
export const progressApi = {
  add: (clientId: string, data: any) => api.post(`/clients/${clientId}/progress`, data),
  list: (clientId: string) => api.get(`/clients/${clientId}/progress`),
  weightHistory: (clientId: string) => api.get(`/clients/${clientId}/weight-history`),
  addCheckIn: (clientId: string, data: any) => api.post(`/clients/${clientId}/checkins`, data),
  checkIns: (clientId: string) => api.get(`/clients/${clientId}/checkins`),
};

// ── Admin ─────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get('/admin/stats'),
};
