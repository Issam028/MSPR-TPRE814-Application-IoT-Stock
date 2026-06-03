<script setup>
defineProps({
  activeView: {
    type: String,
    required: true,
  },
  totalApplications: {
    type: Number,
    required: true,
  },
});

defineEmits(['add']);
</script>

<template>
  <header class="app-header">
    <div>
      <p class="eyebrow">Student career workspace</p>
      <h1>{{ activeView === 'dashboard' ? 'Dashboard' : 'Application board' }}</h1>
    </div>

    <div class="header-actions">
      <span class="total-pill">{{ totalApplications }} applications</span>
      <button class="primary-button" type="button" @click="$emit('add')">Add application</button>
    </div>
  </header>
</template>
