<script setup>
import { reactive, watch } from 'vue';
import { CONTRACT_TYPES, STATUSES } from '../composables/useApplications';

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:filters', 'clear']);
const localFilters = reactive({ ...props.filters });

watch(
  () => props.filters,
  (filters) => Object.assign(localFilters, filters),
  { deep: true }
);

watch(
  localFilters,
  (filters) => emit('update:filters', { ...filters }),
  { deep: true }
);
</script>

<template>
  <section class="filters-bar" aria-label="Application filters">
    <label class="search-field">
      Search
      <input v-model="localFilters.search" type="search" placeholder="Search company, title, notes..." />
    </label>

    <label>
      Company
      <input v-model="localFilters.company" type="text" placeholder="Company" />
    </label>

    <label>
      City
      <input v-model="localFilters.city" type="text" placeholder="City" />
    </label>

    <label>
      Technology
      <input v-model="localFilters.technology" type="text" placeholder="Vue, Java..." />
    </label>

    <label>
      Status
      <select v-model="localFilters.status">
        <option value="">All</option>
        <option v-for="status in STATUSES" :key="status" :value="status">{{ status }}</option>
      </select>
    </label>

    <label>
      Contract
      <select v-model="localFilters.contractType">
        <option value="">All</option>
        <option v-for="type in CONTRACT_TYPES" :key="type" :value="type">{{ type }}</option>
      </select>
    </label>

    <button class="ghost-button filter-clear" type="button" @click="$emit('clear')">Clear filters</button>
  </section>
</template>
