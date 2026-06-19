import client from './client'

export function listGroups() {
  return client.get('/groups').then((res) => res.data)
}

export function getGroup(id) {
  return client.get(`/groups/${id}`).then((res) => res.data)
}

export function createGroup(name) {
  return client.post('/groups', { name }).then((res) => res.data)
}

export function updateGroup(id, name) {
  return client.put(`/groups/${id}`, { name }).then((res) => res.data)
}

export function deleteGroup(id) {
  return client.delete(`/groups/${id}`)
}

export function joinGroup(joinCode) {
  return client.post('/groups/join', { joinCode }).then((res) => res.data)
}

export function leaveGroup(id) {
  return client.delete(`/groups/${id}/members/me`)
}
