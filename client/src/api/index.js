import api from './axios';

// ─── Auth API ────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ─── Projects API ────────────────────────────────
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getMembers: (id) => api.get(`/projects/${id}/members`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
  getActivity: (id) => api.get(`/projects/${id}/activity`),
};

// ─── Tasks API ───────────────────────────────────
export const tasksAPI = {
  getAll: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  getOne: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  delete: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
  addComment: (projectId, taskId, data) => api.post(`/projects/${projectId}/tasks/${taskId}/comments`, data),
  getComments: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}/comments`),
  getActivity: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}/activity`),
};

// ─── Dashboard API ───────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
  getMyTasks: () => api.get('/dashboard/my-tasks'),
  getOverdue: () => api.get('/dashboard/overdue'),
};

// ─── Notifications API ───────────────────────────
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};
