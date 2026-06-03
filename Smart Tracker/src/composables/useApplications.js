import { computed } from 'vue';
import { demoApplications } from '../data/demoApplications';
import { useLocalStorage } from './useLocalStorage';

export const STATUSES = ['Applied', 'Interview', 'Waiting', 'Refused', 'Accepted'];
export const CONTRACT_TYPES = ['Stage', 'Alternance', 'CDI', 'CDD'];

function createDemoApplications() {
  return demoApplications.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
  }));
}

export function useApplications() {
  const applications = useLocalStorage('smart-job-applications', createDemoApplications());

  const totalApplications = computed(() => applications.value.length);

  const applicationsByStatus = computed(() => {
    return STATUSES.reduce((result, status) => {
      result[status] = applications.value.filter((item) => item.status === status).length;
      return result;
    }, {});
  });

  const responseRate = computed(() => {
    if (!applications.value.length) return 0;

    const answered = applications.value.filter((item) =>
      ['Interview', 'Refused', 'Accepted'].includes(item.status)
    ).length;

    return Math.round((answered / applications.value.length) * 100);
  });

  const upcomingEvents = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return applications.value
      .flatMap((item) => {
        const events = [];

        if (item.interviewDate) {
          events.push({
            id: `${item.id}-interview`,
            type: 'Interview',
            date: item.interviewDate,
            company: item.company,
            title: item.jobTitle,
            city: item.city,
          });
        }

        if (item.deadlineDate) {
          events.push({
            id: `${item.id}-deadline`,
            type: 'Deadline',
            date: item.deadlineDate,
            company: item.company,
            title: item.jobTitle,
            city: item.city,
          });
        }

        return events;
      })
      .filter((event) => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  });

  function addApplication(payload) {
    applications.value.unshift({
      id: crypto.randomUUID(),
      ...payload,
    });
  }

  function updateApplication(updatedApplication) {
    applications.value = applications.value.map((item) =>
      item.id === updatedApplication.id ? updatedApplication : item
    );
  }

  function deleteApplication(id) {
    applications.value = applications.value.filter((item) => item.id !== id);
  }

  function updateStatus(id, status) {
    applications.value = applications.value.map((item) =>
      item.id === id ? { ...item, status } : item
    );
  }

  function clearApplications() {
    applications.value = [];
  }

  return {
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
  };
}
