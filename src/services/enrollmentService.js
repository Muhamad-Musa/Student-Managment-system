import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../config/firebase'

const STUDENTS_COLLECTION = 'students'
const ENROLLMENTS_SUBCOLLECTION = 'enrollments'

export const enrollmentService = {
  // Get all enrollments for a student
  async getStudentEnrollments(studentId) {
    try {
      console.log(`📡 EnrollmentService: Fetching enrollments for student ${studentId}`);
      const q = query(
        collection(db, STUDENTS_COLLECTION, studentId, ENROLLMENTS_SUBCOLLECTION),
        orderBy('enrolled_date', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const enrollments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      console.log(`✅ EnrollmentService: Found ${enrollments.length} enrollments:`, enrollments);
      return enrollments;
    } catch (error) {
      console.error('❌ EnrollmentService: Error fetching enrollments:', error)
      throw error
    }
  },

  // Get single enrollment
  async getEnrollment(studentId, enrollmentId) {
    try {
      const docRef = doc(
        db,
        STUDENTS_COLLECTION,
        studentId,
        ENROLLMENTS_SUBCOLLECTION,
        enrollmentId
      )
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching enrollment:', error)
      throw error
    }
  },

  // Enroll student in a course
  async enrollStudentInCourse(studentId, courseId, courseName) {
    try {
      const docRef = await addDoc(
        collection(db, STUDENTS_COLLECTION, studentId, ENROLLMENTS_SUBCOLLECTION),
        {
          course_id: courseId,
          course_name: courseName,
          enrolled_date: new Date().toISOString(),
        }
      )
      return {
        id: docRef.id,
        course_id: courseId,
        course_name: courseName,
        enrolled_date: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Error enrolling student:', error)
      throw error
    }
  },

  // Remove enrollment
  async removeEnrollment(studentId, enrollmentId) {
    try {
      const docRef = doc(
        db,
        STUDENTS_COLLECTION,
        studentId,
        ENROLLMENTS_SUBCOLLECTION,
        enrollmentId
      )
      await deleteDoc(docRef)
      return enrollmentId
    } catch (error) {
      console.error('Error removing enrollment:', error)
      throw error
    }
  },
}
