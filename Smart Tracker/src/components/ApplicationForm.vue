<script setup>
import { reactive, watch } from 'vue';
import { CONTRACT_TYPES, STATUSES } from '../composables/useApplications';

const props = defineProps({
  application: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'save']);

const emptyForm = {
  company: '',
  jobTitle: '',
  city: '',
  contractType: 'Stage',
  technologies: '',
  applicationDate: '',
  deadlineDate: '',
  interviewDate: '',
  status: 'Applied',
  notes: '',
  offerLink: '',
};

const form = reactive({ ...emptyForm });
const errors = reactive({});

watch(
  () => props.application,
  (application) => {
    Object.assign(form, emptyForm, application || {});
    Object.keys(errors).forEach((key) => delete errors[key]);
  },
  { immediate: true }
);

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key]);

  if (!form.company.trim()) errors.company = 'Company name is required.';
  if (!form.jobTitle.trim()) errors.jobTitle = 'Job title is required.';
  if (!form.status) errors.status = 'Status is required.';

  return Object.keys(errors).length === 0;
}

function submitForm() {
  if (!validate()) return;

  emit('save', {
    ...form,
    company: form.company.trim(),
    jobTitle: form.jobTitle.trim(),
    city: form.city.trim(),
    technologies: form.technologies.trim(),
    notes: form.notes.trim(),
    offerLink: form.offerLink.trim(),
    id: props.application?.id,
  });
}
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <section class="modal" aria-label="Application form">
      <div class="modal-header">
        <div>
          <p class="eyebrow">Application details</p>
          <h2>{{ application ? 'Edit application' : 'Add application' }}</h2>
        </div>
        <button class="icon-button" type="button" aria-label="Close form" @click="$emit('close')">
          x
        </button>
      </div>

      <form class="application-form" @submit.prevent="submitForm">
        <label>
          Company name *
          <input v-model="form.company" type="text" placeholder="Example: Thales" />
          <span v-if="errors.company" class="field-error">{{ errors.company }}</span>
        </label>

        <label>
          Job title *
          <input v-model="form.jobTitle" type="text" placeholder="Frontend developer intern" />
          <span v-if="errors.jobTitle" class="field-error">{{ errors.jobTitle }}</span>
        </label>

        <label>
          City
          <input v-model="form.city" type="text" placeholder="Paris" />
        </label>

        <label>
          Contract type
          <select v-model="form.contractType">
            <option v-for="type in CONTRACT_TYPES" :key="type" :value="type">{{ type }}</option>
          </select>
        </label>

        <label>
          Technologies used
          <input v-model="form.technologies" type="text" placeholder="Vue, Java, SQL" />
        </label>

        <label>
          Application date
          <input v-model="form.applicationDate" type="date" />
        </label>

        <label>
          Deadline date
          <input v-model="form.deadlineDate" type="date" />
        </label>

        <label>
          Interview date
          <input v-model="form.interviewDate" type="date" />
        </label>

        <label>
          Status *
          <select v-model="form.status">
            <option v-for="status in STATUSES" :key="status" :value="status">{{ status }}</option>
          </select>
          <span v-if="errors.status" class="field-error">{{ errors.status }}</span>
        </label>

        <label>
          Link to the offer
          <input v-model="form.offerLink" type="url" placeholder="https://..." />
        </label>

        <label class="form-wide">
          Notes
          <textarea v-model="form.notes" rows="4" placeholder="Contact, feedback, next steps..."></textarea>
        </label>

        <div class="form-actions form-wide">
          <button class="ghost-button" type="button" @click="$emit('close')">Cancel</button>
          <button class="primary-button" type="submit">
            {{ application ? 'Save changes' : 'Add application' }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
