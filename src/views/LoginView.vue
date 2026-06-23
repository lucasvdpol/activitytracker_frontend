<script setup>
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { extractErrorMessage } from '../utils/errors'
import Spinner from '../components/Spinner.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push(route.query.redirect || { name: 'dashboard' })
  } catch (err) {
    error.value = extractErrorMessage(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login">
    <div class="login__card">
      <h1 class="login__title">
        Activity<span class="login__title-dot">.</span>
      </h1>
      <p class="login__subtitle">Log in op je account</p>

      <form @submit.prevent="onSubmit" class="login__form">
        <div>
          <label class="login__label">
            E-mailadres
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="login__input"
          />
        </div>
        <div>
          <label class="login__label">
            Wachtwoord
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="login__input"
          />
        </div>

        <p v-if="error" class="login__error">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="login__submit"
        >
          <Spinner v-if="loading" size="14" />
          {{ loading ? 'Bezig...' : 'Inloggen' }}
        </button>
      </form>

      <p class="login__footer">
        Nog geen account?
        <RouterLink to="/register" class="login__footer-link">
          Registreren
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
}

.login__card {
  width: 100%;
  max-width: 24rem;
}

.login__title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--color-text);
  text-align: center;
}

.login__title-dot {
  color: var(--color-accent);
}

.login__subtitle {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-align: center;
}

.login__form {
  margin-top: 2rem;
}

.login__form > * + * {
  margin-top: 1rem;
}

.login__label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: var(--color-text-muted);
  margin-bottom: 0.375rem;
}

.login__input {
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

.login__input::placeholder {
  color: var(--color-text-muted);
}

.login__input:focus {
  border-color: var(--color-accent);
}

.login__error {
  font-size: 0.875rem;
  color: var(--color-danger);
}

.login__submit {
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

.login__submit:hover {
  background-color: color-mix(in srgb, var(--color-accent) 90%, transparent);
}

.login__submit:disabled {
  opacity: 0.5;
}

.login__footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.login__footer-link {
  font-weight: 500;
  color: var(--color-accent-light);
}

.login__footer-link:hover {
  color: var(--color-accent);
}
</style>
