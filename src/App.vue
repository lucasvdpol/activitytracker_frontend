<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { useAuthStore } from './stores/auth'
import { useNotifications } from './composables/useNotifications'

const route = useRoute()
const authStore = useAuthStore()
const { enablePushNotifications, hasRequestedPermission } = useNotifications()

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated && !hasRequestedPermission()) {
      enablePushNotifications()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="min-h-full flex flex-col">
    <NavBar v-if="route.meta.requiresAuth" />
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>
