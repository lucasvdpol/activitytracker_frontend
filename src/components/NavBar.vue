<script setup>
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

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
  <header class="bg-bg border-b border-border">
    <nav class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
      <RouterLink to="/" class="text-[15px] font-semibold tracking-tight text-text mr-auto sm:mr-0">
        Activity<span class="text-accent">.</span>
      </RouterLink>
      <div class="hidden sm:flex items-center gap-6">
        <RouterLink
          to="/"
          class="text-[13px] text-text-muted hover:text-text transition-colors"
          active-class="!text-text"
        >
          Overzicht
        </RouterLink>
        <RouterLink
          to="/activities"
          class="text-[13px] text-text-muted hover:text-text transition-colors"
          active-class="!text-text"
        >
          Activiteiten
        </RouterLink>
        <RouterLink
          to="/groups"
          class="text-[13px] text-text-muted hover:text-text transition-colors"
          active-class="!text-text"
        >
          Groepen
        </RouterLink>
      </div>
      <div class="flex items-center gap-4 ml-auto">
        <button
          @click="logout"
          class="text-[13px] text-text-muted hover:text-danger transition-colors"
        >
          Uitloggen
        </button>
        <div
          class="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-[13px] font-medium text-accent-light shrink-0"
        >
          {{ initials(authStore.user?.name || authStore.user?.email) }}
        </div>
      </div>
    </nav>
  </header>
</template>
