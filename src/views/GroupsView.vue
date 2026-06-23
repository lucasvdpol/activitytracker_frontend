<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useGroupsStore } from '../stores/groups'
import { useAuthStore } from '../stores/auth'
import { extractErrorMessage } from '../utils/errors'
import Spinner from '../components/Spinner.vue'

const groupsStore = useGroupsStore()
const authStore = useAuthStore()

const newGroupName = ref('')
const creating = ref(false)
const createError = ref('')

const joinCode = ref('')
const joining = ref(false)
const joinError = ref('')

onMounted(() => {
  groupsStore.fetchAll()
})

async function createGroup() {
  createError.value = ''
  creating.value = true
  try {
    await groupsStore.create(newGroupName.value)
    newGroupName.value = ''
  } catch (err) {
    createError.value = extractErrorMessage(err)
  } finally {
    creating.value = false
  }
}

async function joinGroup() {
  joinError.value = ''
  joining.value = true
  try {
    await groupsStore.join(joinCode.value)
    joinCode.value = ''
  } catch (err) {
    joinError.value = extractErrorMessage(err)
  } finally {
    joining.value = false
  }
}
</script>

<template>
  <div class="groups-view">
    <h1 class="groups-view__title">Groepen</h1>

    <div class="groups-view__grid">
      <section class="groups-view__panel">
        <h2 class="groups-view__panel-title">
          Nieuwe groep
        </h2>
        <form @submit.prevent="createGroup" class="groups-view__form">
          <input
            v-model="newGroupName"
            type="text"
            required
            placeholder="Naam van de groep"
            class="groups-view__input"
          />
          <button
            type="submit"
            :disabled="creating"
            class="groups-view__submit-btn"
          >
            <Spinner v-if="creating" size="14" />
            Aanmaken
          </button>
        </form>
        <p v-if="createError" class="groups-view__error">{{ createError }}</p>
      </section>

      <section class="groups-view__panel">
        <h2 class="groups-view__panel-title">
          Groep joinen
        </h2>
        <form @submit.prevent="joinGroup" class="groups-view__form">
          <input
            v-model="joinCode"
            type="text"
            required
            placeholder="Join-code"
            class="groups-view__input"
          />
          <button
            type="submit"
            :disabled="joining"
            class="groups-view__join-btn"
          >
            <Spinner v-if="joining" size="14" />
            Joinen
          </button>
        </form>
        <p v-if="joinError" class="groups-view__error">{{ joinError }}</p>
      </section>
    </div>

    <section class="groups-view__list-section">
      <div class="groups-view__section-label">
        Jouw groepen
      </div>
      <div v-if="groupsStore.loading" class="groups-view__loading">
        <Spinner size="16" />
        Laden...
      </div>
      <p v-else-if="!groupsStore.groups.length" class="groups-view__empty">
        Je bent nog geen lid van een groep.
      </p>
      <div v-else class="groups-view__list">
        <RouterLink
          v-for="group in groupsStore.groups"
          :key="group.id"
          :to="{ name: 'group-detail', params: { id: group.id } }"
          class="groups-view__card"
        >
          <div class="groups-view__card-header">
            <h3 class="groups-view__card-title">{{ group.name }}</h3>
            <span
              v-if="group.host?.email === authStore.user?.email"
              class="groups-view__host-badge"
            >
              Host
            </span>
          </div>
          <p class="groups-view__card-meta">
            {{ (group.members?.length ?? 0) + 1 }} leden
          </p>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.groups-view {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.groups-view__title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--color-text);
}

.groups-view__grid {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

.groups-view__panel {
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 1.5rem;
}

.groups-view__panel-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--color-text-muted);
  font-weight: 500;
}

.groups-view__form {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.75rem;
}

.groups-view__input {
  display: block;
  width: 100%;
  min-width: 0;
  flex: 1 1 0%;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border-strong);
  background-color: var(--color-bg);
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: var(--color-text);
  outline: none;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.groups-view__input::placeholder {
  color: var(--color-text-muted);
}

.groups-view__input:focus {
  border-color: var(--color-accent);
}

.groups-view__submit-btn {
  flex-shrink: 0;
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

.groups-view__submit-btn:hover {
  background-color: color-mix(in srgb, var(--color-accent) 90%, transparent);
}

.groups-view__submit-btn:disabled {
  opacity: 0.5;
}

.groups-view__join-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border-strong);
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.groups-view__join-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.groups-view__join-btn:disabled {
  opacity: 0.5;
}

.groups-view__error {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-danger);
}

.groups-view__list-section {
  margin-top: 2.5rem;
}

.groups-view__section-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--color-text-muted);
  font-weight: 500;
}

.groups-view__loading {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.groups-view__empty {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.groups-view__list {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

.groups-view__card {
  display: block;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 1.25rem;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.groups-view__card:hover {
  border-color: var(--color-border-strong);
}

.groups-view__card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.groups-view__card-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.groups-view__host-badge {
  flex-shrink: 0;
  border-radius: 9999px;
  background-color: color-mix(in srgb, var(--color-accent) 15%, transparent);
  padding: 0.25rem 0.625rem;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-accent-light);
}

.groups-view__card-meta {
  margin-top: 0.75rem;
  font-size: 11px;
  letter-spacing: 0.025em;
  color: var(--color-text-muted);
}

@media (min-width: 640px) {
  .groups-view {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .groups-view__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .groups-view__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .groups-view__list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
