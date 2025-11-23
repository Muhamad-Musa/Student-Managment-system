<template>
  <div class="assign-courses">
    <h1>📘 Assign Courses</h1>

    <!-- Select student -->
    <div class="form-group">
      <BaseSelect v-model="selectedStudentId" label="Select Student">
        <option value="">-- Choose a student --</option>
        <option
          v-for="student in store.students"
          :key="student.id"
          :value="student.id"
        >
          {{ student.name }}
        </option>
      </BaseSelect>
    </div>

    <!-- Select courses -->
    <div v-if="selectedStudentId" class="form-group">
      <label>Available Courses:</label>
      <div class="courses-list">
        <div
          v-for="course in store.courses"
          :key="course.id"
          class="course-item"
        >
          <input
            type="checkbox"
            :id="'course-' + course.id"
            :value="course.id"
            v-model="selectedCourses"
          />
          <label :for="'course-' + course.id">
            {{ course.name }}
            <BaseBadge variant="info" size="small">{{ course.credits || 3 }} credits</BaseBadge>
          </label>
        </div>
      </div>
    </div>

    <!-- Assign button -->
    <BaseButton
      v-if="selectedStudentId"
      variant="primary"
      @click="assignCourses"
      :disabled="selectedCourses.length === 0"
    >
      Assign Selected Courses
    </BaseButton>

    <!-- Assigned courses -->
    <div v-if="selectedStudent && assignedCourses.length" class="assigned-list">
      <h2>🎓 Currently Assigned Courses</h2>
      <ul>
        <li v-for="course in assignedCourses" :key="course.id">
          {{ course.name }}
          <BaseBadge variant="success">Enrolled</BaseBadge>
        </li>
      </ul>
    </div>

    <p v-else-if="selectedStudentId" class="empty-msg">
      No courses assigned yet.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStudentStore } from "../stores/studentStore";
import { useNotification } from "../composables/useNotification";
import { BaseSelect, BaseButton, BaseBadge } from "../components/base";

const store = useStudentStore();
const { success: notifySuccess, error: notifyError } = useNotification();

const selectedStudentId = ref('');
const selectedCourses = ref([]);
const isLoading = ref(false);

// Load data on mount
onMounted(async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      store.fetchAllStudents(),
      store.fetchAllCourses(),
    ]);
  } catch (err) {
    notifyError("Failed to load data: " + err.message);
  } finally {
    isLoading.value = false;
  }
});

const selectedStudent = computed(() =>
  store.getStudentById(selectedStudentId.value)
);

const assignedCourses = computed(() => {
  if (!selectedStudentId.value) return [];
  console.log('🔄 AssignCourses: Computing assigned courses...');
  // store.getStudentCourses now returns course objects directly
  const courses = store.getStudentCourses(selectedStudentId.value) || [];
  console.log('📚 AssignCourses: Got courses:', courses);
  return courses;
});

async function assignCourses() {
  if (!selectedStudentId.value || selectedCourses.value.length === 0) return;

  try {
    await store.assignCourses(selectedStudentId.value, selectedCourses.value);
    notifySuccess("✅ Courses assigned successfully!");
    selectedCourses.value = [];
    // refresh enrollments for this student to keep UI in sync
    try {
      await store.fetchStudentEnrollments(selectedStudentId.value);
    } catch (err) {
      notifyError("Warning: failed to refresh enrollments: " + err.message);
    }
  } catch (err) {
    notifyError("Failed to assign courses: " + err.message);
  }
}

// When selected student changes, clear any selected courses and fetch their enrollments
watch(selectedStudentId, async (newId) => {
  selectedCourses.value = [];
  if (!newId) return;
  try {
    await store.fetchStudentEnrollments(String(newId));
  } catch (err) {
    notifyError("Failed to load student enrollments: " + err.message);
  }
});
</script>

<style scoped>
.assign-courses {
  padding: 20px;
  max-width: 800px;
  margin: auto;
}

.form-group {
  margin-bottom: 20px;
}

label {
  font-weight: bold;
  display: block;
  margin-bottom: 6px;
}

select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.courses-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 10px;
}

.course-item {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-item input {
  cursor: pointer;
}

.course-item label {
  margin: 0;
  display: inline;
  font-weight: normal;
  cursor: pointer;
}

.assign-btn {
  display: inline-block;
  background: #2f80ed;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;
  font-weight: bold;
}

.assign-btn:hover:not(:disabled) {
  background: #2563be;
}

.assign-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.assigned-list {
  margin-top: 30px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.assigned-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.assigned-list li {
  background: white;
  padding: 8px;
  margin-bottom: 6px;
  border-radius: 4px;
  border-left: 3px solid #2f80ed;
}

.empty-msg {
  color: #777;
  font-style: italic;
  margin-top: 20px;
}

/* Dark Theme */
[data-theme="dark"] .assign-courses {
  color: #e0e0e0;
}

[data-theme="dark"] label {
  color: #f0f0f0;
}

[data-theme="dark"] select {
  background: #1e1e1e;
  border-color: #444;
  color: #e0e0e0;
}

[data-theme="dark"] .courses-list {
  color: #e0e0e0;
}

[data-theme="dark"] .course-item {
  background: #2a2a2a;
  color: #e0e0e0;
}

[data-theme="dark"] .course-item label {
  color: #e0e0e0;
}

[data-theme="dark"] .assigned-list {
  background: #2a2a2a;
}

[data-theme="dark"] .assigned-list li {
  background: #1e1e1e;
  color: #e0e0e0;
  border-left-color: #2f80ed;
}

[data-theme="dark"] .empty-msg {
  color: #999;
}
</style>
