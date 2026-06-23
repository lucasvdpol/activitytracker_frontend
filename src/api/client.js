import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const isAuthEndpoint = config.url?.startsWith('/auth')
  if (!isAuthEndpoint) {
    const { accessToken } = useAuthStore()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
  }
  return config
})

let refreshPromise = null

function redirectToLogin() {
  useAuthStore().clearSession()
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith('/auth')
    if (error.response?.status !== 401 || isAuthEndpoint || error.config._retried) {
      return Promise.reject(error)
    }

    const authStore = useAuthStore()
    if (!authStore.refreshToken) {
      redirectToLogin()
      return Promise.reject(error)
    }

    error.config._retried = true

    if (!refreshPromise) {
      refreshPromise = authStore.restoreSession().finally(() => {
        refreshPromise = null
      })
    }
    await refreshPromise

    if (!authStore.accessToken) {
      redirectToLogin()
      return Promise.reject(error)
    }

    error.config.headers.Authorization = `Bearer ${authStore.accessToken}`
    return client(error.config)
  },
)

export default client
