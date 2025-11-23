<template>
  <nav v-if="!$route.meta.hideNavbar">
    <div class="nav-container">
      <ul>
        <li><router-link to="/">Dashboard</router-link></li>
        <li><router-link to="/students">Students</router-link></li>
        <li v-if="canAddStudent"><router-link to="/add-student">Add Student</router-link></li>
        <li v-if="authStore.isAdmin"><router-link to="/class-management">Classes</router-link></li>
        <li v-if="canAssignCourses"><router-link to="/assign-courses">Assign Courses</router-link></li>
        <li v-if="canManageAttendance"><router-link to="/attendance">Attendance</router-link></li>
        <li v-if="authStore.isAdmin"><router-link to="/manage-courses">Courses</router-link></li>
      </ul>
      
      <div class="nav-actions">
        <div v-if="authStore.isAuthenticated" class="user-info">
          <span class="user-name">{{ authStore.userName }}</span>
          <BaseBadge :variant="authStore.isAdmin ? 'danger' : 'success'" size="small">
            {{ authStore.userRole }}
          </BaseBadge>
        </div>
        <ThemeToggle />
        <BaseButton 
          v-if="authStore.isAuthenticated" 
          @click="handleLogout" 
          variant="danger"
          size="small"
        >
          🚪 Logout
        </BaseButton>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useNotification } from '../composables/useNotification'
import ThemeToggle from './ThemeToggle.vue'
import { BaseButton, BaseBadge } from './base'

const router = useRouter()
const authStore = useAuthStore()
const { success: notifySuccess } = useNotification()

// Role-based computed properties
const canAddStudent = computed(() => {
  return authStore.isAdmin || authStore.isTeacher
})

const canAssignCourses = computed(() => {
  return authStore.isAdmin || authStore.isTeacher
})

const canManageAttendance = computed(() => {
  return authStore.isAdmin || authStore.isTeacher
})

const roleClass = computed(() => {
  return authStore.isAdmin ? 'role-admin' : 'role-teacher'
})

const handleLogout = () => {
  authStore.logout()
  notifySuccess('Logged out successfully')
}
</script>

<style scoped>
nav {
  background-color: #2c3e50;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

nav ul {
  display: flex;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
  flex: 1;
}

nav li {
  margin: 0;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s;
  display: block;
  white-space: nowrap;
}

nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

nav a.router-link-active {
  background-color: #0078d4;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
}

.user-name {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-role {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-admin {
  background: #ff4d4f;
  color: white;
}

.role-teacher {
  background: #52c41a;
  color: white;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  white-space: nowrap;
}

.btn-logout:hover {
  background: rgba(255, 77, 79, 0.8);
  border-color: #ff4d4f;
  transform: translateY(-1px);
}

/* Dark theme adjustments */
:global([data-theme="dark"]) nav {
  background-color: #1a1a1a;
}

:global([data-theme="dark"]) nav a.router-link-active {
  background-color: #2f80ed;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  nav ul {
    justify-content: center;
  }
  
  .nav-actions {
    justify-content: space-between;
    width: 100%;
  }
  
  .user-info {
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
  }
}
</style>
