<template>
  <div class="page">
    <h1>📘 Manage Courses</h1>

    <!-- Add Course Form -->
    <div class="form-section">
      <h2>Add New Course</h2>
      <form @submit.prevent="onAddCourse" class="form">
        <BaseInput
          v-model="newCourse.name"
          label="Course Name"
          placeholder="e.g., Mathematics"
          :error="errors.name"
          required
        />
        <BaseInput
          v-model="newCourse.code"
          label="Course Code"
          placeholder="e.g., MATH101"
          :error="errors.code"
        />
        <BaseInput
          v-model.number="newCourse.credits"
          label="Credits"
          type="number"
          placeholder="e.g., 3"
          min="1"
          max="10"
        />
        <BaseSelect
          v-model="newCourse.stageId"
          label="Academic Stage"
          :error="errors.stageId"
          placeholder="Select a stage (optional)"
        >
          <option v-for="stage in store.stages" :key="stage.id" :value="stage.id">
            {{ stage.name }} (Level {{ stage.level || 1 }})
          </option>
        </BaseSelect>
        <BaseInput
          v-model="newCourse.instructorName"
          label="Instructor Name"
          placeholder="e.g., Dr. Smith"
        />
        <BaseInput
          v-model="newCourse.description"
          label="Description"
          placeholder="Course description"
        />
        <div class="form-actions">
          <BaseButton variant="primary" type="submit" :disabled="store.loading" :loading="store.loading">
            Add Course
          </BaseButton>
          <BaseButton variant="secondary" type="reset" @click="resetForm">Clear</BaseButton>
        </div>
      </form>
      <div v-if="successMessage" class="notice success">✅ {{ successMessage }}</div>
      <div v-if="errorMessage" class="notice error">❌ {{ errorMessage }}</div>
    </div>

    <!-- Courses List -->
    <div class="list-section">
      <h2>All Courses ({{ store.courses.length }})</h2>
      
      <div v-if="store.loading" class="loading">Loading courses...</div>
      
      <div v-else-if="store.courses.length === 0" class="empty">
        No courses yet. Add one above! 👆
      </div>

      <table v-else class="courses-table">
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Code</th>
            <th>Credits</th>
            <th>Stage</th>
            <th>Instructor</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in store.courses" :key="course.id">
            <td>
              <strong>{{ course.name }}</strong>
              <p v-if="course.description" class="description">{{ course.description }}</p>
            </td>
            <td>
              <BaseBadge v-if="course.code" variant="info" size="small">{{ course.code }}</BaseBadge>
              <span v-else class="no-data">—</span>
            </td>
            <td>{{ course.credits || 3 }}</td>
            <td>
              <span v-if="course.stageId">{{ getStageName(course.stageId) }}</span>
              <span v-else class="no-data">—</span>
            </td>
            <td>
              <span v-if="course.instructorName">{{ course.instructorName }}</span>
              <span v-else class="no-data">—</span>
            </td>
            <td class="actions">
              <BaseButton variant="danger" size="small" @click="confirmDelete(course.id)">Delete</BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useStudentStore } from "../stores/studentStore";
import { useNotification } from "../composables/useNotification";
import { BaseInput, BaseButton, BaseBadge, BaseSelect } from "../components/base";

const store = useStudentStore();
const { success, error: notifyError } = useNotification();

const newCourse = ref({
  name: "",
  code: "",
  credits: 3,
  stageId: "",
  instructorName: "",
  description: "",
});
const errors = ref({ name: "", code: "", stageId: "" });
const successMessage = ref("");
const errorMessage = ref("");

// Get stage name by ID
function getStageName(stageId) {
  const stage = store.stages.find(s => s.id === stageId);
  return stage ? stage.name : 'Unknown';
}

// Load data on mount
onMounted(async () => {
  try {
    await Promise.all([
      store.fetchAllCourses(),
      store.fetchAllStages()
    ]);
  } catch (err) {
    errorMessage.value = "Failed to load data";
  }
});

// Add course
async function onAddCourse() {
  errors.value = { name: "", code: "", stageId: "" };
  errorMessage.value = "";
  successMessage.value = "";

  if (!newCourse.value.name.trim()) {
    errors.value.name = "Course name is required";
    return;
  }

  try {
    await store.addCourse(newCourse.value);
    successMessage.value = `Course "${newCourse.value.name}" added successfully!`;
    success(`Course "${newCourse.value.name}" added!`);
    resetForm();
  } catch (err) {
    errorMessage.value = "Failed to add course: " + err.message;
    notifyError("Failed to add course");
  }
}

// Delete course
function confirmDelete(courseId) {
  const course = store.courses.find(c => c.id === courseId);
  if (confirm(`Delete course "${course.name}"? This cannot be undone.`)) {
    deleteCourse(courseId);
  }
}

