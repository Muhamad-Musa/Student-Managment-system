import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCLXDlYKlOvjZCnfwWmTq5F9RHhH5D3Fao",
  authDomain: "student-management-syste-d3477.firebaseapp.com",
  projectId: "student-management-syste-d3477",
  storageBucket: "student-management-syste-d3477.firebasestorage.app",
  messagingSenderId: "673883116688",
  appId: "1:673883116688:web:83f20bb6a9b27ceca8dcb1"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Auth
export const auth = getAuth(app)

export default app
