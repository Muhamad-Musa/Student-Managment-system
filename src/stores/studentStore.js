import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { studentService } from "../services/studentService";
import { stageService } from "../services/stageService";
import { courseService } from "../services/courseService";
import { enrollmentService } from "../services/enrollmentService";
import { marksService } from "../services/marksService";
import { attendanceService } from "../services/attendanceService";

export const useStudentStore = defineStore("student", () => {
  // State
  const students = ref([]);
  const stages = ref([]);
  const courses = ref([]);
  const studentEnrollments = ref({}); // { studentId: [enrollments...] }
  const enrollmentMarks = ref({}); // { studentId_enrollmentId: [marks...] }
  const enrollmentAttendance = ref({}); // { studentId_enrollmentId: [attendance...] }
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const getStudentById = (id) => {
    return students.value.find((s) => String(s.id) === String(id));
  };

  const getStageById = (id) => {
    return stages.value.find((s) => String(s.id) === String(id));
  };

  const getCourseById = (id) => {
    console.log(`🔍 Looking for course with id: ${id}, type: ${typeof id}`);
    console.log(`📚 Available courses in store:`, courses.value.map(c => ({ id: c.id, name: c.name })));
    const course = courses.value.find((c) => String(c.id) === String(id));
    console.log(`${course ? '✅' : '❌'} Course found:`, course);
    return course;
  };

  // Actions - Students
  const fetchAllStudents = async () => {
    loading.value = true;
    error.value = null;
    try {
      console.log('🏪 Store: Fetching all students...');
      students.value = await studentService.getAllStudents();
      console.log(`🏪 Store: Loaded ${students.value.length} students into state`);
    } catch (err) {
      console.error('❌ Store: Error fetching students:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addStudent = async (student) => {
    // Optimistic update: add student immediately with temporary ID
    const tempId = `temp_${Date.now()}`;
    const optimisticStudent = { ...student, id: tempId };
    students.value.push(optimisticStudent);
    
    loading.value = true;
    error.value = null;
    try {
      const newStudent = await studentService.addStudent(student);
      // Replace temp student with real one
      const index = students.value.findIndex((s) => s.id === tempId);
      if (index > -1) {
        students.value[index] = newStudent;
      }
      return newStudent;
    } catch (err) {
      // Rollback: remove optimistic student
      students.value = students.value.filter((s) => s.id !== tempId);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateStudent = async (id, updates) => {
    // Optimistic update: apply changes immediately
    const index = students.value.findIndex((s) => String(s.id) === String(id));
    let originalStudent = null;
    
    if (index > -1) {
      originalStudent = { ...students.value[index] };
      students.value[index] = { ...students.value[index], ...updates };
    }
    
    loading.value = true;
    error.value = null;
    try {
      const updated = await studentService.updateStudent(id, updates);
      return updated;
    } catch (err) {
      // Rollback: restore original student
      if (index > -1 && originalStudent) {
        students.value[index] = originalStudent;
      }
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteStudent = async (id) => {
    // Optimistic update: remove student immediately
    const index = students.value.findIndex((s) => String(s.id) === String(id));
    let removedStudent = null;
    
    if (index > -1) {
      removedStudent = students.value[index];
      students.value = students.value.filter((s) => String(s.id) !== String(id));
    }
    
    loading.value = true;
    error.value = null;
    try {
      await studentService.deleteStudent(id);
    } catch (err) {
      // Rollback: restore deleted student
      if (removedStudent) {
        students.value.splice(index, 0, removedStudent);
      }
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getStudentsByStage = (stageId) => {
    try {
      // Filter from already loaded students instead of querying Firebase
      // This avoids the need for a composite index
      console.log(`🔍 Filtering students for stage_id: ${stageId}, type: ${typeof stageId}`);
      console.log(`📊 Total students in store: ${students.value.length}`);
      
      if (students.value.length > 0) {
        console.log('📝 Sample student data:', students.value[0]);
      }
      
      const filtered = students.value.filter(s => {
        const match = s.stage_id === stageId || String(s.stage_id) === String(stageId);
        if (match) {
          console.log(`✓ Match found: ${s.name} (stage_id: ${s.stage_id})`);
        }
        return match;
      });
      console.log(`✅ Found ${filtered.length} students in stage ${stageId}:`, filtered);
      
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      console.error('❌ Error filtering students by stage:', err);
      error.value = err.message;
      return [];
    }
  };

  // Actions - Stages
  const fetchAllStages = async () => {
    loading.value = true;
    error.value = null;
    try {
      stages.value = await stageService.getAllStages();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addStage = async (stageName) => {
    loading.value = true;
    error.value = null;
    try {
      const newStage = await stageService.addStage(stageName);
      stages.value.push(newStage);
      return newStage;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Actions - Courses
  const fetchAllCourses = async () => {
    loading.value = true;
    error.value = null;
    try {
      console.log('🏪 Store: Fetching all courses...');
      courses.value = await courseService.getAllCourses();
      console.log(`🏪 Store: Loaded ${courses.value.length} courses:`, courses.value);
    } catch (err) {
      console.error('❌ Store: Error fetching courses:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getStudentCourses = (studentId) => {
    // Get enrollments for this student
    console.log(`🔍 Getting courses for student ${studentId}`);
    const enrollments = studentEnrollments.value[String(studentId)] || [];
    console.log(`📚 Found ${enrollments.length} enrollments:`, enrollments);
    
    // Map enrollments to course objects
    const coursesWithDetails = enrollments.map(enrollment => {
      const course = getCourseById(enrollment.course_id);
      console.log(`📖 Mapping enrollment ${enrollment.id} -> course ${enrollment.course_id}:`, course);
      return course || { 
        id: enrollment.course_id, 
        name: enrollment.course_name || 'Unknown Course',
        credits: 3 
      };
    }).filter(c => c !== null);
    
    console.log(`✅ Returning ${coursesWithDetails.length} courses:`, coursesWithDetails);
    return coursesWithDetails;
  };

  const assignCourses = async (studentId, courseIds) => {
    loading.value = true;
    error.value = null;
    try {
      const student = getStudentById(studentId);
      if (!student) throw new Error("Student not found");

      // Get current enrollments
      const currentEnrollments = studentEnrollments.value[String(studentId)] || [];
      const enrolledCourseIds = currentEnrollments.map((e) => e.course_id);

      // Enroll in new courses
      for (const courseId of courseIds) {
        if (!enrolledCourseIds.includes(String(courseId))) {
          const course = getCourseById(courseId);
          const enrollment = await enrollmentService.enrollStudentInCourse(
            String(studentId),
            String(courseId),
            course?.name || "Unknown Course"
          );
          if (!studentEnrollments.value[String(studentId)]) {
            studentEnrollments.value[String(studentId)] = [];
          }
          studentEnrollments.value[String(studentId)].push(enrollment);
        }
      }

      return student;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addCourse = async (courseName) => {
    loading.value = true;
    error.value = null;
    try {
      const newCourse = await courseService.addCourse(courseName);
      courses.value.push(newCourse);
      return newCourse;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCourse = async (courseId) => {
    loading.value = true;
    error.value = null;
    try {
      await courseService.deleteCourse(courseId);
      courses.value = courses.value.filter((c) => c.id !== courseId);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Actions - Enrollments
  const fetchStudentEnrollments = async (studentId) => {
    loading.value = true;
    error.value = null;
    try {
      console.log(`📡 Fetching enrollments for student ${studentId}...`);
      const enrollments = await enrollmentService.getStudentEnrollments(String(studentId));
      console.log(`✅ Fetched ${enrollments.length} enrollments:`, enrollments);
      studentEnrollments.value[String(studentId)] = enrollments;
      return enrollments;
    } catch (err) {
      console.error(`❌ Error fetching enrollments for student ${studentId}:`, err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const removeEnrollment = async (studentId, enrollmentId) => {
    loading.value = true;
    error.value = null;
    try {
      await enrollmentService.removeEnrollment(String(studentId), enrollmentId);
      if (studentEnrollments.value[String(studentId)]) {
        studentEnrollments.value[String(studentId)] = 
          studentEnrollments.value[String(studentId)].filter(e => e.id !== enrollmentId);
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Actions - Marks
  const fetchEnrollmentMarks = async (studentId, enrollmentId) => {
    loading.value = true;
    error.value = null;
    try {
      const key = `${studentId}_${enrollmentId}`;
      const marks = await marksService.getEnrollmentMarks(String(studentId), enrollmentId);
      enrollmentMarks.value[key] = marks;
      return marks;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const addMark = async (studentId, enrollmentId, markData) => {
    loading.value = true;
    error.value = null;
    try {
      const mark = await marksService.addMark(String(studentId), enrollmentId, markData);
      const key = `${studentId}_${enrollmentId}`;
      if (!enrollmentMarks.value[key]) {
        enrollmentMarks.value[key] = [];
      }
      enrollmentMarks.value[key].push(mark);
      return mark;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getAverageMarks = async (studentId, enrollmentId) => {
    try {
      return await marksService.getAverageMarks(String(studentId), enrollmentId);
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  // Actions - Attendance
  const fetchEnrollmentAttendance = async (studentId, enrollmentId) => {
    loading.value = true;
    error.value = null;
    try {
      const key = `${studentId}_${enrollmentId}`;
      const records = await attendanceService.getEnrollmentAttendance(String(studentId), enrollmentId);
      enrollmentAttendance.value[key] = records;
      return records;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const recordAttendance = async (studentId, enrollmentId, attendanceData) => {
    loading.value = true;
    error.value = null;
    try {
      const record = await attendanceService.recordAttendance(
        String(studentId),
        enrollmentId,
        attendanceData
      );
      const key = `${studentId}_${enrollmentId}`;
      if (!enrollmentAttendance.value[key]) {
        enrollmentAttendance.value[key] = [];
      }
      enrollmentAttendance.value[key].push(record);
      return record;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const recordBulkAttendance = async (attendanceRecords) => {
    loading.value = true;
    error.value = null;
    try {
      const results = await attendanceService.recordBulkAttendance(attendanceRecords);
      // Update local state for each record
      for (const result of results) {
        const key = `${result.studentId}_${result.enrollmentId}`;
        if (!enrollmentAttendance.value[key]) {
          enrollmentAttendance.value[key] = [];
        }
        enrollmentAttendance.value[key].push(result);
      }
      return results;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getAttendanceStats = async (studentId, enrollmentId) => {
    try {
      return await attendanceService.getAttendanceStats(String(studentId), enrollmentId);
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  // Computed getters
  const totalStudents = computed(() => students.value.length);
  const totalStages = computed(() => stages.value.length);

  return {
    // State
    students,
    stages,
    courses,
    studentEnrollments,
    enrollmentMarks,
    enrollmentAttendance,
    loading,
    error,

    // Computed getters
    totalStudents,
    totalStages,

    // Functions
    getStudentById,
    getStageById,
    getCourseById,

    // Student actions
    fetchAllStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentsByStage,

    // Stage actions
    fetchAllStages,
    addStage,

    // Course actions
    fetchAllCourses,
    getStudentCourses,
    assignCourses,
    addCourse,
    deleteCourse,

    // Enrollment actions
    fetchStudentEnrollments,
    removeEnrollment,

    // Marks actions
    fetchEnrollmentMarks,
    addMark,
    getAverageMarks,

    // Attendance actions
    fetchEnrollmentAttendance,
    recordAttendance,
    recordBulkAttendance,
    getAttendanceStats,
  };
});