async function deleteCourse(courseId) {
  try {
    await store.deleteCourse(courseId);
    success("Course deleted!");
  } catch (err) {
    notifyError("Failed to delete course");
  }
}

// Reset form
function resetForm() {
  newCourse.value = {
    name: "",
    code: "",
    credits: 3,
    stageId: "",
    instructorName: "",
    description: "",
  };
  errors.value = { name: "", code: "", stageId: "" };
  successMessage.value = "";
}
</script>

<style scoped>
.page {
  max-width: 900px;
  margin: 1.2rem auto;
  padding: 0 1rem;
}

h1 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #34495e;
  font-size: 1.2rem;
}

.form-section,
.list-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
}

label {
  display: flex;
  flex-direction: column;
  font-weight: bold;
  font-size: 0.95rem;
}

input {
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 0.3rem;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #2f80ed;
  box-shadow: 0 0 0 3px rgba(47, 128, 237, 0.1);
}

.form-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.6rem 1rem;
  border: 1px solid #bbb;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  background: #e0e0e0;
  border-color: #999;
}

.btn.primary {
  background: #2f80ed;
  color: white;
  border-color: #2f80ed;
}

.btn.primary:hover:not(:disabled) {
  background: #2563be;
}

.btn.danger {
  background: #ff4d4f;
  color: white;
  border-color: #ff4d4f;
}

.btn.danger:hover {
  background: #d9363e;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #c0392b;
  font-size: 0.85rem;
  margin-top: 0.2rem;
}

.notice {
  margin-top: 1rem;
  padding: 0.8rem;
  border-radius: 4px;
  font-size: 0.95rem;
}

.notice.success {
  background: #ecf9f1;
  border: 1px solid #bfe9cf;
  color: #27ae60;
}

.notice.error {
  background: #fdeaea;
  border: 1px solid #f5b7b1;
  color: #c0392b;
}

.loading,
.empty {
  padding: 2rem;
  text-align: center;
  color: #666;
  font-size: 1rem;
}

.courses-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.courses-table th,
.courses-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.courses-table th {
  background: #f0f0f0;
  font-weight: bold;
  color: #333;
}

.courses-table tbody tr:hover {
  background: #f9f9f9;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.actions .btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.description {
  margin: 0.3rem 0 0 0;
  font-size: 0.85rem;
  color: #666;
}

.no-data {
  color: #999;
  font-style: italic;
}

/* Dark Theme */
[data-theme="dark"] .page {
  color: #e0e0e0;
}

[data-theme="dark"] h1,
[data-theme="dark"] h2 {
  color: #f0f0f0;
}

[data-theme="dark"] .form-section,
[data-theme="dark"] .list-section {
  background: #2a2a2a;
}

[data-theme="dark"] label {
  color: #f0f0f0;
}

[data-theme="dark"] input {
  background: #1e1e1e;
  border-color: #444;
  color: #e0e0e0;
}

[data-theme="dark"] input::placeholder {
  color: #666;
}

[data-theme="dark"] input:focus {
  border-color: #2f80ed;
  box-shadow: 0 0 0 3px rgba(47, 128, 237, 0.2);
}

[data-theme="dark"] .btn {
  background: #1e1e1e;
  border-color: #444;
  color: #e0e0e0;
}

[data-theme="dark"] .btn:hover:not(:disabled) {
  background: #333;
}

[data-theme="dark"] .btn.primary {
  background: #2f80ed;
  color: white;
  border-color: #2f80ed;
}

[data-theme="dark"] .btn.primary:hover:not(:disabled) {
  background: #2563be;
}

[data-theme="dark"] .btn.danger {
  background: #ff4d4f;
  color: white;
  border-color: #ff4d4f;
}

[data-theme="dark"] .btn.danger:hover {
  background: #d9363e;
}

[data-theme="dark"] .notice.success {
  background: #1a3d1a;
  border-color: #2d5a2d;
  color: #7ec87e;
}

[data-theme="dark"] .notice.error {
  background: #3d1f1f;
  border-color: #5a2a2a;
  color: #ff6b6b;
}

[data-theme="dark"] .loading,
[data-theme="dark"] .empty {
  color: #999;
}

[data-theme="dark"] .courses-table {
  background: #1e1e1e;
  color: #e0e0e0;
}

[data-theme="dark"] .courses-table th {
  background: #2a2a2a;
  color: #f0f0f0;
  border-bottom-color: #444;
}

[data-theme="dark"] .courses-table td {
  border-bottom-color: #444;
}

[data-theme="dark"] .courses-table tbody tr:hover {
  background: #2a2a2a;
}

[data-theme="dark"] .description {
  color: #999;
}

[data-theme="dark"] .no-data {
  color: #666;
}
</style>
