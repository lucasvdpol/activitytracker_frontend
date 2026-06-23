<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { getGroup } from '../api/groups'
import { useGroupsStore } from '../stores/groups'
import { useAuthStore } from '../stores/auth'
import { extractErrorMessage } from '../utils/errors'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Spinner from '../components/Spinner.vue'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const groupsStore = useGroupsStore()
const authStore = useAuthStore()

const group = ref(null)
const loading = ref(true)
const error = ref('')

const editing = ref(false)
const editName = ref('')
const saving = ref(false)

const showDeleteConfirm = ref(false)
const showLeaveConfirm = ref(false)
const busy = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    group.value = await getGroup(props.id)
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    loading.value = false
  }
}

onMounted(load)

const isHost = computed(() => group.value?.host?.email === authStore.user?.email)

function startEdit() {
  editName.value = group.value.name
  editing.value = true
}

async function saveEdit() {
  saving.value = true
  error.value = ''
  try {
    group.value = await groupsStore.update(props.id, editName.value)
    editing.value = false
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  busy.value = true
  error.value = ''
  try {
    await groupsStore.remove(props.id)
    router.push({ name: 'groups' })
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    busy.value = false
    showDeleteConfirm.value = false
  }
}

async function confirmLeave() {
  busy.value = true
  error.value = ''
  try {
    await groupsStore.leave(props.id)
    router.push({ name: 'groups' })
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    busy.value = false
    showLeaveConfirm.value = false
  }
}
</script>

<template>
  <div class="group-detail">
    <RouterLink to="/groups" class="group-detail__back-link">
      &larr; Terug naar groepen
    </RouterLink>

    <div v-if="loading" class="group-detail__loading">
      <Spinner size="16" />
      Laden...
    </div>

    <template v-else-if="group">
      <div class="group-detail__card">
        <div class="group-detail__header">
          <div class="group-detail__title-wrap">
            <template v-if="editing">
              <input
                v-model="editName"
                type="text"
                class="group-detail__name-input"
              />
            </template>
            <h1 v-else class="group-detail__title">{{ group.name }}</h1>
          </div>
          <div v-if="isHost" class="group-detail__host-actions">
            <template v-if="editing">
              <button
                @click="saveEdit"
                :disabled="saving"
                class="group-detail__save-btn"
              >
                <Spinner v-if="saving" size="14" />
                Opslaan
              </button>
              <button
                @click="editing = false"
                class="group-detail__cancel-btn"
              >
                Annuleren
              </button>
            </template>
            <template v-else>
              <button
                @click="startEdit"
                class="group-detail__edit-btn"
              >
                Bewerken
              </button>
              <button
                @click="showDeleteConfirm = true"
                class="group-detail__delete-btn"
              >
                Verwijderen
              </button>
            </template>
          </div>
          <button
            v-else
            @click="showLeaveConfirm = true"
            class="group-detail__leave-btn"
          >
            Verlaten
          </button>
        </div>

        <div class="group-detail__join-code-wrap">
          <p class="group-detail__join-code-label">Join-code</p>
          <p class="group-detail__join-code">{{ group.joinCode }}</p>
          <p class="group-detail__join-code-hint">Deel deze code om anderen te laten joinen.</p>
        </div>

        <p v-if="error" class="group-detail__error">{{ error }}</p>
      </div>

      <div class="group-detail__members-card">
        <h2 class="group-detail__members-title">Leden</h2>
        <ul class="group-detail__members-list">
          <li class="group-detail__member-row">
            <div>
              <p class="group-detail__member-name">{{ group.host?.name }}</p>
              <p class="group-detail__member-email">{{ group.host?.email }}</p>
            </div>
            <span class="group-detail__host-badge">
              Host
            </span>
          </li>
          <li
            v-for="member in group.members"
            :key="member.id"
            class="group-detail__member-row"
          >
            <div>
              <p class="group-detail__member-name">{{ member.name }}</p>
              <p class="group-detail__member-email">{{ member.email }}</p>
            </div>
          </li>
        </ul>
      </div>
    </template>

    <ConfirmDialog
      :open="showDeleteConfirm"
      title="Groep verwijderen"
      message="Weet je zeker dat je deze groep wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
      confirm-label="Verwijderen"
      :loading="busy"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />

    <ConfirmDialog
      :open="showLeaveConfirm"
      title="Groep verlaten"
      message="Weet je zeker dat je deze groep wilt verlaten?"
      confirm-label="Verlaten"
      :loading="busy"
      @confirm="confirmLeave"
      @cancel="showLeaveConfirm = false"
    />
  </div>
</template>

<style scoped>
.group-detail {
  max-width: 42rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

@media (min-width: 640px) {
  .group-detail {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

.group-detail__back-link {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-accent-light);
  transition: color 150ms ease;
}

.group-detail__back-link:hover {
  color: var(--color-accent);
}

.group-detail__loading {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.group-detail__card {
  margin-top: 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 1.5rem;
}

.group-detail__header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .group-detail__header {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
}

.group-detail__title-wrap {
  flex: 1 1 0%;
}

.group-detail__name-input {
  display: block;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border-strong);
  background-color: var(--color-bg);
  padding: 0.5rem 0.875rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  outline: none;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.group-detail__name-input:focus {
  border-color: var(--color-accent);
}

.group-detail__title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--color-text);
}

.group-detail__host-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.group-detail__save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  background-color: var(--color-accent);
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.group-detail__save-btn:hover {
  background-color: color-mix(in srgb, var(--color-accent) 90%, transparent);
}

.group-detail__save-btn:disabled {
  opacity: 0.5;
}

.group-detail__cancel-btn {
  border-radius: 0.5rem;
  border: 1px solid var(--color-border-strong);
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.group-detail__cancel-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.group-detail__edit-btn {
  border-radius: 0.5rem;
  border: 1px solid var(--color-border-strong);
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.group-detail__edit-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.group-detail__delete-btn {
  border-radius: 0.5rem;
  border: 1px solid #3D2020;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-danger);
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.group-detail__delete-btn:hover {
  background-color: color-mix(in srgb, var(--color-danger-strong) 10%, transparent);
}

.group-detail__leave-btn {
  flex-shrink: 0;
  border-radius: 0.5rem;
  border: 1px solid #3D2020;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-danger);
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.group-detail__leave-btn:hover {
  background-color: color-mix(in srgb, var(--color-danger-strong) 10%, transparent);
}

.group-detail__join-code-wrap {
  margin-top: 1.5rem;
}

.group-detail__join-code-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--color-text-muted);
}

.group-detail__join-code {
  margin-top: 0.25rem;
  font-family: monospace;
  font-size: 1.125rem;
  letter-spacing: 0.1em;
  color: var(--color-accent-light);
}

.group-detail__join-code-hint {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.group-detail__error {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--color-danger);
}

.group-detail__members-card {
  margin-top: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 1.5rem;
}

.group-detail__members-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--color-text-muted);
  font-weight: 500;
}

.group-detail__members-list {
  margin-top: 1rem;
}

.group-detail__members-list > * + * {
  border-top: 1px solid var(--color-border);
}

.group-detail__member-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
}

.group-detail__member-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.group-detail__member-email {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.group-detail__host-badge {
  border-radius: 9999px;
  background-color: color-mix(in srgb, var(--color-accent) 15%, transparent);
  padding: 0.25rem 0.625rem;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-accent-light);
}
</style>
