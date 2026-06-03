<script setup>
import { STATUSES } from '../composables/useApplications';

defineProps({
  application: {
    type: Object,
    required: true,
  },
});

defineEmits(['edit', 'delete', 'status-change', 'drag-start']);
</script>

<template>
  <article
    class="application-card"
    draggable="true"
    @dragstart="$emit('drag-start', application.id)"
  >
    <div class="card-top">
      <div>
        <h3>{{ application.company }}</h3>
        <p>{{ application.jobTitle }}</p>
      </div>
      <span class="status-badge">{{ application.status }}</span>
    </div>

    <dl class="application-meta">
      <div>
        <dt>City</dt>
        <dd>{{ application.city || 'Not set' }}</dd>
      </div>
      <div>
        <dt>Contract</dt>
        <dd>{{ application.contractType }}</dd>
      </div>
      <div>
        <dt>Applied</dt>
        <dd>{{ application.applicationDate || 'Not set' }}</dd>
      </div>
      <div>
        <dt>Next date</dt>
        <dd>{{ application.interviewDate || application.deadlineDate || 'Not set' }}</dd>
      </div>
    </dl>

    <p v-if="application.technologies" class="tech-list">{{ application.technologies }}</p>
    <p v-if="application.notes" class="notes">{{ application.notes }}</p>

    <a
      v-if="application.offerLink"
      class="offer-link"
      :href="application.offerLink"
      target="_blank"
      rel="noreferrer"
    >
      View offer
    </a>

    <div class="card-actions">
      <select
        :value="application.status"
        @change="$emit('status-change', application.id, $event.target.value)"
      >
        <option v-for="status in STATUSES" :key="status" :value="status">{{ status }}</option>
      </select>

      <button class="small-button" type="button" @click="$emit('edit', application)">Edit</button>
      <button class="small-button danger-text" type="button" @click="$emit('delete', application.id)">
        Delete
      </button>
    </div>
  </article>
</template>
