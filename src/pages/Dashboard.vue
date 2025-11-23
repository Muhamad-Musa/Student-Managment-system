<template>
  <div class="dashboard">
    <h1>📊 Dashboard</h1>
    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      <p>📡 Loading data from Firebase...</p>
    </div>
    <!-- Overview Stats -->
    <div v-else class="stats">
      <div v-if="hasData" class="stat-grid">
        <div class="stat-card">
          <h3>Total Students</h3>
          <p class="stat-number">{{ totalStudents }}</p>
          <!-- Simple pie chart placeholder -->
          <svg viewBox="0 0 100 100" class="mini-chart">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#4ecdc4" stroke-width="8" stroke-dasharray="251.2 251.2" :style="{ strokeDashoffset: chartOffset }"></circle>
          </svg>
        </div>
        <div class="stat-card">
          <h3>Total Stages</h3>
          <p class="stat-number">{{ totalStages }}</p>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>👋 No data yet—add some students to get started!</p>
      </div>
    </div>
    <!-- Recent Students -->
    <div class="recent">
      <h2>🧑‍🎓 Recent Students</h2>
      <div v-if="!isLoading && recentStudents.length > 0" class="recent-table-container">
        <table class="recent-table" role="table" :aria-label="`Recent ${recentStudents.length} students`">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Stage</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in recentStudents" :key="student.id">
              <td>{{ student.name }}</td>
              <td>
                <BaseBadge variant="primary" size="small">{{ className(student.stage_id) }}</BaseBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="!isLoading" class="empty-state">No students yet</div>
      <div v-else>Loading students...</div>
    </div>
    <!-- Navigation Buttons -->
    <div class="nav-buttons">
      <router-link to="/students" class="nav-btn" aria-label="View all students">👥 View All Students</router-link>
      <router-link to="/add-student" class="nav-btn" aria-label="Add a new student">➕ Add Student</router-link>
      <router-link to="/class-management" class="nav-btn" aria-label="Manage stages">🏫 Manage Stages</router-link>
      <router-link to="/manage-courses" class="nav-btn" aria-label="Manage courses">📘 Manage Courses</router-link>
      <router-link to="/assign-courses" class="nav-btn" aria-label="Assign courses">✏️ Assign Courses</router-link>
      <router-link to="/attendance" class="nav-btn" aria-label="View attendance">📅 Attendance</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useStudentStore } from "../stores/studentStore";
import { useNotification } from "../composables/useNotification";
import { BaseBadge } from "../components/base";

const route = useRoute();
const store = useStudentStore();
const { error: notifyError } = useNotification();
const isLoading = ref(false);

// Check for unauthorized access
if (route.query.unauthorized) {
  notifyError("You don't have permission to access that page");
}

// Computed properties
const totalStudents = computed(() => store.totalStudents || 0);
const totalStages = computed(() => store.totalStages || 0);
const hasData = computed(() => totalStudents.value > 0 || totalStages.value > 0);

const recentStudents = computed(() => {
  // Sort by createdAt (descending for most recent first), then take top 5
  // Assumes students have a 'createdAt' field (e.g., timestamp from Firebase)
  return store.students
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
});

const chartOffset = computed(() => {
  const percent = totalStudents.value > 0 ? (totalStudents.value / 100) * 251.2 : 0; // Rough pie fill
  return 251.2 - percent;
});

function className(stageId) {
  const s = store.getStageById(stageId);
  return s ? s.name : "Unknown Stage";
}

// Load data from Firebase on mount
onMounted(async () => {
  isLoading.value = true;
  try {
    await Promise.all([
      store.fetchAllStudents(),
      store.fetchAllStages(),
    ]);
  } catch (err) {
    notifyError("Failed to load dashboard data: " + err.message);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 1000px;
  margin: auto;
}
h1 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}
.loading,
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 1.1rem;
}
.empty-state {
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 30px;
}
.stats {
  margin-bottom: 30px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
}
.stat-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  opacity: 0.9;
}
.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
}
.mini-chart {
  width: 60px;
  height: 60px;
  margin: 10px auto;
}
.recent {
  margin-top: 30px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}
.recent h2 {
  margin-top: 0;
  margin-bottom: 1rem;
}
.recent-table-container {
  overflow-x: auto; /* For mobile scrolling */
}
.recent-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}
.recent-table th,
.recent-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
.recent-table th {
  background: #f0f0f0;
  font-weight: bold;
}
.nav-buttons {
  margin-top: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}
.nav-btn {
  display: block;
  background: #2f80ed;
  color: white;
  text-decoration: none;
  padding: 12px 16px;
  border-radius: 6px;
  text-align: center;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.nav-btn:hover,
.nav-btn:focus {
  background: #2563be;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  outline: none;
}
</style>
