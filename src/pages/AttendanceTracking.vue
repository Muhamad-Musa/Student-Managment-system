<template>
  <div class="attendance-page">
    <h1>📅 Attendance Tracking</h1>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      <p>📡 Loading data...</p>
    </div>

    <!-- Select course -->
    <div v-if="!isLoading" class="form-group">
      <BaseSelect 
        v-model="selectedCourseId" 
        id="course" 
        @change="handleCourseChange"
        label="Select Course"
      >
        <option value="">-- Choose a course --</option>
        <option
          v-for="course in store.courses"
          :key="course.id"
          :value="course.id"
        >
          {{ course.name }}
        </option>
      </BaseSelect>
    </div>

    <!-- Show students enrolled in course -->
    <div v-if="selectedCourseId && studentsInCourse.length > 0" class="course-students">
      <h2>👥 Students Enrolled: {{ studentsInCourse.length }}</h2>
      
      <!-- Select date -->
      <div class="form-group">
        <BaseInput type="date" v-model="selectedDate" id="date" label="Select Date" />
      </div>

      <!-- Attendance Table -->
      <div v-if="selectedDate" class="attendance-table-container">
        <table class="attendance-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Stage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in attendanceData" :key="item.studentId">
              <td>{{ item.studentName }}</td>
              <td>
                <BaseBadge variant="info" size="small">{{ item.stageName }}</BaseBadge>
              </td>
              <td>
                <div class="status-buttons">
                  <BaseButton
                    @click="setStatus(item.studentId, 'Present')"
                    :variant="item.status === 'Present' ? 'success' : 'secondary'"
                    size="small"
                  >
                    ✓ Present
                  </BaseButton>
                  <BaseButton
                    @click="setStatus(item.studentId, 'Absent')"
                    :variant="item.status === 'Absent' ? 'danger' : 'secondary'"
                    size="small"
                  >
                    ✗ Absent
                  </BaseButton>
                  <BaseButton
                    @click="setStatus(item.studentId, 'Late')"
                    :variant="item.status === 'Late' ? 'warning' : 'secondary'"
                    size="small"
                  >
                    ⏰ Late
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <BaseButton @click="markAllPresent" variant="primary">
            Mark All Present
          </BaseButton>
          <BaseButton @click="saveAttendance" variant="success" :disabled="!hasAnyStatus">
            💾 Save Attendance
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- No students message -->
    <div v-else-if="selectedCourseId && studentsInCourse.length === 0" class="no-students">
      <p>⚠️ No students enrolled in this course yet.</p>
      <p>Please assign students to this course first.</p>
    </div>

    <!-- Attendance History -->
    <div v-if="attendanceHistory.length > 0" class="history">
      <h2>📋 Recent Attendance Records</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Course</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Late</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in attendanceHistory" :key="index">
            <td>{{ record.date }}</td>
            <td>{{ record.courseName }}</td>
            <td class="present-count">{{ record.presentCount }}</td>
            <td class="absent-count">{{ record.absentCount }}</td>
            <td class="late-count">{{ record.lateCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStudentStore } from '../stores/studentStore'
import { useNotification } from '../composables/useNotification'
import { BaseInput, BaseButton, BaseSelect, BaseBadge } from '../components/base'

const store = useStudentStore()
const { success, error: notifyError, info } = useNotification()

const isLoading = ref(false)
const selectedCourseId = ref('')
const selectedDate = ref('')
const attendanceData = ref([])
const attendanceHistory = ref([])

// Get students enrolled in selected course (populated by handleCourseChange)
const studentsInCourse = computed(() => {
  return attendanceData.value
})

// Check if any student has a status selected
const hasAnyStatus = computed(() => {
  return attendanceData.value.some(item => item.status !== null)
})

// Get stage name from stage_id
const getStudentStage = (stageId) => {
  const stage = store.stages.find(s => s.id === stageId)
  return stage ? stage.name : 'Unknown'
}

// Get course name from course_id
const getCourseName = (courseId) => {
  const course = store.courses.find(c => c.id === courseId)
  return course ? course.name : 'Unknown'
}

// Handle course selection
const handleCourseChange = async () => {
  attendanceData.value = []
  selectedDate.value = ''
  
  if (!selectedCourseId.value) return
  
  console.log(`📅 Attendance: Selected course ${selectedCourseId.value}`);
  
  // Fetch enrollments for all students to populate the list
  isLoading.value = true
  try {
    const enrolled = []
    
    console.log(`👥 Checking ${store.students.length} students for enrollment...`);
    
    // Fetch enrollments for each student and check if they have this course
    for (const student of store.students) {
      console.log(`🔍 Checking student: ${student.name} (${student.id})`);
      await store.fetchStudentEnrollments(student.id)
      
      // Get their enrollments - use the getter method instead of direct access
      const studentCourses = store.getStudentCourses(student.id) || [];
      console.log(`📚 Student ${student.name} courses:`, studentCourses);
      
      // Check if they're enrolled in the selected course by checking course IDs
      const hasThisCourse = studentCourses.find(
        course => String(course.id) === String(selectedCourseId.value)
      )
      
      console.log(`${hasThisCourse ? '✅' : '❌'} Student ${student.name} enrolled in this course:`, hasThisCourse);
      
      if (hasThisCourse) {
        enrolled.push({
          studentId: student.id,
          studentName: student.name,
          stageName: getStudentStage(student.stage_id),
          enrollmentId: hasThisCourse.id,
          status: null // null, 'Present', 'Absent', 'Late'
        })
      }
    }
    
    // Set attendance data with the enrolled students
    attendanceData.value = enrolled
    console.log(`✅ Found ${enrolled.length} students enrolled in this course`);
    
    if (enrolled.length === 0) {
      info('No students enrolled in this course')
    }
  } catch (err) {
    console.error('❌ Failed to load enrollments:', err);
    notifyError('Failed to load enrollments: ' + err.message)
  } finally {
    isLoading.value = false
  }
}

// Set attendance status for a student
const setStatus = (studentId, status) => {
  const item = attendanceData.value.find(a => a.studentId === studentId)
  if (item) {
    item.status = status
  }
}

// Mark all students as present
const markAllPresent = () => {
  attendanceData.value.forEach(item => {
    item.status = 'Present'
  })
  success('All students marked as present')
}

// Save attendance to database
const saveAttendance = async () => {
  if (!selectedDate.value) {
    notifyError('Please select a date')
    return
  }

  // Filter only students with a status selected
  const recordsToSave = attendanceData.value.filter(item => item.status !== null)

  if (recordsToSave.length === 0) {
    notifyError('Please mark attendance for at least one student')
    return
  }

  try {
    isLoading.value = true

    // Prepare bulk attendance records
    const bulkRecords = recordsToSave.map(item => ({
      studentId: item.studentId,
      enrollmentId: item.enrollmentId,
      date: selectedDate.value,
      status: item.status,
      notes: ''
    }))

    // Save using bulk method
    await store.recordBulkAttendance(bulkRecords)

    // Add to history
    const presentCount = recordsToSave.filter(r => r.status === 'Present').length
    const absentCount = recordsToSave.filter(r => r.status === 'Absent').length
    const lateCount = recordsToSave.filter(r => r.status === 'Late').length

    attendanceHistory.value.unshift({
      date: selectedDate.value,
      courseName: getCourseName(selectedCourseId.value),
      presentCount,
      absentCount,
      lateCount
    })

    success(`Attendance saved for ${recordsToSave.length} students`)

    // Reset for next entry
    attendanceData.value.forEach(item => {
      item.status = null
    })
    selectedDate.value = ''

  } catch (err) {
    notifyError('Failed to save attendance: ' + err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    await store.fetchAllStudents()
    await store.fetchAllCourses()
    await store.fetchAllStages()
  } catch (err) {
    notifyError('Failed to load data: ' + err.message)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.attendance-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

h2 {
  margin: 25px 0 15px;
  color: #34495e;
  font-size: 1.3em;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
  color: #7f8c8d;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.form-group select,
.form-group input {
  width: 100%;
  max-width: 400px;
  padding: 10px;
  font-size: 1em;
  border: 2px solid #ddd;
  border-radius: 5px;
  transition: border-color 0.3s;
}

.form-group select:focus,
.form-group input:focus {
  outline: none;
  border-color: #3498db;
}

.course-students {
  margin-top: 30px;
}

.no-students {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 5px;
  padding: 20px;
  margin-top: 20px;
  text-align: center;
}

.no-students p {
  margin: 5px 0;
  color: #856404;
}

.attendance-table-container {
  margin-top: 20px;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.attendance-table thead {
  background: #3498db;
  color: white;
}

.attendance-table th,
.attendance-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.attendance-table tbody tr:hover {
  background: #f8f9fa;
}

.status-buttons {
  display: flex;
  gap: 8px;
}

.status-btn {
  padding: 6px 12px;
  border: 2px solid transparent;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.2s;
  background: #f8f9fa;
  color: #495057;
}

.status-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-btn.present {
  border-color: #e0e0e0;
}

.status-btn.present.active {
  background: #27ae60;
  color: white;
  border-color: #27ae60;
}

.status-btn.absent {
  border-color: #e0e0e0;
}

.status-btn.absent.active {
  background: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.status-btn.late {
  border-color: #e0e0e0;
}

.status-btn.late.active {
  background: #f39c12;
  color: white;
  border-color: #f39c12;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: all 0.3s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.mark-all {
  background: #3498db;
  color: white;
}

.mark-all:hover {
  background: #2980b9;
}

.save-btn {
  background: #27ae60;
  color: white;
}

.save-btn:hover {
  background: #229954;
}

.save-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
}

.save-btn:disabled:hover {
  box-shadow: none;
}

.history {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #ecf0f1;
}

.history table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.history thead {
  background: #34495e;
  color: white;
}

.history th,
.history td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.history tbody tr:hover {
  background: #f8f9fa;
}

.present-count {
  color: #27ae60;
  font-weight: 600;
}

.absent-count {
  color: #e74c3c;
  font-weight: 600;
}

.late-count {
  color: #f39c12;
  font-weight: 600;
}

/* Dark Theme */
[data-theme="dark"] .attendance-page {
  color: #e0e0e0;
}

[data-theme="dark"] h1,
[data-theme="dark"] h2 {
  color: #f0f0f0;
}

[data-theme="dark"] .loading {
  color: #999;
}

[data-theme="dark"] .form-group label {
  color: #f0f0f0;
}

[data-theme="dark"] .form-group select,
[data-theme="dark"] .form-group input {
  background: #1e1e1e;
  border-color: #444;
  color: #e0e0e0;
}

[data-theme="dark"] .form-group select:focus,
[data-theme="dark"] .form-group input:focus {
  border-color: #3498db;
}

[data-theme="dark"] .no-students {
  background: #3d3416;
  border-color: #5a4a1f;
  color: #e0e0e0;
}

[data-theme="dark"] .no-students p {
  color: #f0ad4e;
}

[data-theme="dark"] .attendance-table {
  background: #1e1e1e;
  color: #e0e0e0;
}

[data-theme="dark"] .attendance-table thead {
  background: #2a4a6e;
}

[data-theme="dark"] .attendance-table th,
[data-theme="dark"] .attendance-table td {
  border-bottom-color: #444;
}

[data-theme="dark"] .attendance-table tbody tr:hover {
  background: #2a2a2a;
}

[data-theme="dark"] .status-btn {
  background: #2a2a2a;
  color: #e0e0e0;
  border-color: #444;
}

[data-theme="dark"] .status-btn:hover {
  background: #333;
}

[data-theme="dark"] .status-btn.present.active {
  background: #27ae60;
  color: white;
  border-color: #27ae60;
}

[data-theme="dark"] .status-btn.absent.active {
  background: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

[data-theme="dark"] .status-btn.late.active {
  background: #f39c12;
  color: white;
  border-color: #f39c12;
}

[data-theme="dark"] .btn {
  color: white;
}

[data-theme="dark"] .save-btn:disabled {
  background: #555;
}

[data-theme="dark"] .history table {
  background: #1e1e1e;
  color: #e0e0e0;
}

[data-theme="dark"] .history thead {
  background: #2a2a2a;
}

[data-theme="dark"] .history th,
[data-theme="dark"] .history td {
  border-bottom-color: #444;
}

[data-theme="dark"] .history tbody tr:hover {
  background: #2a2a2a;
}
</style>
