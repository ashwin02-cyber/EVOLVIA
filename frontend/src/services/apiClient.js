import axios from 'axios';

const API_BASE = '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT access token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('evolvia_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401s and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('evolvia_refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
          const newAccess = res.data.access;
          localStorage.setItem('evolvia_access_token', newAccess);
          if (res.data.refresh) {
            localStorage.setItem('evolvia_refresh_token', res.data.refresh);
          }
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('evolvia_access_token');
          localStorage.removeItem('evolvia_refresh_token');
          // Dispatch auth logout event if needed
          window.dispatchEvent(new Event('evolvia_auth_expired'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
