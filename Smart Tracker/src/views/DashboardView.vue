<script setup>
import { computed } from 'vue';
import StatCard from '../components/StatCard.vue';
import { STATUSES } from '../composables/useApplications';

const props = defineProps({
  applications: {
    type: Array,
    required: true,
  },
  applicationsByStatus: {
    type: Object,
    required: true,
  },
  responseRate: {
    type: Number,
    required: true,
  },
  upcomingEvents: {
    type: Array,
    required: true,
  },
});

const latestApplications = computed(() =>
  [...props.applications]
    .sort((a, b) => new Date(b.applicationDate || 0) - new Date(a.applicationDate || 0))
    .slice(0, 4)
);
</script>

<template>
  <div class="dashboard-view">
    <section class="stats-grid">
      <StatCard label="Total applications" :value="applications.length" detail="All saved opportunities" />
      <StatCard
        label="Response rate"
        :value="`${responseRate}%`"
        detail="Interview, accepted or refused"
        tone="green"
      />
      <StatCard
        label="Upcoming events"
        :value="upcomingEvents.length"
        detail="Interviews and deadlines"
        tone="orange"
      />
      <StatCard
        label="Active pipeline"
        :value="applicationsByStatus.Applied + applicationsByStatus.Interview + applicationsByStatus.Waiting"
        detail="Still in progress"
        tone="purple"
      />
    </section>

    <section class="dashboard-layout">
      <article class="panel">
        <div class="panel-header">
          <h2>Applications by status</h2>
        </div>

        <div class="status-list">
          <div v-for="status in STATUSES" :key="status" class="status-row">
            <span>{{ status }}</span>
            <div class="status-track">
              <div
                class="status-fill"
                :style="{ width: applications.length ? `${(applicationsByStatus[status] / applications.length) * 100}%` : '0%' }"
              ></div>
            </div>
            <strong>{{ applicationsByStatus[status] }}</strong>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <h2>Upcoming interviews and deadlines</h2>
        </div>

        <div v-if="upcomingEvents.length" class="event-list">
          <div v-for="event in upcomingEvents" :key="event.id" class="event-item">
            <span>{{ event.type }}</span>
            <strong>{{ event.company }}</strong>
            <p>{{ event.title }} in {{ event.city || 'a city to confirm' }}</p>
            <time>{{ event.date }}</time>
          </div>
        </div>

        <div v-else class="empty-state">No upcoming interviews or deadlines.</div>
      </article>
    </section>

    <section class="panel">
      <div class="panel-header">
        <h2>Latest applications</h2>
      </div>

      <div v-if="latestApplications.length" class="latest-grid">
        <article v-for="application in latestApplications" :key="application.id" class="latest-card">
          <span>{{ application.status }}</span>
          <strong>{{ application.company }}</strong>
          <p>{{ application.jobTitle }}</p>
          <small>{{ application.applicationDate || 'No application date' }}</small>
        </article>
      </div>

      <div v-else class="empty-state">Add your first application to start tracking your search.</div>
    </section>
  </div>
</template>
