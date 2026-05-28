import { apiRequest } from './apiClient';

export function loginUser(credentials) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: credentials,
  });
}

export function registerUser(profile) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: profile,
  });
}

export function getProfile(token) {
  return apiRequest('/api/profile', { token });
}
