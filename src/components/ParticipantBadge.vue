<script setup>
defineProps({
  status: { type: String, required: true },
})

const styles = {
  HOST: 'participant-badge--host',
  INVITED: 'participant-badge--invited',
  ACCEPTED: 'participant-badge--accepted',
  DECLINED: 'participant-badge--declined',
}

const labels = {
  HOST: 'Host',
  INVITED: 'Uitgenodigd',
  ACCEPTED: 'Geaccepteerd',
  DECLINED: 'Afgewezen',
}
</script>

<template>
  <span
    class="participant-badge"
    :class="styles[status]"
  >
    {{ labels[status] ?? status }}
  </span>
</template>

<style scoped>
.participant-badge {
  display: inline-block;
  border-radius: 9999px;
  padding: 0.25rem 0.625rem;
  font-size: 11px;
  font-weight: 500;
}

.participant-badge--host {
  background-color: color-mix(in srgb, var(--color-accent) 15%, transparent);
  color: var(--color-accent-light);
}

.participant-badge--invited {
  background-color: color-mix(in srgb, var(--color-accent) 15%, transparent);
  color: var(--color-accent-light);
}

.participant-badge--accepted {
  background-color: color-mix(in srgb, var(--color-success-strong) 15%, transparent);
  color: var(--color-success);
}

.participant-badge--declined {
  background-color: color-mix(in srgb, var(--color-danger-strong) 15%, transparent);
  color: var(--color-danger);
}
</style>
