import client from './client'

export function registerPushToken(token) {
  return client.post('api/notifications/subscribe', { token }).then((res) => res.data)
}
