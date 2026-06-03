<script setup>
defineProps({
  activeView: {
    type: String,
    required: true,
  },
});

defineEmits(['navigate', 'clear']);
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">SJ</div>
      <div>
        <strong>Smart Tracker</strong>
        <span>Job applications</span>
      </div>
    </div>

    <nav class="sidebar-nav" aria-label="Main navigation">
      <button
        type="button"
        :class="{ active: activeView === 'dashboard' }"
        @click="$emit('navigate', 'dashboard')"
      >
        Dashboard
      </button>
      <button
        type="button"
        :class="{ active: activeView === 'kanban' }"
        @click="$emit('navigate', 'kanban')"
      >
        Kanban board
      </button>
    </nav>

    <div class="sidebar-footer">
      <button class="danger-button" type="button" @click="$emit('clear')">Clear all data</button>
    </div>
  </aside>
</template>
