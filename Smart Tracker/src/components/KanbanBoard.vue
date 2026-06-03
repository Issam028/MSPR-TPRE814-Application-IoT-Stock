<script setup>
import { computed, ref } from 'vue';
import ApplicationCard from './ApplicationCard.vue';
import { STATUSES } from '../composables/useApplications';

const props = defineProps({
  applications: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['edit', 'delete', 'status-change']);
const draggedApplicationId = ref(null);

const groupedApplications = computed(() => {
  return STATUSES.reduce((result, status) => {
    result[status] = props.applications.filter((item) => item.status === status);
    return result;
  }, {});
});

function handleDrop(status) {
  if (!draggedApplicationId.value) return;

  emit('status-change', draggedApplicationId.value, status);
  draggedApplicationId.value = null;
}

function handleStatusChange(id, status) {
  emit('status-change', id, status);
}
</script>

<template>
  <section class="kanban-board" aria-label="Applications by status">
    <div
      v-for="status in STATUSES"
      :key="status"
      class="kanban-column"
      @dragover.prevent
      @drop="handleDrop(status)"
    >
      <header class="column-header">
        <h2>{{ status }}</h2>
        <span>{{ groupedApplications[status].length }}</span>
      </header>

      <div class="column-list">
        <ApplicationCard
          v-for="application in groupedApplications[status]"
          :key="application.id"
          :application="application"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @status-change="handleStatusChange"
          @drag-start="draggedApplicationId = $event"
        />

        <div v-if="groupedApplications[status].length === 0" class="empty-column">
          No applications in this status.
        </div>
      </div>
    </div>
  </section>
</template>
