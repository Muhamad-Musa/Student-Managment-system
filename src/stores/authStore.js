import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Authentication store with JWT token management and role-based access
 * Roles: admin (full access), teacher (limited access)
 */
export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  
  // State
  const user = ref(null)
  const token = ref(null)
  const tokenExpiry = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  let logoutTimer = null

  // Load auth state from localStorage on init
  const loadAuthState = () => {
    try {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')
      const storedExpiry = localStorage.getItem('auth_expiry')

      if (storedToken && storedUser && storedExpiry) {
        const expiry = new Date(storedExpiry)
        
        // Check if token is still valid
        if (expiry > new Date()) {
          token.value = storedToken
          user.value = JSON.parse(storedUser)
          tokenExpiry.value = expiry
          
          // Set up auto-logout
          scheduleAutoLogout()
        } else {
          // Token expired, clear everything
          clearAuthState()
        }
      }
    } catch (err) {
      console.error('Error loading auth state:', err)
      clearAuthState()
    }
  }

  // Save auth state to localStorage
  const saveAuthState = () => {
    if (token.value && user.value && tokenExpiry.value) {
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('auth_user', JSON.stringify(user.value))
      localStorage.setItem('auth_expiry', tokenExpiry.value.toISOString())
    }
  }

  // Clear auth state
  const clearAuthState = () => {
    token.value = null
    user.value = null
    tokenExpiry.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_expiry')
    
    if (logoutTimer) {
      clearTimeout(logoutTimer)
      logoutTimer = null
    }
  }

  // Schedule auto-logout when token expires
  const scheduleAutoLogout = () => {
    if (logoutTimer) {
      clearTimeout(logoutTimer)
    }
    
    if (tokenExpiry.value) {
      const now = new Date()
      const expiryTime = new Date(tokenExpiry.value)
      const timeUntilExpiry = expiryTime - now
      
      if (timeUntilExpiry > 0) {
        logoutTimer = setTimeout(() => {
          logout(true) // auto-logout
        }, timeUntilExpiry)
      }
    }
  }

  // Computed properties
  const isAuthenticated = computed(() => {
    if (!token.value || !tokenExpiry.value) return false
    return new Date(tokenExpiry.value) > new Date()
  })

  const isAdmin = computed(() => {
    return user.value?.role === 'admin'
  })

  const isTeacher = computed(() => {
    return user.value?.role === 'teacher'
  })

  const userRole = computed(() => {
    return user.value?.role || null
  })

  const userName = computed(() => {
    return user.value?.name || user.value?.email || 'User'
  })

  // Actions
  const login = async (email, password) => {
    loading.value = true
    error.value = null
    
    try {
      // Mock authentication - replace with real API call
      const mockUser = await mockLogin(email, password)
      
      // Generate token with 2 hour expiry
      const mockToken = generateMockToken()
      const expiry = new Date()
      expiry.setHours(expiry.getHours() + 2)
      
      // Set state
      user.value = mockUser
      token.value = mockToken
      tokenExpiry.value = expiry
      
      // Persist to localStorage
      saveAuthState()
      
      // Schedule auto-logout
      scheduleAutoLogout()
      
      return mockUser
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = (isAutoLogout = false) => {
    clearAuthState()
    
    // Redirect to login
    if (router) {
      router.push({
        path: '/login',
        query: isAutoLogout ? { expired: '1' } : {}
      })
    }
  }

  const checkTokenExpiry = () => {
    if (!isAuthenticated.value) {
      logout(true)
      return false
    }
    return true
  }

  // Mock login function - replace with real API
  const mockLogin = async (email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock users database
    const mockUsers = [
      {
        id: '1',
        email: 'admin@school.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
      },
      {
        id: '2',
        email: 'teacher@school.com',
        password: 'teacher123',
        name: 'Teacher User',
        role: 'teacher'
      }
    ]
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password)
    
    if (!foundUser) {
      throw new Error('Invalid email or password')
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = foundUser
    return userWithoutPassword
  }

  // Generate mock JWT token
  const generateMockToken = () => {
    return 'mock_jwt_token_' + Math.random().toString(36).substring(2, 15)
  }

  // Get auth header for API requests
  const getAuthHeader = () => {
    if (token.value) {
      return {
        'Authorization': `Bearer ${token.value}`
      }
    }
    return {}
  }

  // Check if user has required role
  const hasRole = (requiredRole) => {
    if (!user.value) return false
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.value.role)
    }
    return user.value.role === requiredRole
  }

  // Initialize auth state
  loadAuthState()

  return {
    // State
    user,
    token,
    tokenExpiry,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    isAdmin,
    isTeacher,
    userRole,
    userName,
    
    // Actions
    login,
    logout,
    checkTokenExpiry,
    getAuthHeader,
    hasRole,
  }
})
