import client from './client'

export function register({ name, email, password }) {
  return client.post('/auth/register', { name, email, password }).then((res) => res.data)
}

export function login({ email, password }) {
  return client.post('/auth/login', { email, password }).then((res) => res.data)
}

export function refresh(refreshToken) {
  return client.post('/auth/refresh', { refreshToken }).then((res) => res.data)
}

export function logout(refreshToken) {
  return client.post('/auth/logout', { refreshToken }).then((res) => res.data)
}
