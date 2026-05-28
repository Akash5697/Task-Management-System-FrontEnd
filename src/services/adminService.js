import { apiRequest } from './apiClient';

export function fetchAdminUsers(token) {
  return apiRequest('/api/admin/users', { token });
}

export function createAdminUser(token, payload) {
  return apiRequest('/api/admin/users', {
    method: 'POST',
    token,
    body: payload,
  });
}

export function updateAdminUserRole(token, userId, role) {
  return apiRequest(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    token,
    body: { role },
  });
}

export function deleteAdminUser(token, userId) {
  return apiRequest(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    token,
  });
}
