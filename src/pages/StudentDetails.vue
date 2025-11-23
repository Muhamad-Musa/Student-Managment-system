<template>
  <div class="page" v-if="student">
    <h1>Student Details</h1>

    <div class="card">
      <div class="row"><strong>Name:</strong> <span>{{ student.name }}</span></div>
      <div class="row"><strong>Age:</strong> <span>{{ student.age ?? '—' }}</span></div>
      <div class="row"><strong>Email:</strong> <span>{{ student.email }}</span></div>
      <div class="row"><strong>Stage:</strong> <span>{{ className(student.stage_id) }}</span></div>
      <div class="row">
        <strong>Assigned Courses:</strong>
        <div v-if="studentCourses.length">
          <ul>
            <li v-for="c in studentCourses" :key="c.id">
              {{ c.name }}
              <BaseBadge variant="info" size="small">{{ c.credits || 3 }} credits</BaseBadge>
            </li>
          </ul>
        </div>
        <div v-else>— No courses assigned</div>
      </div>

      <div class="actions">
        <router-link class="btn" to="/students">Back</router-link>
        <BaseButton variant="primary" @click="() => router.push('/assign-courses')">Assign Courses</BaseButton>
        <BaseButton variant="danger" @click="deleteStudent">Delete Student</BaseButton>
      </div>
    </div>
  </div>

  <div v-else class="page">
    <p>Student not found.</p>
    <router-link to="/students" class="btn">Back to list</router-link>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useStudentStore } from '../stores/studentStore'
import { computed, onMounted } from 'vue'
import { BaseButton, BaseBadge } from '../components/base'

const route = useRoute()
const router = useRouter()
const store = useStudentStore()
const id = route.params.id

console.log('📄 StudentDetails: Loading student with id:', id);
const student = store.getStudentById(id)
console.log('👤 Student data:', student);

onMounted(async () => {
  if (student) {
    console.log('🔄 Fetching enrollments for student:', student.id);
    try {
      await store.fetchStudentEnrollments(student.id);
      console.log('✅ Enrollments loaded');
    } catch (err) {
      console.error('❌ Failed to load enrollments:', err);
    }
  }
});

const studentCourses = computed(() => {
  if (!student) return []
  console.log('🔄 Computing student courses...');
  const courses = store.getStudentCourses(student.id);
  console.log('📚 Computed courses:', courses);
  return courses;
})

function className(stageId) {
  const s = store.getStageById(stageId)
  return s ? s.name : '—'
}

function deleteStudent() {
  if (!confirm('Delete this student? This action cannot be undone.')) return
  store.deleteStudent(student.id)
  router.push('/students')
}
</script>

<style scoped>
.page { max-width:700px; margin:1.2rem auto; padding:0 1rem; }
h1 { margin-bottom: 1rem; }
.card { border:1px solid #eee; padding:1rem; border-radius:6px; background:#fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.row { display:flex; gap:0.8rem; margin-bottom:0.8rem; align-items: flex-start; }
.row strong { min-width: 120px; }
.row ul { list-style: none; padding: 0; margin: 0; }
.row li { padding: 0.3rem 0; }
.actions { margin-top:1.2rem; display:flex; gap:0.6rem; }
.btn { padding:0.45rem 0.7rem; border:1px solid #bbb; background:#f5f5f5; border-radius:4px; text-decoration:none; color:#222; cursor:pointer; }
.btn.danger { background:#ff4d4f; color:white; border-color:#ff4d4f; }

/* Dark Theme */
[data-theme="dark"] .page {
  color: #e0e0e0;
}

[data-theme="dark"] h1 {
  color: #f0f0f0;
}

[data-theme="dark"] .card {
  background: #2a2a2a;
  border-color: #444;
  color: #e0e0e0;
}

[data-theme="dark"] .row strong {
  color: #f0f0f0;
}

[data-theme="dark"] .btn {
  background: #2a2a2a;
  border-color: #444;
  color: #e0e0e0;
}

[data-theme="dark"] .btn:hover {
  background: #333;
}

[data-theme="dark"] .btn.danger {
  background: #ff4d4f;
  color: white;
  border-color: #ff4d4f;
}
</style>
