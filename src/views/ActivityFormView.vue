<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { getActivity } from '../api/activities'
import { useActivitiesStore } from '../stores/activities'
import { useGroupsStore } from '../stores/groups'
import { useAuthStore } from '../stores/auth'
import { extractErrorMessage } from '../utils/errors'
import { toDateTimeInputValue } from '../utils/date'
import Spinner from '../components/Spinner.vue'

const props = defineProps({
  id: { type: String, default: null },
})

const router = useRouter()
const activitiesStore = useActivitiesStore()
const groupsStore = useGroupsStore()
const authStore = useAuthStore()

const isEdit = computed(() => !!props.id)

const form = ref({
  name: '',
  location: '',
  description: '',
  maxParticipants: '',
  startTime: '',
  endTime: '',
  invitedUserIds: [],
})

const loading = ref(isEdit.value)
const saving = ref(false)
const error = ref('')

const groupMembers = computed(() => {
  const byId = new Map()
  for (const group of groupsStore.groups) {
    const users = [group.host, ...(group.members ?? [])]
    for (const user of users) {
      if (user && user.email !== authStore.user?.email) {
        byId.set(user.id, user)
      }
    }
  }
  return Array.from(byId.values())
})

onMounted(async () => {
  groupsStore.fetchAll()

  if (isEdit.value) {
    try {
      const activity = await getActivity(props.id)
      form.value = {
        name: activity.name,
        location: activity.location ?? '',
        description: activity.description ?? '',
        maxParticipants: activity.maxParticipants ?? '',
        startTime: toDateTimeInputValue(activity.startTime),
        endTime: toDateTimeInputValue(activity.endTime),
        invitedUserIds: activity.participants?.map((p) => p.userId) ?? [],
      }
    } catch (err) {
      error.value = extractErrorMessage(err)
    } finally {
      loading.value = false
    }
  }
})

function toggleInvitee(userId) {
  const index = form.value.invitedUserIds.indexOf(userId)
  if (index === -1) {
    form.value.invitedUserIds.push(userId)
  } else {
    form.value.invitedUserIds.splice(index, 1)
  }
}

