<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { getActivity } from '../api/activities'
import { useActivitiesStore } from '../stores/activities'
import { useAuthStore } from '../stores/auth'
import { extractErrorMessage } from '../utils/errors'
import { formatDateTime, getActivityTiming } from '../utils/date'
import { getActivityStatus } from '../utils/activity'
import ParticipantBadge from '../components/ParticipantBadge.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const activitiesStore = useActivitiesStore()
const authStore = useAuthStore()

const activity = ref(null)
const loading = ref(true)
const error = ref('')
const responding = ref(false)
const showDeleteConfirm = ref(false)
const deleting = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    activity.value = await getActivity(props.id)
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(load)

const isHost = computed(() => activity.value?.host?.email === authStore.user?.email)

const myParticipation = computed(() =>
  activity.value?.participants?.find((p) => p.email === authStore.user?.email),
)

const participantList = computed(() => {
  if (!activity.value) return []
  const host = activity.value.host
  const entries =
    activity.value.participants?.filter((p) => p.email !== host?.email) ?? []
  if (!host) return entries
  return [
    { userId: host.id, name: host.name, email: host.email, status: 'HOST' },
    ...entries,
  ]
})

const timing = computed(() => getActivityTiming(activity.value))

const status = computed(() => getActivityStatus(activity.value))

const timingStyles = {
  UPCOMING: 'bg-accent/15 text-accent-light',
  ONGOING: 'bg-success-strong/15 text-success',
  PAST: 'bg-white/5 text-text-muted',
}

const timingLabels = {
  UPCOMING: 'Aankomend',
  ONGOING: 'Aan de gang',
  PAST: 'Afgelopen',
}

async function respond(accept) {
  responding.value = true
  error.value = ''
  try {
    activity.value = await activitiesStore.respond(props.id, accept)
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    responding.value = false
  }
}

async function confirmDelete() {
  deleting.value = true
  error.value = ''
  try {
    await activitiesStore.remove(props.id)
    router.push({ name: 'activities' })
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    deleting.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
    <RouterLink to="/activities" class="text-sm font-medium text-accent-light hover:text-accent">
      &larr; Terug naar activiteiten
    </RouterLink>

    <p v-if="loading" class="mt-6 text-sm text-text-muted">Laden...</p>

    <template v-else-if="activity">
      <div class="mt-4 rounded-xl border border-border bg-surface p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-semibold tracking-tight text-text">{{ activity.name }}</h1>
              <span
                v-if="timing"
                class="rounded-full px-2.5 py-1 text-[11px] font-medium"
                :class="timingStyles[timing]"
              >
                {{ timingLabels[timing] }}
              </span>
              <span
                v-if="status"
                class="rounded-full px-2.5 py-1 text-[11px] font-medium"
                :class="
                  status === 'FULL'
                    ? 'bg-danger-strong/15 text-danger'
                    : 'bg-success-strong/15 text-success'
                "
              >
                {{ status === 'FULL' ? 'Vol' : 'Beschikbaar' }}
              </span>
            </div>
            <p v-if="activity.location" class="mt-1 text-sm text-text-muted">
              {{ activity.location }}
            </p>
          </div>
          <div v-if="isHost" class="flex gap-2 shrink-0">
            <RouterLink
              :to="{ name: 'activity-edit', params: { id: activity.id } }"
              class="rounded-lg border border-border-strong px-3.5 py-2 text-sm font-medium text-text hover:bg-white/5 transition-colors"
            >
              Bewerken
            </RouterLink>
            <button
              @click="showDeleteConfirm = true"
              class="rounded-lg border border-[#3D2020] px-3.5 py-2 text-sm font-medium text-danger hover:bg-danger-strong/10 transition-colors"
            >
              Verwijderen
            </button>
          </div>
        </div>

        <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="text-[11px] uppercase tracking-wide text-text-muted">Start</dt>
            <dd class="mt-1 text-text">{{ formatDateTime(activity.startTime) ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-[11px] uppercase tracking-wide text-text-muted">Einde</dt>
            <dd class="mt-1 text-text">{{ formatDateTime(activity.endTime) ?? '—' }}</dd>
          </div>
          <div>
            <dt class="text-[11px] uppercase tracking-wide text-text-muted">Host</dt>
            <dd class="mt-1 text-text">{{ activity.host?.name }}</dd>
          </div>
          <div v-if="activity.maxParticipants">
            <dt class="text-[11px] uppercase tracking-wide text-text-muted">Deelnemers</dt>
            <dd class="mt-1 text-text">
              {{ activity.currentParticipants ?? 0 }} / {{ activity.maxParticipants }}
            </dd>
          </div>
        </dl>

        <p v-if="activity.description" class="mt-4 text-sm text-text-muted">
          {{ activity.description }}
        </p>

        <div v-if="myParticipation && !isHost" class="mt-6 rounded-lg border border-border p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sm text-text-muted">Jouw status:</span>
              <ParticipantBadge :status="myParticipation.status" />
            </div>
            <div v-if="myParticipation.status === 'INVITED'" class="flex gap-2">
              <button
                @click="respond(true)"
                :disabled="responding"
                class="rounded-lg bg-success-strong px-3.5 py-1.5 text-sm font-medium text-white hover:bg-success-strong/90 disabled:opacity-50 transition-colors"
              >
                Accepteren
              </button>
              <button
                @click="respond(false)"
                :disabled="responding"
                class="rounded-lg bg-danger-strong px-3.5 py-1.5 text-sm font-medium text-white hover:bg-danger-strong/90 disabled:opacity-50 transition-colors"
              >
                Weigeren
              </button>
            </div>
          </div>
        </div>

        <p v-if="error" class="mt-4 text-sm text-danger">{{ error }}</p>
      </div>

      <div class="mt-6 rounded-xl border border-border bg-surface p-6">
        <h2 class="text-[11px] uppercase tracking-wide text-text-muted font-medium">
          Deelnemers
        </h2>
        <ul class="mt-4 divide-y divide-border">
          <li
            v-for="participant in participantList"
            :key="participant.userId"
            class="flex items-center justify-between py-3"
          >
            <div>
              <p class="text-sm font-medium text-text">{{ participant.name }}</p>
              <p class="text-xs text-text-muted">{{ participant.email }}</p>
            </div>
            <ParticipantBadge :status="participant.status" />
          </li>
          <li v-if="!activity.participants?.length" class="py-3 text-sm text-text-muted">
            Nog geen deelnemers uitgenodigd.
          </li>
        </ul>
      </div>
    </template>

    <ConfirmDialog
      :open="showDeleteConfirm"
      title="Activiteit verwijderen"
      message="Weet je zeker dat je deze activiteit wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
      confirm-label="Verwijderen"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
