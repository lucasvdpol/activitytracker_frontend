<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { getActivity } from '../api/activities'
import { useActivitiesStore } from '../stores/activities'
import { useGroupsStore } from '../stores/groups'
import { useAuthStore } from '../stores/auth'
import { extractErrorMessage } from '../utils/errors'
import { toDateTimeInputValue } from '../utils/date'

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
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-8">
    <RouterLink to="/activities" class="text-sm font-medium text-accent-light hover:text-accent">
      &larr; Terug naar activiteiten
    </RouterLink>

    <h1 class="mt-4 text-2xl font-semibold tracking-tight text-text">
      {{ isEdit ? 'Activiteit bewerken' : 'Nieuwe activiteit' }}
    </h1>

    <p v-if="loading" class="mt-6 text-sm text-text-muted">Laden...</p>

    <form v-else @submit.prevent="onSubmit" class="mt-6 space-y-5">
      <div>
        <label class="block text-xs uppercase tracking-wide text-text-muted mb-1.5">Naam *</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="block w-full rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label class="block text-xs uppercase tracking-wide text-text-muted mb-1.5">Locatie</label>
        <input
          v-model="form.location"
          type="text"
          class="block w-full rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label class="block text-xs uppercase tracking-wide text-text-muted mb-1.5">
          Beschrijving
        </label>
        <textarea
          v-model="form.description"
          rows="3"
          class="block w-full rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label class="block text-xs uppercase tracking-wide text-text-muted mb-1.5">
          Maximum aantal deelnemers
        </label>
        <input
          v-model="form.maxParticipants"
          type="number"
          min="1"
          placeholder="Onbeperkt"
          class="block w-full rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs uppercase tracking-wide text-text-muted mb-1.5">
            Starttijd
          </label>
          <input
            v-model="form.startTime"
            type="datetime-local"
            class="block w-full rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus:border-accent transition-colors [color-scheme:dark]"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-text-muted mb-1.5">
            Eindtijd
          </label>
          <input
            v-model="form.endTime"
            type="datetime-local"
            class="block w-full rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus:border-accent transition-colors [color-scheme:dark]"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs uppercase tracking-wide text-text-muted mb-1.5">
          Groepsleden uitnodigen
        </label>
        <p v-if="!groupMembers.length" class="mt-1 text-sm text-text-muted">
          Je hebt nog geen groepsleden om uit te nodigen. Word lid van een groep om mensen te kunnen
          uitnodigen.
        </p>
        <div
          v-else
          class="mt-2 max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border"
        >
          <label
            v-for="user in groupMembers"
            :key="user.id"
            class="flex items-center gap-3 px-3.5 py-2.5 text-sm hover:bg-white/5 transition-colors"
          >
            <input
              type="checkbox"
              :checked="form.invitedUserIds.includes(user.id)"
              @change="toggleInvitee(user.id)"
              class="rounded border-border-strong bg-surface text-accent focus:ring-accent"
            />
            <span class="text-text">{{ user.name }}</span>
            <span class="text-text-muted">{{ user.email }}</span>
          </label>
        </div>
      </div>

      <p v-if="error" class="text-sm text-danger">{{ error }}</p>

      <div class="flex gap-3">
        <button
          type="submit"
          :disabled="saving"
          class="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          {{ saving ? 'Opslaan...' : isEdit ? 'Wijzigingen opslaan' : 'Activiteit aanmaken' }}
        </button>
      </div>
    </form>
  </div>
</template>
