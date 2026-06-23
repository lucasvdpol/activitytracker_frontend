<script setup>
import Spinner from './Spinner.vue'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Weet je het zeker?' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Bevestigen' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div
    v-if="open"
    class="confirm-dialog__overlay"
    @click.self="emit('cancel')"
  >
    <div class="confirm-dialog__panel">
      <h3 class="confirm-dialog__title">{{ title }}</h3>
      <p v-if="message" class="confirm-dialog__message">{{ message }}</p>
      <div class="confirm-dialog__actions">
        <button
          @click="emit('cancel')"
          :disabled="loading"
          class="confirm-dialog__cancel"
        >
          Annuleren
        </button>
        <button
          @click="emit('confirm')"
          :disabled="loading"
          class="confirm-dialog__confirm"
        >
          <Spinner v-if="loading" size="14" />
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 0 1rem;
}

.confirm-dialog__panel {
  width: 100%;
  max-width: 24rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 1.5rem;
}

.confirm-dialog__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.confirm-dialog__message {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.confirm-dialog__actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.confirm-dialog__cancel {
  border-radius: 0.5rem;
  border: 1px solid var(--color-border-strong);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.confirm-dialog__cancel:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.confirm-dialog__cancel:disabled {
  opacity: 0.5;
}

.confirm-dialog__confirm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #3D2020;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-danger);
  transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
}

.confirm-dialog__confirm:hover {
  background-color: color-mix(in srgb, var(--color-danger-strong) 10%, transparent);
}

.confirm-dialog__confirm:disabled {
  opacity: 0.5;
}
</style>
