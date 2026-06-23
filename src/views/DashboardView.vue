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
  <div class="dashboard-view">
    <h1 class="dashboard-view__title">
      Welkom, {{ authStore.user?.name || authStore.user?.email }}
    </h1>

    <section class="dashboard-view__section">
      <div class="dashboard-view__section-header">
        <div class="dashboard-view__section-label">
          Openstaande uitnodigingen
        </div>
      </div>
      <p v-if="!pendingInvitations.length" class="dashboard-view__empty">
        Geen openstaande uitnodigingen.
      </p>
      <div v-else class="dashboard-view__grid">
        <ActivityCard v-for="activity in pendingInvitations" :key="activity.id" :activity="activity" />
      </div>
    </section>

    <section class="dashboard-view__section">
      <div class="dashboard-view__section-header">
        <div class="dashboard-view__section-label">
          Jouw activiteiten
        </div>
        <RouterLink to="/activities/new" class="dashboard-view__new-link">
          + Nieuwe activiteit
        </RouterLink>
      </div>
      <p v-if="!hostedActivities.length" class="dashboard-view__empty">
        Je hebt nog geen activiteiten aangemaakt.
      </p>
      <div v-else class="dashboard-view__grid">
        <ActivityCard v-for="activity in hostedActivities" :key="activity.id" :activity="activity" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard-view {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.dashboard-view__title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--color-text);
}

.dashboard-view__section {
  margin-top: 2.5rem;
}

.dashboard-view__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dashboard-view__section-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--color-text-muted);
  font-weight: 500;
}

.dashboard-view__new-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-accent-light);
  transition: color 150ms ease;
}

.dashboard-view__new-link:hover {
  color: var(--color-accent);
}

.dashboard-view__empty {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.dashboard-view__grid {
  margin-top: 1rem;
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .dashboard-view {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .dashboard-view__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .dashboard-view__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
