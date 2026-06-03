<script setup>
defineProps({
  messages: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="toast-stack" aria-live="polite">
    <div v-for="message in messages" :key="message.id" class="toast">
      {{ message.text }}
    </div>
  </div>
</template>
