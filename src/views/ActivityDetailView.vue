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
import Spinner from '../components/Spinner.vue'

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
  UPCOMING: 'activity-detail__timing-badge--upcoming',
  ONGOING: 'activity-detail__timing-badge--ongoing',
  PAST: 'activity-detail__timing-badge--past',
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
  <div class="activity-detail">
    <RouterLink to="/activities" class="activity-detail__back-link">
      &larr; Terug naar activiteiten
    </RouterLink>

    <div v-if="loading" class="activity-detail__loading">
      <Spinner size="16" />
      Laden...
    </div>

    <template v-else-if="activity">
      <div class="activity-detail__card">
        <div class="activity-detail__header">
          <div>
            <div class="activity-detail__title-row">
              <h1 class="activity-detail__title">{{ activity.name }}</h1>
              <span
                v-if="timing"
                class="activity-detail__timing-badge"
                :class="timingStyles[timing]"
              >
                {{ timingLabels[timing] }}
              </span>
              <span
                v-if="status"
                class="activity-detail__status-badge"
                :class="
                  status === 'FULL'
                    ? 'activity-detail__status-badge--full'
                    : 'activity-detail__status-badge--available'
                "
              >
                {{ status === 'FULL' ? 'Vol' : 'Beschikbaar' }}
              </span>
            </div>
            <p v-if="activity.location" class="activity-detail__location">
              {{ activity.location }}
            </p>
          </div>
          <div v-if="isHost" class="activity-detail__host-actions">
            <RouterLink
              :to="{ name: 'activity-edit', params: { id: activity.id } }"
              class="activity-detail__edit-btn"
            >
              Bewerken
            </RouterLink>
            <button
              @click="showDeleteConfirm = true"
              class="activity-detail__delete-btn"
            >
              Verwijderen
            </button>
          </div>
        </div>

        <dl class="activity-detail__meta-grid">
          <div>
            <dt class="activity-detail__meta-label">Start</dt>
            <dd class="activity-detail__meta-value">{{ formatDateTime(activity.startTime) ?? '—' }}</dd>
          </div>
          <div>
            <dt class="activity-detail__meta-label">Einde</dt>
            <dd class="activity-detail__meta-value">{{ formatDateTime(activity.endTime) ?? '—' }}</dd>
          </div>
          <div>
            <dt class="activity-detail__meta-label">Host</dt>
            <dd class="activity-detail__meta-value">{{ activity.host?.name }}</dd>
          </div>
          <div v-if="activity.maxParticipants">
            <dt class="activity-detail__meta-label">Deelnemers</dt>
            <dd class="activity-detail__meta-value">
              {{ activity.currentParticipants ?? 0 }} / {{ activity.maxParticipants }}
            </dd>
          </div>
        </dl>

        <p v-if="activity.description" class="activity-detail__description">
          {{ activity.description }}
        </p>

        <div v-if="myParticipation && !isHost" class="activity-detail__my-status-card">
          <div class="activity-detail__my-status-row">
            <div class="activity-detail__my-status-label-wrap">
              <span class="activity-detail__my-status-label">Jouw status:</span>
              <ParticipantBadge :status="myParticipation.status" />
            </div>
            <div v-if="myParticipation.status === 'INVITED'" class="activity-detail__respond-actions">
              <button
                @click="respond(true)"
                :disabled="responding"
                class="activity-detail__accept-btn"
              >
                <Spinner v-if="responding" size="14" />
                Accepteren
              </button>
              <button
                @click="respond(false)"
                :disabled="responding"
                class="activity-detail__decline-btn"
              >
                <Spinner v-if="responding" size="14" />
                Weigeren
              </button>
            </div>
          </div>
        </div>

        <p v-if="error" class="activity-detail__error">{{ error }}</p>
      </div>

      <div class="activity-detail__participants-card">
        <h2 class="activity-detail__participants-title">
          Deelnemers
        </h2>
        <ul class="activity-detail__participants-list">
          <li
            v-for="participant in participantList"
            :key="participant.userId"
            class="activity-detail__participant-row"
          >
            <div>
              <p class="activity-detail__participant-name">{{ participant.name }}</p>
              <p class="activity-detail__participant-email">{{ participant.email }}</p>
            </div>
            <ParticipantBadge :status="participant.status" />
          </li>
          <li v-if="!activity.participants?.length" class="activity-detail__no-participants">
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
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<style scoped>
.activity-detail {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

@media (min-width: 640px) {
  .activity-detail {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

.activity-detail__back-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-accent-light);
  transition: color 150ms ease;
}

.activity-detail__back-link:hover {
  color: var(--color-accent);
}

.activity-detail__loading {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.activity-detail__card {
  margin-top: 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 1.5rem;
}

.activity-detail__header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .activity-detail__header {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
}

.activity-detail__title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.activity-detail__title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--color-text);
}