async function onSubmit() {
  saving.value = true
  error.value = ''
  try {
    const payload = {
      name: form.value.name,
      location: form.value.location || null,
      description: form.value.description || null,
      maxParticipants: form.value.maxParticipants ? Number(form.value.maxParticipants) : null,
      startTime: form.value.startTime ? `${form.value.startTime}:00` : null,
      endTime: form.value.endTime ? `${form.value.endTime}:00` : null,
      invitedUserIds: form.value.invitedUserIds,
    }

    if (isEdit.value) {
      await activitiesStore.update(props.id, payload)
      router.push({ name: 'activity-detail', params: { id: props.id } })
    } else {
      const activity = await activitiesStore.create(payload)
      router.push({ name: 'activity-detail', params: { id: activity.id } })
    }
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="activity-form">
    <RouterLink to="/activities" class="activity-form__back-link">
      &larr; Terug naar activiteiten
    </RouterLink>

    <h1 class="activity-form__title">
      {{ isEdit ? 'Activiteit bewerken' : 'Nieuwe activiteit' }}
    </h1>

    <div v-if="loading" class="activity-form__loading">
      <Spinner size="16" />
      Laden...
    </div>

    <form v-else @submit.prevent="onSubmit" class="activity-form__form">
      <div>
        <label class="activity-form__label">Naam *</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="activity-form__input"
        />
      </div>

      <div>
        <label class="activity-form__label">Locatie</label>
        <input
          v-model="form.location"
          type="text"
          class="activity-form__input"
        />
      </div>

      <div>
        <label class="activity-form__label">
          Beschrijving
        </label>
        <textarea
          v-model="form.description"
          rows="3"
          class="activity-form__input"
        />
      </div>

      <div>
        <label class="activity-form__label">
          Maximum aantal deelnemers
        </label>
        <input
          v-model="form.maxParticipants"
          type="number"
          min="1"
          placeholder="Onbeperkt"
          class="activity-form__input"
        />
      </div>

      <div class="activity-form__time-grid">
        <div>
          <label class="activity-form__label">
            Starttijd
          </label>
          <input
            v-model="form.startTime"
            type="datetime-local"
            class="activity-form__input activity-form__input--datetime"
          />
        </div>
        <div>
          <label class="activity-form__label">
            Eindtijd
          </label>
          <input
            v-model="form.endTime"
            type="datetime-local"
            class="activity-form__input activity-form__input--datetime"
          />
        </div>
      </div>

      <div>
        <label class="activity-form__label">
          Groepsleden uitnodigen
        </label>
        <p v-if="!groupMembers.length" class="activity-form__no-members">
          Je hebt nog geen groepsleden om uit te nodigen. Word lid van een groep om mensen te kunnen
          uitnodigen.
        </p>
        <div
          v-else
          class="activity-form__members-list"
        >
          <label
            v-for="user in groupMembers"
            :key="user.id"
            class="activity-form__member-row"
          >
            <input
              type="checkbox"
              :checked="form.invitedUserIds.includes(user.id)"
              @change="toggleInvitee(user.id)"
              class="activity-form__checkbox"
            />
            <span class="activity-form__member-name">{{ user.name }}</span>
            <span class="activity-form__member-email">{{ user.email }}</span>
          </label>
        </div>
      </div>

      <p v-if="error" class="activity-form__error">{{ error }}</p>

      <div class="activity-form__actions">
        <button
          type="submit"
          :disabled="saving"
          class="activity-form__submit-btn"
        >
          <Spinner v-if="saving" size="14" />
          {{ saving ? 'Opslaan...' : isEdit ? 'Wijzigingen opslaan' : 'Activiteit aanmaken' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.activity-form {
  max-width: 42rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

@media (min-width: 640px) {
  .activity-form {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

.activity-form__back-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-accent-light);
  transition: color 150ms ease;
}

.activity-form__back-link:hover {
  color: var(--color-accent);
}

.activity-form__title {
  margin-top: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--color-text);
}

.activity-form__loading {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.activity-form__form {
  margin-top: 1.5rem;
}

.activity-form__form > * + * {
  margin-top: 1.25rem;
}

.activity-form__label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--color-text-muted);
  margin-bottom: 0.375rem;
}

.activity-form__input {
  display: block;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border-strong);
  background-color: var(--color-surface);
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: var(--color-text);
  outline: none;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.activity-form__input::placeholder {
  color: var(--color-text-muted);
}

.activity-form__input:focus {
  border-color: var(--color-accent);
}

.activity-form__input--datetime {
  color-scheme: dark;
}

.activity-form__time-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 640px) {
  .activity-form__time-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.activity-form__no-members {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.activity-form__members-list {
  margin-top: 0.5rem;
  max-height: 12rem;
  overflow-y: auto;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
}

.activity-form__members-list > * + * {
  border-top: 1px solid var(--color-border);
}

.activity-form__member-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.activity-form__member-row:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.activity-form__checkbox {
  border-radius: 0.25rem;
  border: 1px solid var(--color-border-strong);
  background-color: var(--color-surface);
  color: var(--color-accent);
}

.activity-form__checkbox:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.activity-form__member-name {
  color: var(--color-text);
}

.activity-form__member-email {
  color: var(--color-text-muted);
}

.activity-form__error {
  font-size: 0.875rem;
  color: var(--color-danger);
}

.activity-form__actions {
  display: flex;
  gap: 0.75rem;
}

.activity-form__submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  background-color: var(--color-accent);
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.activity-form__submit-btn:hover {
  background-color: color-mix(in srgb, var(--color-accent) 90%, transparent);
}

.activity-form__submit-btn:disabled {
  opacity: 0.5;
}
</style>
