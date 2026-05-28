import { apiRequest } from './apiClient';

export function fetchManagerProfile(token) {
  return apiRequest('/api/profile', { token });
}

export function fetchManagerTasks(token) {
  return apiRequest('/api/tasks', { token });
}

export function fetchManagerAssignedTasks(token) {
  return apiRequest('/api/tasks/assigned', { token });
}

export function fetchManagerEmployees(token) {
  return apiRequest('/api/manager/employees', { token });
}

export function createManagerTask(token, payload) {
  return apiRequest('/api/tasks', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function assignManagerTask(token, taskId, employeeId) {
  return apiRequest(`/api/tasks/${taskId}/assign`, {
    method: 'POST',
    token,
    body: { employeeId },
  });
}

export function updateManagerTask(token, taskId, payload) {
  return apiRequest(`/api/tasks/${taskId}`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

export function deleteManagerTask(token, taskId) {
  return apiRequest(`/api/tasks/${taskId}`, {
    method: 'DELETE',
    token,
  });
}
