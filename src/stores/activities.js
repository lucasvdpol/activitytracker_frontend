import { defineStore } from 'pinia'
import * as activitiesApi from '../api/activities'

export const useActivitiesStore = defineStore('activities', {
  state: () => ({
    activities: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        this.activities = await activitiesApi.listActivities()
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      const activity = await activitiesApi.createActivity(payload)
      this.activities.push(activity)
      return activity
    },
    async update(id, payload) {
      const activity = await activitiesApi.updateActivity(id, payload)
      const index = this.activities.findIndex((a) => a.id === id)
      if (index !== -1) this.activities[index] = activity
      return activity
    },
    async remove(id) {
      await activitiesApi.deleteActivity(id)
      this.activities = this.activities.filter((a) => a.id !== id)
    },
    async respond(id, accept) {
      const activity = await activitiesApi.respondToParticipation(id, accept)
      const index = this.activities.findIndex((a) => a.id === id)
      if (index !== -1) this.activities[index] = activity
      return activity
    },
  },
})