.activity-detail__timing-badge {
  border-radius: 9999px;
  padding: 0.25rem 0.625rem;
  font-size: 11px;
  font-weight: 500;
}

.activity-detail__timing-badge--upcoming {
  background-color: color-mix(in srgb, var(--color-accent) 15%, transparent);
  color: var(--color-accent-light);
}

.activity-detail__timing-badge--ongoing {
  background-color: color-mix(in srgb, var(--color-success-strong) 15%, transparent);
  color: var(--color-success);
}

.activity-detail__timing-badge--past {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text-muted);
}

.activity-detail__status-badge {
  border-radius: 9999px;
  padding: 0.25rem 0.625rem;
  font-size: 11px;
  font-weight: 500;
}

.activity-detail__status-badge--full {
  background-color: color-mix(in srgb, var(--color-danger-strong) 15%, transparent);
  color: var(--color-danger);
}

.activity-detail__status-badge--available {
  background-color: color-mix(in srgb, var(--color-success-strong) 15%, transparent);
  color: var(--color-success);
}

.activity-detail__location {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.activity-detail__host-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.activity-detail__edit-btn {
  border-radius: 0.5rem;
  border: 1px solid var(--color-border-strong);
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.activity-detail__edit-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.activity-detail__delete-btn {
  border-radius: 0.5rem;
  border: 1px solid #3D2020;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-danger);
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.activity-detail__delete-btn:hover {
  background-color: color-mix(in srgb, var(--color-danger-strong) 10%, transparent);
}

.activity-detail__meta-grid {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .activity-detail__meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.activity-detail__meta-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--color-text-muted);
}

.activity-detail__meta-value {
  margin-top: 0.25rem;
  color: var(--color-text);
}

.activity-detail__description {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.activity-detail__my-status-card {
  margin-top: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  padding: 1rem;
}

.activity-detail__my-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.activity-detail__my-status-label-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.activity-detail__my-status-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.activity-detail__respond-actions {
  display: flex;
  gap: 0.5rem;
}

.activity-detail__accept-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  background-color: var(--color-success-strong);
  padding: 0.375rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.activity-detail__accept-btn:hover {
  background-color: color-mix(in srgb, var(--color-success-strong) 90%, transparent);
}

.activity-detail__accept-btn:disabled {
  opacity: 0.5;
}

.activity-detail__decline-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  background-color: var(--color-danger-strong);
  padding: 0.375rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.activity-detail__decline-btn:hover {
  background-color: color-mix(in srgb, var(--color-danger-strong) 90%, transparent);
}

.activity-detail__decline-btn:disabled {
  opacity: 0.5;
}

.activity-detail__error {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--color-danger);
}

.activity-detail__participants-card {
  margin-top: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 1.5rem;
}

.activity-detail__participants-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--color-text-muted);
  font-weight: 500;
}

.activity-detail__participants-list {
  margin-top: 1rem;
}

.activity-detail__participants-list > * + * {
  border-top: 1px solid var(--color-border);
}

.activity-detail__participant-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
}

.activity-detail__participant-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.activity-detail__participant-email {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.activity-detail__no-participants {
  padding: 0.75rem 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
</style>
