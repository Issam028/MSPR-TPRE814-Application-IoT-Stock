<script setup>
import { computed, reactive } from 'vue';
import FiltersBar from '../components/FiltersBar.vue';
import KanbanBoard from '../components/KanbanBoard.vue';

const props = defineProps({
  applications: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['edit', 'delete', 'status-change']);

const filters = reactive({
  search: '',
  company: '',
  city: '',
  technology: '',
  status: '',
  contractType: '',
});

const filteredApplications = computed(() => {
  return props.applications.filter((application) => {
    const searchText = [
      application.company,
      application.jobTitle,
      application.city,
      application.contractType,
      application.technologies,
      application.notes,
      application.status,
    ]
      .join(' ')
      .toLowerCase();

    const matchSearch = !filters.search || searchText.includes(filters.search.toLowerCase());
    const matchCompany =
      !filters.company || application.company.toLowerCase().includes(filters.company.toLowerCase());
    const matchCity = !filters.city || application.city.toLowerCase().includes(filters.city.toLowerCase());
    const matchTechnology =
      !filters.technology ||
      application.technologies.toLowerCase().includes(filters.technology.toLowerCase());
    const matchStatus = !filters.status || application.status === filters.status;
    const matchContract = !filters.contractType || application.contractType === filters.contractType;

    return matchSearch && matchCompany && matchCity && matchTechnology && matchStatus && matchContract;
  });
});

function updateFilters(nextFilters) {
  Object.assign(filters, nextFilters);
}

function clearFilters() {
  Object.assign(filters, {
    search: '',
    company: '',
    city: '',
    technology: '',
    status: '',
    contractType: '',
  });
}

function handleStatusChange(id, status) {
  emit('status-change', id, status);
}
</script>

<template>
  <div class="kanban-view">
    <FiltersBar :filters="filters" @update:filters="updateFilters" @clear="clearFilters" />

    <div v-if="applications.length === 0" class="empty-state large-empty">
      No applications yet. Add one to build your pipeline.
    </div>

    <div v-else-if="filteredApplications.length === 0" class="empty-state large-empty">
      No applications match these filters.
    </div>

    <KanbanBoard
      v-else
      :applications="filteredApplications"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
      @status-change="handleStatusChange"
    />
  </div>
</template>
