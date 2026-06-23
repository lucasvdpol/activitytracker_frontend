<script setup>
defineProps({
  size: { type: [String, Number], default: 16 },
})
</script>

<template>
  <svg
    class="animate-spin shrink-0"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="status"
    aria-label="Laden"
  >
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
    <path class="opacity-75" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z" />
  </svg>
</template>
