<script setup>
import { ref } from 'vue';
import AppHeader from './components/AppHeader.vue';
import ApplicationForm from './components/ApplicationForm.vue';
import Sidebar from './components/Sidebar.vue';
import Toast from './components/Toast.vue';
import { useApplications } from './composables/useApplications';
import DashboardView from './views/DashboardView.vue';
import KanbanView from './views/KanbanView.vue';

const activeView = ref('dashboard');
const showForm = ref(false);
const selectedApplication = ref(null);
const toasts = ref([]);

const {
  applications,
  totalApplications,
  applicationsByStatus,
  responseRate,
  upcomingEvents,
  addApplication,
  updateApplication,
  deleteApplication,
  updateStatus,
  clearApplications,
} = useApplications();

function showToast(text) {
  const id = crypto.randomUUID();
  toasts.value.push({ id, text });
  setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }, 2800);
}

function openAddForm() {
  selectedApplication.value = null;
  showForm.value = true;
}

function openEditForm(application) {
  selectedApplication.value = { ...application };
  showForm.value = true;
}

function handleSave(application) {
  if (application.id) {
    updateApplication(application);
    showToast('Application updated.');
  } else {
    addApplication(application);
    showToast('Application added.');
  }

  showForm.value = false;
}

function handleDelete(id) {
  deleteApplication(id);
  showToast('Application deleted.');
}

function handleStatusChange(id, status) {
  updateStatus(id, status);
  showToast(`Moved to ${status}.`);
}

function handleClearData() {
  clearApplications();
  showToast('All application data cleared.');
}
</script>

<template>
  <div class="app-shell">
    <Sidebar
      :active-view="activeView"
      @navigate="activeView = $event"
      @clear="handleClearData"
    />

    <main class="main-content">
      <AppHeader
        :active-view="activeView"
        :total-applications="totalApplications"
        @add="openAddForm"
      />

      <DashboardView
        v-if="activeView === 'dashboard'"
        :applications="applications"
        :applications-by-status="applicationsByStatus"
        :response-rate="responseRate"
        :upcoming-events="upcomingEvents"
      />

      <KanbanView
        v-else
        :applications="applications"
        @edit="openEditForm"
        @delete="handleDelete"
        @status-change="handleStatusChange"
      />
    </main>

    <ApplicationForm
      v-if="showForm"
      :application="selectedApplication"
      @close="showForm = false"
      @save="handleSave"
    />

    <Toast :messages="toasts" />
  </div>
</template>
