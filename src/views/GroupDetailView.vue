<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { getGroup } from '../api/groups'
import { useGroupsStore } from '../stores/groups'
import { useAuthStore } from '../stores/auth'
import { extractErrorMessage } from '../utils/errors'
import ConfirmDialog from '../components/ConfirmDialog.vue'

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
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-8">
    <RouterLink to="/groups" class="text-sm font-medium text-accent-light hover:text-accent">
      &larr; Terug naar groepen
    </RouterLink>

    <p v-if="loading" class="mt-6 text-sm text-text-muted">Laden...</p>

    <template v-else-if="group">
      <div class="mt-4 rounded-xl border border-border bg-surface p-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <template v-if="editing">
              <input
                v-model="editName"
                type="text"
                class="block w-full rounded-lg border border-border-strong bg-bg px-3.5 py-2 text-xl font-semibold text-text outline-none focus:border-accent transition-colors"
              />
            </template>
            <h1 v-else class="text-2xl font-semibold tracking-tight text-text">{{ group.name }}</h1>
          </div>
          <div v-if="isHost" class="flex gap-2 shrink-0">
            <template v-if="editing">
              <button
                @click="saveEdit"
                :disabled="saving"
                class="rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
              >
                Opslaan
              </button>
              <button
                @click="editing = false"
                class="rounded-lg border border-border-strong px-3.5 py-2 text-sm font-medium text-text hover:bg-white/5 transition-colors"
              >
                Annuleren
              </button>
            </template>
            <template v-else>
              <button
                @click="startEdit"
                class="rounded-lg border border-border-strong px-3.5 py-2 text-sm font-medium text-text hover:bg-white/5 transition-colors"
              >
                Bewerken
              </button>
              <button
                @click="showDeleteConfirm = true"
                class="rounded-lg border border-[#3D2020] px-3.5 py-2 text-sm font-medium text-danger hover:bg-danger-strong/10 transition-colors"
              >
                Verwijderen
              </button>
            </template>
          </div>
          <button
            v-else
            @click="showLeaveConfirm = true"
            class="shrink-0 rounded-lg border border-[#3D2020] px-3.5 py-2 text-sm font-medium text-danger hover:bg-danger-strong/10 transition-colors"
          >
            Verlaten
          </button>
        </div>

        <div class="mt-6">
          <p class="text-[11px] uppercase tracking-wide text-text-muted">Join-code</p>
          <p class="mt-1 font-mono text-lg tracking-widest text-accent-light">{{ group.joinCode }}</p>
          <p class="mt-1 text-xs text-text-muted">Deel deze code om anderen te laten joinen.</p>
        </div>

        <p v-if="error" class="mt-4 text-sm text-danger">{{ error }}</p>
      </div>

      <div class="mt-6 rounded-xl border border-border bg-surface p-6">
        <h2 class="text-[11px] uppercase tracking-wide text-text-muted font-medium">Leden</h2>
        <ul class="mt-4 divide-y divide-border">
          <li class="flex items-center justify-between py-3">
            <div>
              <p class="text-sm font-medium text-text">{{ group.host?.name }}</p>
              <p class="text-xs text-text-muted">{{ group.host?.email }}</p>
            </div>
            <span class="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent-light">
              Host
            </span>
          </li>
          <li
            v-for="member in group.members"
            :key="member.id"
            class="flex items-center justify-between py-3"
          >
            <div>
              <p class="text-sm font-medium text-text">{{ member.name }}</p>
              <p class="text-xs text-text-muted">{{ member.email }}</p>
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
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />

    <ConfirmDialog
      :open="showLeaveConfirm"
      title="Groep verlaten"
      message="Weet je zeker dat je deze groep wilt verlaten?"
      confirm-label="Verlaten"
      @confirm="confirmLeave"
      @cancel="showLeaveConfirm = false"
    />
  </div>
</template>
