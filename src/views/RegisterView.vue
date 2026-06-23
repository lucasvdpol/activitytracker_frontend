<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { extractErrorMessage } from '../utils/errors'
import Spinner from '../components/Spinner.vue'

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
  <div class="register">
    <div class="register__card">
      <h1 class="register__title">
        Activity<span class="register__title-dot">.</span>
      </h1>
      <p class="register__subtitle">Maak een nieuw account aan</p>

      <form @submit.prevent="onSubmit" class="register__form">
        <div>
          <label class="register__label">Naam</label>
          <input
            v-model="name"
            type="text"
            required
            class="register__input"
          />
        </div>
        <div>
          <label class="register__label">
            E-mailadres
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="register__input"
          />
        </div>
        <div>
          <label class="register__label">
            Wachtwoord
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="register__input"
          />
        </div>

        <p v-if="error" class="register__error">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="register__submit"
        >
          <Spinner v-if="loading" size="14" />
          {{ loading ? 'Bezig...' : 'Registreren' }}
        </button>
      </form>

      <p class="register__footer">
        Al een account?
        <RouterLink to="/login" class="register__footer-link">
          Inloggen
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register {
  display: flex;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
}

.register__card {
  width: 100%;
  max-width: 24rem;
}

.register__title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--color-text);
  text-align: center;
}

.register__title-dot {
  color: var(--color-accent);
}

.register__subtitle {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-align: center;
}

.register__form {
  margin-top: 2rem;
}

.register__form > * + * {
  margin-top: 1rem;
}

.register__label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--color-text-muted);
  margin-bottom: 0.375rem;
}

.register__input {
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

.register__input::placeholder {
  color: var(--color-text-muted);
}

.register__input:focus {
  border-color: var(--color-accent);
}

.register__error {
  font-size: 0.875rem;
  color: var(--color-danger);
}

.register__submit {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  background-color: var(--color-accent);
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.register__submit:hover {
  background-color: color-mix(in srgb, var(--color-accent) 90%, transparent);
}

.register__submit:disabled {
  opacity: 0.5;
}

.register__footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.register__footer-link {
  font-weight: 500;
  color: var(--color-accent-light);
}

.register__footer-link:hover {
  color: var(--color-accent);
}
</style>
