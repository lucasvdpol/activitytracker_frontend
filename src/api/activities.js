import client from './client'

export function listActivities() {
  return client.get('/activities').then((res) => res.data)
}

export function getActivity(id) {
  return client.get(`/activities/${id}`).then((res) => res.data)
}

export function createActivity(payload) {
  return client.post('/activities', payload).then((res) => res.data)
}

export function updateActivity(id, payload) {
  return client.put(`/activities/${id}`, payload).then((res) => res.data)
}

export function deleteActivity(id) {
  return client.delete(`/activities/${id}`)
}

export function respondToParticipation(id, accept) {
  return client.post(`/activities/${id}/participation`, { accept }).then((res) => res.data)
}
