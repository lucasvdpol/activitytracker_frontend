<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useGroupsStore } from '../stores/groups'
import { useAuthStore } from '../stores/auth'
import { extractErrorMessage } from '../utils/errors'

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
  <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
    <h1 class="text-[28px] font-semibold tracking-tight text-text">Groepen</h1>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <section class="rounded-xl border border-border bg-surface p-6">
        <h2 class="text-[11px] uppercase tracking-wide text-text-muted font-medium">
          Nieuwe groep
        </h2>
        <form @submit.prevent="createGroup" class="mt-3 flex gap-3">
          <input
            v-model="newGroupName"
            type="text"
            required
            placeholder="Naam van de groep"
            class="block w-full rounded-lg border border-border-strong bg-bg px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            :disabled="creating"
            class="shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
          >
            Aanmaken
          </button>
        </form>
        <p v-if="createError" class="mt-2 text-sm text-danger">{{ createError }}</p>
      </section>

      <section class="rounded-xl border border-border bg-surface p-6">
        <h2 class="text-[11px] uppercase tracking-wide text-text-muted font-medium">
          Groep joinen
        </h2>
        <form @submit.prevent="joinGroup" class="mt-3 flex gap-3">
          <input
            v-model="joinCode"
            type="text"
            required
            placeholder="Join-code"
            class="block w-full rounded-lg border border-border-strong bg-bg px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            :disabled="joining"
            class="shrink-0 rounded-lg border border-border-strong px-4 py-2.5 text-sm font-medium text-text hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            Joinen
          </button>
        </form>
        <p v-if="joinError" class="mt-2 text-sm text-danger">{{ joinError }}</p>
      </section>
    </div>

    <section class="mt-10">
      <div class="text-[11px] uppercase tracking-wide text-text-muted font-medium">
        Jouw groepen
      </div>
      <p v-if="groupsStore.loading" class="mt-3 text-sm text-text-muted">Laden...</p>
      <p v-else-if="!groupsStore.groups.length" class="mt-3 text-sm text-text-muted">
        Je bent nog geen lid van een groep.
      </p>
      <div v-else class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="group in groupsStore.groups"
          :key="group.id"
          :to="{ name: 'group-detail', params: { id: group.id } }"
          class="block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong"
        >
          <div class="flex items-start justify-between gap-3">
            <h3 class="text-sm font-medium text-text">{{ group.name }}</h3>
            <span
              v-if="group.host?.email === authStore.user?.email"
              class="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent-light"
            >
              Host
            </span>
          </div>
          <p class="mt-3 text-[11px] tracking-wide text-text-muted">
            {{ (group.members?.length ?? 0) + 1 }} leden
          </p>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
