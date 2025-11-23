<template>
  <div class="page">
    <h1>Add Student</h1>

    <form @submit.prevent="onSubmit" @reset.prevent="onReset" class="form">
      <BaseInput
        v-model="form.name"
        label="Name"
        type="text"
        :error="errors.name"
        @blur="validateField('name')"
        required
      />

      <BaseInput
        v-model.number="form.age"
        label="Age"
        type="number"
        :error="errors.age"
        @blur="validateField('age')"
        required
      />

      <BaseSelect
        v-model="form.stage_id"
        label="Stage"
        :error="errors.stage_id"
        @blur="validateField('stage_id')"
        required
      >
        <option value="">-- Select stage --</option>
        <option v-for="s in store.stages" :key="s.id" :value="s.id">{{ s.name }}</option>
      </BaseSelect>

      <BaseInput
        v-model="form.email"
        label="Email"
        type="email"
        :error="errors.email"
        @blur="validateField('email')"
        required
      />

      <BaseInput
        v-model="form.phone"
        label="Phone"
        type="tel"
        placeholder="+1234567890"
        :error="errors.phone"
        @blur="validateField('phone')"
        hint="Optional: Format +1234567890"
      />

      <label>
        Address
        <textarea 
          v-model="form.address" 
          rows="3"
          placeholder="Enter student address"
        ></textarea>
      </label>

      <div class="form-actions">
        <BaseButton variant="primary" type="submit" :disabled="isSubmitting" :loading="isSubmitting">
          <span v-if="!isSubmitting">✅ Submit</span>
        </BaseButton>
        <BaseButton variant="secondary" type="reset" :disabled="isSubmitting">🔄 Reset</BaseButton>
        <router-link class="btn" to="/students">← Back</router-link>
      </div>
    </form>

    <div v-if="saved" class="notice success">
      ✅ Student created successfully: <strong>{{ createdName }}</strong> — 
      <router-link :to="`/student/${createdId}`">View Details</router-link>
    </div>
    <div v-if="errorMessage" class="notice error">❌ {{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useStudentStore } from '../stores/studentStore'
import { useNotification } from '../composables/useNotification'
import { BaseInput, BaseSelect, BaseButton } from '../components/base'

const store = useStudentStore()
const { success: notifySuccess, error: notifyError } = useNotification()

const form = reactive({
  name: '',
  age: null,
  stage_id: '',
  email: '',
  phone: '',
  address: '',
})

const errors = reactive({ 
  name: '', 
  age: '',
  stage_id: '',
  email: '', 
  phone: '' 
})

const saved = ref(false)
const errorMessage = ref('')
const createdId = ref(null)
const createdName = ref('')
const isSubmitting = ref(false)

// Validation rules
const validateField = (field) => {
  switch(field) {
    case 'name':
      if (!form.name.trim()) {
        errors.name = 'Name is required'
      } else if (form.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters'
      } else {
        errors.name = ''
      }
      break
      
    case 'age':
      if (!form.age) {
        errors.age = 'Age is required'
      } else if (form.age < 1 || form.age > 100) {
        errors.age = 'Age must be between 1 and 100'
      } else {
        errors.age = ''
      }
      break
      
    case 'stage_id':
      if (!form.stage_id) {
        errors.stage_id = 'Please select a stage'
      } else {
        errors.stage_id = ''
      }
      break
      
    case 'email':
      if (!form.email.trim()) {
        errors.email = 'Email is required'
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(form.email)) {
          errors.email = 'Please enter a valid email address'
        } else {
          errors.email = ''
        }
      }
      break
      
    case 'phone':
      if (form.phone && form.phone.trim()) {
        // Optional phone validation - allow various formats
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
        if (!phoneRegex.test(form.phone.replace(/\s/g, ''))) {
          errors.phone = 'Please enter a valid phone number'
        } else {
          errors.phone = ''
        }
      } else {
        errors.phone = ''
      }
      break
  }
}

