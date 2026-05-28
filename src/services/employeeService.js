import { apiRequest } from './apiClient';

export function fetchEmployeeProfile(token) {
  return apiRequest('/api/employee/profile', { token });
}

export function fetchEmployeeTasks(token) {
  return apiRequest('/api/employee/tasks', { token });
}

export function updateEmployeeTaskStatus(token, taskId, status) {
  return apiRequest(`/api/employee/tasks/${taskId}/status`, {
    method: 'PATCH',
    token,
    body: { status },
  });
}
