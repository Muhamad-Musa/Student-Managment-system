import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '../config/firebase'

const ATTENDANCE_COLLECTION = 'attendance'

export const attendanceService = {
  // Record attendance for a student in a course
  async recordAttendance(attendanceData) {
    try {
      const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), {
        studentId: attendanceData.studentId,
        courseId: attendanceData.courseId,
        date: attendanceData.date || new Date().toISOString(),
        status: attendanceData.status, // "present" | "absent" | "late" | "excused"
        notes: attendanceData.notes || '',
        markedBy: attendanceData.markedBy || 'system',
        createdAt: new Date().toISOString(),
      })
      return {
        id: docRef.id,
        ...attendanceData,
      }
    } catch (error) {
      console.error('Error recording attendance:', error)
      throw error
    }
  },

  // Record bulk attendance for multiple students
  async recordBulkAttendance(attendanceRecords) {
    try {
      const results = []
      for (const record of attendanceRecords) {
        const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), {
          studentId: record.studentId,
          courseId: record.courseId,
          date: record.date || new Date().toISOString(),
          status: record.status,
          notes: record.notes || '',
          markedBy: record.markedBy || 'system',
          createdAt: new Date().toISOString(),
        })
        results.push({
          id: docRef.id,
          ...record,
        })
      }
      return results
    } catch (error) {
      console.error('Error recording bulk attendance:', error)
      throw error
    }
  },

  // Get all attendance records for a student
  async getStudentAttendance(studentId, courseId = null) {
    try {
      let q
      if (courseId) {
        q = query(
          collection(db, ATTENDANCE_COLLECTION),
          where('studentId', '==', studentId),
          where('courseId', '==', courseId),
          orderBy('date', 'desc')
        )
      } else {
        q = query(
          collection(db, ATTENDANCE_COLLECTION),
          where('studentId', '==', studentId),
          orderBy('date', 'desc')
        )
      }
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error('Error fetching student attendance:', error)
      throw error
    }
  },

  // Get all attendance records for a course
  async getCourseAttendance(courseId, date = null) {
    try {
      let q
      if (date) {
        q = query(
          collection(db, ATTENDANCE_COLLECTION),
          where('courseId', '==', courseId),
          where('date', '>=', date),
          where('date', '<', new Date(new Date(date).getTime() + 86400000).toISOString()),
          orderBy('date', 'desc')
        )
      } else {
        q = query(
          collection(db, ATTENDANCE_COLLECTION),
          where('courseId', '==', courseId),
          orderBy('date', 'desc')
        )
      }
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error('Error fetching course attendance:', error)
      throw error
    }
  },

  // Update attendance record
  async updateAttendance(attendanceId, updates) {
    try {
      const docRef = doc(db, ATTENDANCE_COLLECTION, attendanceId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      return {
        id: attendanceId,
        ...updates,
      }
    } catch (error) {
      console.error('Error updating attendance:', error)
      throw error
    }
  },

  // Delete attendance record
  async deleteAttendance(attendanceId) {
    try {
      const docRef = doc(db, ATTENDANCE_COLLECTION, attendanceId)
      await deleteDoc(docRef)
      return attendanceId
    } catch (error) {
      console.error('Error deleting attendance:', error)
      throw error
    }
  },

  // Calculate attendance statistics for a student in a course
  async getAttendanceStats(studentId, courseId) {
    try {
      const records = await this.getStudentAttendance(studentId, courseId)
      const stats = {
        total: records.length,
        present: records.filter(r => r.status === 'present').length,
        absent: records.filter(r => r.status === 'absent').length,
        late: records.filter(r => r.status === 'late').length,
        excused: records.filter(r => r.status === 'excused').length,
        percentage: 0,
      }
      if (stats.total > 0) {
        stats.percentage = ((stats.present / stats.total) * 100).toFixed(2)
      }
      return stats
    } catch (error) {
      console.error('Error calculating attendance stats:', error)
      throw error
    }
  },

  // Get attendance for a specific date
  async getAttendanceByDate(date) {
    try {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)

      const q = query(
        collection(db, ATTENDANCE_COLLECTION),
        where('date', '>=', startDate.toISOString()),
        where('date', '<=', endDate.toISOString()),
        orderBy('date', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error('Error fetching attendance by date:', error)
      throw error
    }
  },
}
