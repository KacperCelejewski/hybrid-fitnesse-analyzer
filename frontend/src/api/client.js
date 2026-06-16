// Thin fetch wrapper around the LoadPace backend API.
// The base URL can be overridden at build time via VITE_API_URL.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const TOKEN_KEY = 'loadpace.token'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function storeToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

/**
 * Perform an API request and return the parsed JSON body.
 * Throws an Error whose message is the backend ProblemDetail "detail"
 * (or a generic fallback) when the response is not successful.
 */
export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const authToken = token ?? getStoredToken()
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      // Non-JSON body (e.g. a container error page); keep the raw text for messaging.
      data = { detail: text }
    }
  }

  if (!response.ok) {
    const message = data?.detail || data?.message || `Request failed (${response.status})`
    throw new Error(message)
  }

  return data
}
