<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useActivitiesStore } from '../stores/activities'
import { getActivityTiming } from '../utils/date'
import ActivityCard from '../components/ActivityCard.vue'
import Spinner from '../components/Spinner.vue'

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
  <div class="activities">
    <div class="activities__header">
      <h1 class="activities__title">Activiteiten</h1>
      <RouterLink
        to="/activities/new"
        class="activities__new-link"
      >
        + Nieuwe activiteit
      </RouterLink>
    </div>

    <div v-if="activitiesStore.loading" class="activities__loading">
      <Spinner size="16" />
      Laden...
    </div>
    <p v-else-if="!activitiesStore.activities.length" class="activities__empty">
      Nog geen activiteiten gevonden.
    </p>
    <template v-else>
      <section v-for="section in sections" :key="section.key" class="activities__section">
        <template v-if="groupedActivities[section.key].length">
          <h2 class="activities__section-title">
            {{ section.title }}
          </h2>
          <div class="activities__grid">
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

<style scoped>
.activities {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.activities__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.activities__title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--color-text);
}

.activities__new-link {
  border-radius: 0.5rem;
  background-color: var(--color-accent);
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.activities__new-link:hover {
  background-color: color-mix(in srgb, var(--color-accent) 90%, transparent);
}

.activities__loading {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.activities__empty {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.activities__section {
  margin-top: 2rem;
}

.activities__section-title {
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--color-text-muted);
}

.activities__grid {
  margin-top: 0.75rem;
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 640px) {
  .activities {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .activities__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .activities__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
