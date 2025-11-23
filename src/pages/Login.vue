<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>🎓 Student Management System</h1>
        <p>Sign in to continue</p>
      </div>

      <!-- Session expired message -->
      <div v-if="$route.query.expired" class="alert alert-warning">
        ⚠️ Your session has expired. Please login again.
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <BaseInput
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="admin@school.com"
          :error="errors.email"
          :disabled="isLoading"
          @blur="validateField('email')"
          required
        />

        <BaseInput
          v-model="form.password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          :error="errors.password"
          :disabled="isLoading"
          @blur="validateField('password')"
          required
        />

        <BaseButton
          type="submit"
          variant="primary"
          :loading="isLoading"
          :disabled="isLoading"
          block
        >
          <span v-if="!isLoading">🔐 Sign In</span>
        </BaseButton>

        <div v-if="authStore.error" class="alert alert-error">
          ❌ {{ authStore.error }}
        </div>
      </form>

      <div class="demo-credentials">
        <p><strong>Demo Accounts:</strong></p>
        <div class="credentials-list">
          <div class="credential-item">
            <BaseBadge variant="danger">Admin</BaseBadge>
            <code>admin@school.com / admin123</code>
          </div>
          <div class="credential-item">
            <BaseBadge variant="success">Teacher</BaseBadge>
            <code>teacher@school.com / teacher123</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useNotification } from '../composables/useNotification'
import { BaseInput, BaseButton, BaseBadge } from '../components/base'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { success: notifySuccess, error: notifyError } = useNotification()

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const isLoading = computed(() => authStore.loading)

const validateField = (field) => {
  switch(field) {
    case 'email':
      if (!form.email.trim()) {
        errors.email = 'Email is required'
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(form.email)) {
          errors.email = 'Please enter a valid email'
        } else {
          errors.email = ''
        }
      }
      break
      
    case 'password':
      if (!form.password) {
        errors.password = 'Password is required'
      } else if (form.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
      } else {
        errors.password = ''
      }
      break
  }
}

const validateAll = () => {
  validateField('email')
  validateField('password')
  return !errors.email && !errors.password
}

const handleLogin = async () => {
  if (!validateAll()) {
    notifyError('Please fix the validation errors')
    return
  }

  try {
    const user = await authStore.login(form.email, form.password)
    
    notifySuccess(`Welcome back, ${user.name}!`)
    
    // Redirect to intended page or dashboard
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    notifyError(err.message || 'Login failed')
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.login-header p {
  color: #666;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

input {
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.input-error {
  border-color: #ff4d4f !important;
}

.error {
  color: #ff4d4f;
  font-size: 0.85rem;
  margin-top: 0.3rem;
}

.btn-login {
  padding: 0.9rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.alert {
  padding: 0.8rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.alert-error {
  background: #fdeaea;
  border: 1px solid #ff4d4f;
  color: #c0392b;
}

.alert-warning {
  background: #fff7e6;
  border: 1px solid #ffa940;
  color: #d46b08;
}

.demo-credentials {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.demo-credentials p {
  text-align: center;
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.credentials-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.credential-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.badge {
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.admin {
  background: #ff4d4f;
  color: white;
}

.badge.teacher {
  background: #52c41a;
  color: white;
}

code {
  flex: 1;
  font-size: 0.85rem;
  color: #2c3e50;
  background: white;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

/* Dark theme support */
[data-theme="dark"] .login-card {
  background: #1e1e1e;
  color: #e0e0e0;
}

[data-theme="dark"] .login-header h1,
[data-theme="dark"] label {
  color: #f0f0f0;
}

[data-theme="dark"] input {
  background: #2a2a2a;
  border-color: #444;
  color: #e0e0e0;
}

[data-theme="dark"] .demo-credentials {
  border-top-color: #444;
}

[data-theme="dark"] .credential-item {
  background: #2a2a2a;
}

[data-theme="dark"] code {
  background: #1a1a1a;
  border-color: #444;
  color: #e0e0e0;
}
</style>
