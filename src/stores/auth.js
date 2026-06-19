import { defineStore } from 'pinia'
import * as authApi from '../api/auth'
import { decodeJwtPayload } from '../utils/jwt'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    setSession(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    async login(email, password) {
      const { token } = await authApi.login({ email, password })
      const claims = decodeJwtPayload(token) || {}
      this.setSession(token, { email, name: claims.name ?? null })
    },
    async register(name, email, password) {
      const { token } = await authApi.register({ name, email, password })
      this.setSession(token, { email, name })
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})
