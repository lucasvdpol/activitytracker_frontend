<script setup>
defineProps({
  status: { type: String, required: true },
})

const styles = {
  HOST: 'bg-accent/15 text-accent-light',
  INVITED: 'bg-accent/15 text-accent-light',
  ACCEPTED: 'bg-success-strong/15 text-success',
  DECLINED: 'bg-danger-strong/15 text-danger',
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
    class="inline-block rounded-full px-2.5 py-1 text-[11px] font-medium"
    :class="styles[status]"
  >
    {{ labels[status] ?? status }}
  </span>
</template>
