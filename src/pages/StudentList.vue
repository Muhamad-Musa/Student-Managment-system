<template>
  <div class="page">
    <h1>Student List</h1>

    <!-- Loading State -->
    <div v-if="store.loading" class="loading">
      <div class="spinner"></div>
      <p>Loading students...</p>
    </div>

    <template v-else>
      <div class="controls">
        <input v-model="query" placeholder="🔍 Search by name..." class="search-input" />
        <select v-model="stageFilter" class="stage-filter">
          <option value="">All Stages</option>
          <option v-for="s in store.stages" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <select v-model="prefsStore.viewMode" class="view-toggle">
          <option value="list">📋 List</option>
          <option value="grid">🎨 Grid</option>
        </select>
        <router-link class="btn primary" to="/add-student">+ Add Student</router-link>
      </div>

      <!-- List View -->
      <table class="students-table" v-if="prefsStore.viewMode === 'list' && filtered.length">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Stage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in paginated" :key="s.id">
            <td><strong>{{ s.name }}</strong></td>
            <td>{{ s.email || '—' }}</td>
            <td>{{ s.age || '—' }}</td>
            <td>{{ className(s.stage_id) }}</td>
            <td class="actions">
              <router-link :to="`/student/${s.id}`" class="btn">View</router-link>
              <BaseButton v-if="canDelete" variant="danger" size="small" @click="confirmDelete(s.id)">Delete</BaseButton>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Grid View -->
      <div class="students-grid" v-if="prefsStore.viewMode === 'grid' && filtered.length">
        <div class="student-card" v-for="s in paginated" :key="s.id">
          <h3>{{ s.name }}</h3>
          <p>📧 {{ s.email || '—' }}</p>
          <p>🎂 {{ s.age || '—' }} years</p>
          <p>🏫 {{ className(s.stage_id) }}</p>
          <div class="card-actions">
            <router-link :to="`/student/${s.id}`" class="btn">View</router-link>
            <BaseButton v-if="canDelete" variant="danger" size="small" @click="confirmDelete(s.id)">Delete</BaseButton>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!filtered.length && !store.loading" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No students found</h3>
        <p v-if="query || stageFilter">Try adjusting your search or filters</p>
        <p v-else>Start by adding your first student</p>
        <router-link to="/add-student" class="btn primary">+ Add Student</router-link>
      </div>

      <!-- Pagination -->
      <div class="pager" v-if="pages > 1">
        <BaseButton :disabled="page === 1" @click="page--">← Prev</BaseButton>
        <span>Page {{ page }} of {{ pages }} ({{ filtered.length }} students)</span>
        <BaseButton :disabled="page === pages" @click="page++">Next →</BaseButton>
      </div>
    </template>

    <!-- Error State -->
    <div v-if="store.error" class="error-banner">
      ⚠️ {{ store.error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStudentStore } from '../stores/studentStore'
import { usePrefsStore } from '../stores/prefsStore'
import { useAuthStore } from '../stores/authStore'
import { useNotification } from '../composables/useNotification'
import { BaseButton } from '../components/base'

const store = useStudentStore()
const prefsStore = usePrefsStore()
const authStore = useAuthStore()
const { success: notifySuccess, error: notifyError } = useNotification()

const query = ref('')
const stageFilter = ref('')
const page = ref(1)

const pageSize = computed(() => prefsStore.pageSize)
const canDelete = computed(() => authStore.isAdmin)

const filtered = computed(() => {
  let result = store.students
  
  // Filter by search query
  const q = query.value.trim().toLowerCase()
  if (q) {
    result = result.filter(
      (s) => s.name && s.name.toLowerCase().includes(q)
    )
  }
  
  // Filter by stage
  if (stageFilter.value) {
    result = result.filter((s) => String(s.stage_id) === String(stageFilter.value))
  }
  
  return result
})

const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))

const paginated = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

function className(stageId) {
  const s = store.getStageById(stageId)
  return s ? s.name : '—'
}

async function confirmDelete(id) {
  if (!canDelete.value) {
    notifyError('You do not have permission to delete students')
    return
  }
  
  if (!confirm('Are you sure? This cannot be undone.')) return
  
  try {
    await store.deleteStudent(id)
    notifySuccess('Student deleted successfully')
    
    // adjust page if necessary
    if ((page.value - 1) * pageSize.value >= filtered.value.length && page.value > 1) {
      page.value--
    }
  } catch (err) {
    notifyError('Failed to delete student: ' + err.message)
  }
}

// Reset to page 1 when filters change
watch([query, stageFilter], () => {
  page.value = 1
})

onMounted(async () => {
  // Load students and stages
  if (!store.students.length) {
    await store.fetchAllStudents()
  }
  if (!store.stages.length) {
    await store.fetchAllStages()
  }
  
  // ensure page within bounds
  if (page.value > pages.value) page.value = pages.value || 1
})
</script>

<style scoped>
.page { max-width: 1100px; margin: 1.2rem auto; padding: 0 1rem; }
h1 { margin-bottom: 0.6rem; color: #2c3e50; }

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2f80ed;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.controls { 
  display: flex; 
  gap: 0.5rem; 
  align-items: center; 
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.controls input.search-input { 
  flex: 1; 
  min-width: 200px;
  padding: 0.5rem; 
  border: 1px solid #ddd; 
  border-radius: 4px; 
}

.controls .stage-filter,
.controls .view-toggle {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.btn { 
  padding: 0.5rem 0.9rem; 
  border: 1px solid #bbb; 
  background: #f5f5f5; 
  border-radius: 4px; 
  text-decoration: none; 
  color: #222; 
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn:hover { background: #e8e8e8; }
.btn.primary { background: #2f80ed; color: white; border-color: #2f80ed; }
.btn.primary:hover { background: #2563be; }
.btn.danger { background: #ff4d4f; color: white; border-color: #ff4d4f; }
.btn.danger:hover { background: #d9363e; }

/* List View */
.students-table { 
  width: 100%; 
  border-collapse: collapse; 
  margin-top: 0.6rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.students-table th, 
.students-table td { 
  padding: 0.8rem; 
  text-align: left; 
  border-bottom: 1px solid #eee;
}

.students-table th {
  background: #f8f9fa;
  font-weight: bold;
  color: #2c3e50;
}

.students-table tr:hover {
  background: #f8f9fa;
}

.actions { 
  display: flex; 
  gap: 0.4rem; 
}

/* Grid View */
.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.student-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.2s;
}

.student-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.student-card h3 {
  margin: 0 0 0.8rem 0;
  color: #2c3e50;
}

.student-card p {
  margin: 0.3rem 0;
  color: #666;
  font-size: 0.9rem;
}

.card-actions {
  display: flex;
  gap: 0.4rem;
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px solid #eee;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.empty-state p {
  margin: 0.5rem 0 1.5rem 0;
}

/* Pagination */
.pager { 
  margin-top: 1.5rem; 
  display: flex; 
  gap: 1rem; 
  align-items: center;
  justify-content: center;
}

.pager button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pager button:hover:not(:disabled) {
  background: #2f80ed;
  color: white;
  border-color: #2f80ed;
}

.pager button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pager span {
  font-weight: 500;
  color: #2c3e50;
}

/* Error Banner */
.error-banner {
  background: #fdeaea;
  border: 1px solid #f5b7b1;
  color: #c0392b;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
}
</style>
