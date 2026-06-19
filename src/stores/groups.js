import { defineStore } from 'pinia'
import * as groupsApi from '../api/groups'

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    groups: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        this.groups = await groupsApi.listGroups()
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },
    async create(name) {
      const group = await groupsApi.createGroup(name)
      this.groups.push(group)
      return group
    },
    async update(id, name) {
      const group = await groupsApi.updateGroup(id, name)
      const index = this.groups.findIndex((g) => g.id === id)
      if (index !== -1) this.groups[index] = group
      return group
    },
    async remove(id) {
      await groupsApi.deleteGroup(id)
      this.groups = this.groups.filter((g) => g.id !== id)
    },
    async join(joinCode) {
      const group = await groupsApi.joinGroup(joinCode)
      this.groups.push(group)
      return group
    },
    async leave(id) {
      await groupsApi.leaveGroup(id)
      this.groups = this.groups.filter((g) => g.id !== id)
    },
  },
})
