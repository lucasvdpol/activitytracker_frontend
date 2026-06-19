<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useActivitiesStore } from '../stores/activities'
import { getActivityTiming } from '../utils/date'
import ActivityCard from '../components/ActivityCard.vue'

const activitiesStore = useActivitiesStore()

onMounted(() => {
  activitiesStore.fetchAll()
})

const sections = [
  { key: 'ONGOING', title: 'Aan de gang' },
  { key: 'UPCOMING', title: 'Aankomend' },
  { key: 'PAST', title: 'Afgelopen' },
]

const groupedActivities = computed(() => {
  const groups = { ONGOING: [], UPCOMING: [], PAST: [] }
  for (const activity of activitiesStore.activities) {
    const timing = getActivityTiming(activity) ?? 'UPCOMING'
    groups[timing].push(activity)
  }
  return groups
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
    <div class="flex items-center justify-between">
      <h1 class="text-[28px] font-semibold tracking-tight text-text">Activiteiten</h1>
      <RouterLink
        to="/activities/new"
        class="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
      >
        + Nieuwe activiteit
      </RouterLink>
    </div>

    <p v-if="activitiesStore.loading" class="mt-6 text-sm text-text-muted">Laden...</p>
    <p v-else-if="!activitiesStore.activities.length" class="mt-6 text-sm text-text-muted">
      Nog geen activiteiten gevonden.
    </p>
    <template v-else>
      <section v-for="section in sections" :key="section.key" class="mt-8">
        <template v-if="groupedActivities[section.key].length">
          <h2 class="text-sm font-medium uppercase tracking-wide text-text-muted">
            {{ section.title }}
          </h2>
          <div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ActivityCard
              v-for="activity in groupedActivities[section.key]"
              :key="activity.id"
              :activity="activity"
            />
          </div>
        </template>
      </section>
    </template>
  </div>
</template>
