import { defineStore } from 'pinia'
import * as authApi from '../api/auth'
import { decodeJwtPayload } from '../utils/jwt'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },
  actions: {
    setSession(accessToken, refreshToken, user) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.user = user
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
    },
    setAccessToken(accessToken) {
      this.accessToken = accessToken
    },
    async login(email, password) {
      const { accessToken, refreshToken } = await authApi.login({ email, password })
      const claims = decodeJwtPayload(accessToken) || {}
      this.setSession(accessToken, refreshToken, { email, name: claims.name ?? null })
    },
    async register(name, email, password) {
      const { accessToken, refreshToken } = await authApi.register({ name, email, password })
      this.setSession(accessToken, refreshToken, { email, name })
    },
    async restoreSession() {
      if (!this.refreshToken) return
      try {
        const { accessToken, refreshToken } = await authApi.refresh(this.refreshToken)
        this.setSession(accessToken, refreshToken, this.user)
      } catch {
        this.clearSession()
      }
    },
    clearSession() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    },
    async logout() {
      try {
        await authApi.logout(this.refreshToken)
      } catch {
        // refresh token may already be invalid/expired; clear local session regardless
      }
      this.clearSession()
    },
  },
})
