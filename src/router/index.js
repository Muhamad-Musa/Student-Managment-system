import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

// Eager load critical pages
import Login from '../pages/Login.vue'
import Dashboard from '../pages/Dashboard.vue'

// Lazy load other pages for code splitting
const StudentList = () => import('../pages/StudentList.vue')
const AddStudent = () => import('../pages/AddStudent.vue')
const StudentDetails = () => import('../pages/StudentDetails.vue')
const ManageStages = () => import('../pages/ManageStages.vue')
const ManageCourses = () => import('../pages/ManageCourses.vue')
const AssignCourses = () => import('../pages/AssignCourses.vue')
const AttendanceTracking = () => import('../pages/AttendanceTracking.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false, hideNavbar: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/students',
    name: 'StudentList',
    component: StudentList,
    meta: { requiresAuth: true }
  },
  {
    path: '/add-student',
    name: 'AddStudent',
    component: AddStudent,
    meta: { requiresAuth: true, roles: ['admin', 'teacher'] }
  },
  {
    path: '/student/:id',
    name: 'StudentDetails',
    component: StudentDetails,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/manage-stages',
    name: 'ManageStages',
    component: ManageStages,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/manage-courses',
    name: 'ManageCourses',
    component: ManageCourses,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/assign-courses',
    name: 'AssignCourses',
    component: AssignCourses,
    meta: { requiresAuth: true, roles: ['admin', 'teacher'] }
  },
  {
    path: '/attendance',
    name: 'AttendanceTracking',
    component: AttendanceTracking,
    meta: { requiresAuth: true, roles: ['admin', 'teacher'] }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication and authorization
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false // default to true
  const requiredRoles = to.meta.roles

  // Check if route requires authentication
  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Not authenticated, redirect to login
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // Check token expiry
    if (!authStore.checkTokenExpiry()) {
      return // checkTokenExpiry will handle logout and redirect
    }

    // Check if route requires specific roles
    if (requiredRoles && requiredRoles.length > 0) {
      if (!authStore.hasRole(requiredRoles)) {
        // User doesn't have required role
        next({
          path: '/',
          query: { unauthorized: '1' }
        })
        return
      }
    }
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    // Already logged in, redirect to dashboard
    next('/')
    return
  }

  next()
})

export default router