function validateAll() {
  validateField('name')
  validateField('age')
  validateField('stage_id')
  validateField('email')
  validateField('phone')
  
  return !errors.name && !errors.age && !errors.stage_id && !errors.email && !errors.phone
}

async function onSubmit() {
  errorMessage.value = ''
  saved.value = false
  
  if (!validateAll()) {
    notifyError('Please fix the validation errors')
    return
  }
  
  isSubmitting.value = true
  
  try {
    const studentData = {
      name: form.name.trim(),
      age: Number(form.age),
      stage_id: String(form.stage_id),
      email: form.email.trim(),
    }
    
    // Add optional fields if provided
    if (form.phone && form.phone.trim()) {
      studentData.phone = form.phone.trim()
    }
    if (form.address && form.address.trim()) {
      studentData.address = form.address.trim()
    }
    
    const student = await store.addStudent(studentData)
    
    saved.value = true
    createdId.value = student.id
    createdName.value = student.name
    
    notifySuccess(`Student "${student.name}" created successfully!`)
    
    // Reset form
    onReset()
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      saved.value = false
    }, 5000)
  } catch (err) {
    errorMessage.value = err?.message || 'Failed to create student'
    notifyError(errorMessage.value)
  } finally {
    isSubmitting.value = false
  }
}

function onReset() {
  form.name = ''
  form.age = null
  form.stage_id = ''
  form.email = ''
  form.phone = ''
  form.address = ''
  
  errors.name = ''
  errors.age = ''
  errors.stage_id = ''
  errors.email = ''
  errors.phone = ''
  
  errorMessage.value = ''
}

onMounted(async () => {
  // Load stages if not already loaded
  if (!store.stages.length) {
    await store.fetchAllStages()
  }
})
</script>

<style scoped>
.page { 
  max-width: 700px; 
  margin: 1.2rem auto; 
  padding: 0 1rem; 
}

h1 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.form { 
  display: flex; 
  flex-direction: column; 
  gap: 1rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

label { 
  display: flex; 
  flex-direction: column; 
  font-size: 0.95rem; 
  font-weight: 600;
  color: #2c3e50;
}

input[type="text"], 
input[type="email"], 
input[type="number"], 
input[type="tel"],
select,
textarea { 
  padding: 0.6rem; 
  border: 2px solid #e0e0e0; 
  border-radius: 6px; 
  margin-top: 0.3rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #2f80ed;
}

.input-error {
  border-color: #ff4d4f !important;
}

textarea {
  resize: vertical;
  font-family: inherit;
}

.error { 
  color: #ff4d4f; 
  font-size: 0.85rem; 
  margin-top: 0.3rem;
  font-weight: normal;
}

.help-text {
  color: #666;
  font-size: 0.85rem;
  margin-top: 0.3rem;
  font-weight: normal;
  font-style: italic;
}

.form-actions { 
  display: flex; 
  gap: 0.8rem; 
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn { 
  padding: 0.6rem 1.2rem; 
  border: 2px solid #ddd; 
  background: white; 
  border-radius: 6px; 
  cursor: pointer; 
  text-decoration: none; 
  color: #2c3e50;
  font-weight: 600;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.btn:hover:not(:disabled) { 
  background: #f5f5f5;
  transform: translateY(-1px);
}

.btn.primary { 
  background: #2f80ed; 
  color: white; 
  border-color: #2f80ed; 
}

.btn.primary:hover:not(:disabled) { 
  background: #2563be;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.notice { 
  margin-top: 1.5rem; 
  padding: 1rem; 
  border-radius: 8px;
  font-weight: 500;
}

.notice.success { 
  background: #ecf9f1; 
  border: 2px solid #52c41a; 
  color: #237804; 
}

.notice.error { 
  background: #fdeaea; 
  border: 2px solid #ff4d4f; 
  color: #c0392b; 
}

.notice a {
  color: #2f80ed;
  text-decoration: underline;
  font-weight: 600;
}
</style>
