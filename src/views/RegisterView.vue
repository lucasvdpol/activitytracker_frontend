<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { extractErrorMessage } from '../utils/errors'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await authStore.register(name.value, email.value, password.value)
    router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-full items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <h1 class="text-2xl font-semibold tracking-tight text-text text-center">
        Activity<span class="text-accent">.</span>
      </h1>
      <p class="mt-1 text-sm text-text-muted text-center">Maak een nieuw account aan</p>

      <form @submit.prevent="onSubmit" class="mt-8 space-y-4">
        <div>
          <label class="block text-xs uppercase tracking-wide text-text-muted mb-1.5">Naam</label>
          <input
            v-model="name"
            type="text"
            required
            class="block w-full rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-text-muted mb-1.5">
            E-mailadres
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="block w-full rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wide text-text-muted mb-1.5">
            Wachtwoord
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="block w-full rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          />
        </div>

        <p v-if="error" class="text-sm text-danger">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-accent px-3.5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          {{ loading ? 'Bezig...' : 'Registreren' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-text-muted">
        Al een account?
        <RouterLink to="/login" class="font-medium text-accent-light hover:text-accent">
          Inloggen
        </RouterLink>
      </p>
    </div>
  </div>
</template>
