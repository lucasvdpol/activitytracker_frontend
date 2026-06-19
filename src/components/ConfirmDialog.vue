<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Weet je het zeker?' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Bevestigen' },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
    @click.self="emit('cancel')"
  >
    <div class="w-full max-w-sm rounded-xl border border-border bg-surface p-6">
      <h3 class="text-base font-semibold text-text">{{ title }}</h3>
      <p v-if="message" class="mt-2 text-sm text-text-muted">{{ message }}</p>
      <div class="mt-6 flex justify-end gap-3">
        <button
          @click="emit('cancel')"
          class="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text hover:bg-white/5 transition-colors"
        >
          Annuleren
        </button>
        <button
          @click="emit('confirm')"
          class="rounded-lg border border-[#3D2020] px-4 py-2 text-sm font-medium text-danger hover:bg-danger-strong/10 transition-colors"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
