<script setup>
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'

const route = useRoute()
</script>

<template>
  <div class="min-h-full flex flex-col">
    <NavBar v-if="route.meta.requiresAuth" />
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>
