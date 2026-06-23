<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const mobileMenuOpen = ref(false)

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}

const initials = (name) =>
  (name || '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
</script>

<template>
  <header class="navbar">
    <nav class="navbar__bar">
      <RouterLink to="/" class="navbar__brand">
        Activity<span class="navbar__brand-dot">.</span>
      </RouterLink>
      <div class="navbar__links">
        <RouterLink to="/" class="navbar__link" active-class="navbar__link--active">
          Overzicht
        </RouterLink>
        <RouterLink to="/activities" class="navbar__link" active-class="navbar__link--active">
          Activiteiten
        </RouterLink>
        <RouterLink to="/groups" class="navbar__link" active-class="navbar__link--active">
          Groepen
        </RouterLink>
      </div>
      <div class="navbar__actions">
        <button @click="logout" class="navbar__logout">
          Uitloggen
        </button>
        <div class="navbar__avatar">
          {{ initials(authStore.user?.name || authStore.user?.email) }}
        </div>
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="navbar__burger"
          :aria-expanded="mobileMenuOpen"
          aria-label="Menu"
        >
          <svg v-if="!mobileMenuOpen" class="navbar__burger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="navbar__burger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </nav>

    <div v-if="mobileMenuOpen" class="navbar__mobile-menu">
      <RouterLink to="/" class="navbar__mobile-link" active-class="navbar__mobile-link--active">
        Overzicht
      </RouterLink>
      <RouterLink to="/activities" class="navbar__mobile-link" active-class="navbar__mobile-link--active">
        Activiteiten
      </RouterLink>
      <RouterLink to="/groups" class="navbar__mobile-link" active-class="navbar__mobile-link--active">
        Groepen
      </RouterLink>
      <button @click="logout" class="navbar__mobile-logout">
        Uitloggen
      </button>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.navbar__bar {
  max-width: 64rem;
  margin: 0 auto;
  padding: 0 1rem;
  height: 4rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.navbar__brand {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text);
  margin-right: auto;
}

.navbar__brand-dot {
  color: var(--color-accent);
}

.navbar__links {
  display: none;
  align-items: center;
  gap: 1.5rem;
}

.navbar__link {
  font-size: 13px;
  color: var(--color-text-muted);
  transition: color 150ms ease;
}

.navbar__link:hover {
  color: var(--color-text);
}

.navbar__link--active {
  color: var(--color-text) !important;
}

.navbar__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.navbar__logout {
  display: none;
  font-size: 13px;
  color: var(--color-text-muted);
  transition: color 150ms ease;
}

.navbar__logout:hover {
  color: var(--color-danger);
}

.navbar__avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background-color: color-mix(in srgb, var(--color-accent) 20%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-accent-light);
  flex-shrink: 0;
}

.navbar__burger {
  margin-right: -0.25rem;
  padding: 0.375rem;
  color: var(--color-text-muted);
  transition: color 150ms ease;
}

.navbar__burger:hover {
  color: var(--color-text);
}

.navbar__burger-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.navbar__mobile-menu {
  border-top: 1px solid var(--color-border);
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.navbar__mobile-link {
  border-radius: 0.5rem;
  padding: 0.625rem 0.75rem;
  font-size: 13px;
  color: var(--color-text-muted);
  transition: color 150ms ease, background-color 150ms ease;
}

.navbar__mobile-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
}

.navbar__mobile-link--active {
  color: var(--color-text) !important;
}

.navbar__mobile-logout {
  border-radius: 0.5rem;
  padding: 0.625rem 0.75rem;
  text-align: left;
  font-size: 13px;
  color: var(--color-text-muted);
  transition: color 150ms ease, background-color 150ms ease;
}

.navbar__mobile-logout:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-danger);
}

@media (min-width: 640px) {
  .navbar__bar {
    padding: 0 1.5rem;
  }

  .navbar__brand {
    margin-right: 0;
  }

  .navbar__links {
    display: flex;
  }

  .navbar__logout {
    display: inline;
  }

  .navbar__burger,
  .navbar__mobile-menu {
    display: none;
  }
}
</style>
