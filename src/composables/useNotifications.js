import { requestNotificationPermission } from '../firebase'
import { registerPushToken } from '../api/notifications'

const STORAGE_KEY = 'fcmToken'

export function useNotifications() {
  async function enablePushNotifications() {
    const token = await requestNotificationPermission()
    localStorage.setItem(STORAGE_KEY, token || '')

    if (token) {
      try {
        await registerPushToken(token)
      } catch (err) {
        console.error('Failed to register push token with backend', err)
      }
    }

    return token
  }

  function hasRequestedPermission() {
    return localStorage.getItem(STORAGE_KEY) !== null
  }

  return { enablePushNotifications, hasRequestedPermission }
}
