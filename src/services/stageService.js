import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../config/firebase'

const STAGES_COLLECTION = 'stages'

export const stageService = {
  // Get all stages
  async getAllStages() {
    try {
      const q = query(
        collection(db, STAGES_COLLECTION),
        orderBy('level')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error('Error fetching stages:', error)
      throw error
    }
  },

  // Get single stage
  async getStageById(id) {
    try {
      const docRef = doc(db, STAGES_COLLECTION, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching stage:', error)
      throw error
    }
  },

  // Add new stage
  async addStage(stageData) {
    try {
      const docRef = await addDoc(collection(db, STAGES_COLLECTION), {
        name: stageData.name,
        level: stageData.level || 1,
        academicYear: stageData.academicYear || new Date().getFullYear().toString(),
        createdAt: new Date().toISOString(),
      })
      return {
        id: docRef.id,
        ...stageData,
      }
    } catch (error) {
      console.error('Error adding stage:', error)
      throw error
    }
  },

  // Update stage
  async updateStage(id, updates) {
    try {
      const docRef = doc(db, STAGES_COLLECTION, id)
      await updateDoc(docRef, updates)
      return {
        id,
        ...updates,
      }
    } catch (error) {
      console.error('Error updating stage:', error)
      throw error
    }
  },

  // Delete stage
  async deleteStage(id) {
    try {
      const docRef = doc(db, STAGES_COLLECTION, id)
      await deleteDoc(docRef)
      return id
    } catch (error) {
      console.error('Error deleting stage:', error)
      throw error
    }
  },
}
