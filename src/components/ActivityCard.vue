<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { formatDateTime } from '../utils/date'
import { getActivityStatus } from '../utils/activity'
import ParticipantBadge from './ParticipantBadge.vue'

const props = defineProps({
  activity: { type: Object, required: true },
})

const authStore = useAuthStore()

const status = computed(() => getActivityStatus(props.activity))

const isHost = computed(() => props.activity.host?.email === authStore.user?.email)

const myParticipation = computed(() =>
  props.activity.participants?.find((p) => p.email === authStore.user?.email),
)

const dotColor = computed(() => {
  if (isHost.value) return 'activity-card__dot--host'
  switch (myParticipation.value?.status) {
    case 'ACCEPTED':
      return 'activity-card__dot--accepted'
    case 'DECLINED':
      return 'activity-card__dot--declined'
    default:
      return 'activity-card__dot--pending'
  }
})
</script>

<template>
  <RouterLink
    :to="{ name: 'activity-detail', params: { id: activity.id } }"
    class="activity-card"
  >
    <div class="activity-card__body">
      <span class="activity-card__dot" :class="dotColor" />
      <div class="activity-card__content">
        <div class="activity-card__header">
          <h3 class="activity-card__title">{{ activity.name }}</h3>
          <div class="activity-card__badges">
            <span
              v-if="status === 'FULL'"
              class="activity-card__full-badge"
            >
              Vol
            </span>
            <ParticipantBadge v-if="isHost" status="HOST" />
            <ParticipantBadge v-else-if="myParticipation" :status="myParticipation.status" />
          </div>
        </div>

        <p v-if="activity.location || activity.startTime" class="activity-card__meta">
          <template v-if="activity.startTime">{{ formatDateTime(activity.startTime) }}</template>
          <template v-if="activity.startTime && activity.location"> · </template>
          <template v-if="activity.location">{{ activity.location }}</template>
        </p>

        <p v-if="activity.description" class="activity-card__description">
          {{ activity.description }}
        </p>

        <p
          class="activity-card__capacity"
          :class="status === 'FULL' ? 'activity-card__capacity--full' : 'activity-card__capacity--default'"
        >
          <template v-if="activity.maxParticipants">
            {{ activity.currentParticipants ?? 0 }} van de {{ activity.maxParticipants }} deelnemers
          </template>
          <template v-else> {{ activity.currentParticipants ?? 0 }} deelnemer(s) </template>
        </p>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.activity-card {
  display: block;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 1.25rem;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.activity-card:hover {
  border-color: var(--color-border-strong);
}

.activity-card__body {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.activity-card__dot {
  margin-top: 0.375rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  flex-shrink: 0;
}

.activity-card__dot--host {
  background-color: var(--color-accent);
}

.activity-card__dot--accepted {
  background-color: var(--color-success);
}

.activity-card__dot--declined {
  background-color: var(--color-danger);
}

.activity-card__dot--pending {
  background-color: var(--color-warning);
}

.activity-card__content {
  flex: 1 1 0%;
}

.activity-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.activity-card__title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.activity-card__badges {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.5rem;
}

.activity-card__full-badge {
  border-radius: 9999px;
  background-color: color-mix(in srgb, var(--color-danger-strong) 15%, transparent);
  padding: 0.25rem 0.625rem;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-danger);
}

.activity-card__meta {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.activity-card__description {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.activity-card__capacity {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.025em;
}

.activity-card__capacity--full {
  color: var(--color-danger);
}

.activity-card__capacity--default {
  color: var(--color-text-muted);
}
</style>
