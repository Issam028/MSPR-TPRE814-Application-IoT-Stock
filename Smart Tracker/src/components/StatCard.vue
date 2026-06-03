<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  detail: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    default: 'blue',
  },
});
</script>

<template>
  <article class="stat-card" :class="`tone-${tone}`">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <p v-if="detail">{{ detail }}</p>
  </article>
</template>
