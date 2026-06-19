<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useActivitiesStore } from '../stores/activities'
import { useAuthStore } from '../stores/auth'
import ActivityCard from '../components/ActivityCard.vue'

const activitiesStore = useActivitiesStore()
const authStore = useAuthStore()

onMounted(() => {
  activitiesStore.fetchAll()
})

const hostedActivities = computed(() =>
  activitiesStore.activities.filter((a) => a.host?.email === authStore.user?.email),
)

const pendingInvitations = computed(() =>
  activitiesStore.activities.filter((a) =>
    a.participants?.some((p) => p.email === authStore.user?.email && p.status === 'INVITED'),
  ),
)
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
    <h1 class="text-[28px] font-semibold tracking-tight text-text">
      Welkom, {{ authStore.user?.name || authStore.user?.email }}
    </h1>

    <section class="mt-10">
      <div class="flex items-center justify-between">
        <div class="text-[11px] uppercase tracking-wide text-text-muted font-medium">
          Openstaande uitnodigingen
        </div>
      </div>
      <p v-if="!pendingInvitations.length" class="mt-3 text-sm text-text-muted">
        Geen openstaande uitnodigingen.
      </p>
      <div v-else class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ActivityCard v-for="activity in pendingInvitations" :key="activity.id" :activity="activity" />
      </div>
    </section>

    <section class="mt-10">
      <div class="flex items-center justify-between">
        <div class="text-[11px] uppercase tracking-wide text-text-muted font-medium">
          Jouw activiteiten
        </div>
        <RouterLink to="/activities/new" class="text-sm font-medium text-accent-light hover:text-accent">
          + Nieuwe activiteit
        </RouterLink>
      </div>
      <p v-if="!hostedActivities.length" class="mt-3 text-sm text-text-muted">
        Je hebt nog geen activiteiten aangemaakt.
      </p>
      <div v-else class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ActivityCard v-for="activity in hostedActivities" :key="activity.id" :activity="activity" />
      </div>
    </section>
  </div>
</template>
