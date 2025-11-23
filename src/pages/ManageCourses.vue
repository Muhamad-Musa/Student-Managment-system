<template>
  <div class="page">
    <h1>📘 Manage Courses</h1>

    <!-- Add Course Form -->
    <div class="form-section">
      <h2>Add New Course</h2>
      <form @submit.prevent="onAddCourse" class="form">
        <BaseInput
          v-model="newCourseName"
          label="Course Name"
          placeholder="e.g., Mathematics"
          :error="errors.courseName"
          required
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in store.courses" :key="course.id">
            <td>
              <strong>{{ course.name }}</strong>
              <BaseBadge variant="info" size="small">{{ course.credits || 3 }} credits</BaseBadge>
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
import { ref, onMounted } from "vue";
import { useStudentStore } from "../stores/studentStore";
import { useNotification } from "../composables/useNotification";
import { BaseInput, BaseButton, BaseBadge } from "../components/base";

const store = useStudentStore();
const { success, error: notifyError } = useNotification();

const newCourseName = ref("");
const errors = ref({ courseName: "" });
const successMessage = ref("");
const errorMessage = ref("");

// Load courses on mount
onMounted(async () => {
  try {
    await store.fetchAllCourses();
  } catch (err) {
    errorMessage.value = "Failed to load courses";
  }
});

// Add course
async function onAddCourse() {
  errors.value.courseName = "";
  errorMessage.value = "";
  successMessage.value = "";

  if (!newCourseName.value.trim()) {
    errors.value.courseName = "Course name is required";
    return;
  }

  try {
    await store.addCourse(newCourseName.value.trim());
    successMessage.value = `Course "${newCourseName.value}" added successfully!`;
    success(`Course "${newCourseName.value}" added!`);
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
  newCourseName.value = "";
  errors.value.courseName = "";
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
</style>
