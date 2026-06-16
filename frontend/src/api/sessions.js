import { apiRequest } from './client'

export function listSessions() {
  return apiRequest('/api/sessions')
}

export function createSession(payload) {
  return apiRequest('/api/sessions', { method: 'POST', body: payload })
}

export function deleteSession(id) {
  return apiRequest(`/api/sessions/${id}`, { method: 'DELETE' })
}
