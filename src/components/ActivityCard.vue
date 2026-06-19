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
  if (isHost.value) return 'bg-accent'
  switch (myParticipation.value?.status) {
    case 'ACCEPTED':
      return 'bg-success'
    case 'DECLINED':
      return 'bg-danger'
    default:
      return 'bg-warning'
  }
})
</script>

<template>
  <RouterLink
    :to="{ name: 'activity-detail', params: { id: activity.id } }"
    class="block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong"
  >
    <div class="flex items-start gap-3">
      <span class="mt-1.5 w-2 h-2 rounded-full shrink-0" :class="dotColor" />
      <div class="flex-1">
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-sm font-medium text-text">{{ activity.name }}</h3>
          <div class="flex shrink-0 items-center gap-2">
            <span
              v-if="status === 'FULL'"
              class="rounded-full bg-danger-strong/15 px-2.5 py-1 text-[11px] font-medium text-danger"
            >
              Vol
            </span>
            <ParticipantBadge v-if="isHost" status="HOST" />
            <ParticipantBadge v-else-if="myParticipation" :status="myParticipation.status" />
          </div>
        </div>

        <p v-if="activity.location || activity.startTime" class="mt-1 text-xs text-text-muted">
          <template v-if="activity.startTime">{{ formatDateTime(activity.startTime) }}</template>
          <template v-if="activity.startTime && activity.location"> · </template>
          <template v-if="activity.location">{{ activity.location }}</template>
        </p>

        <p v-if="activity.description" class="mt-2 text-sm text-text-muted line-clamp-2">
          {{ activity.description }}
        </p>

        <p
          class="mt-3 text-xs font-medium tracking-wide"
          :class="status === 'FULL' ? 'text-danger' : 'text-text-muted'"
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
