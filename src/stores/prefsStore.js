import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

/**
 * Pinia store for user preferences with localStorage persistence
 */
export const usePrefsStore = defineStore('prefs', () => {
  // State
  const theme = ref('light') // 'light' | 'dark'
  const viewMode = ref('list') // 'list' | 'grid'
  const sidebarCollapsed = ref(false)
  const pageSize = ref(8) // items per page

  // Load from localStorage on init
  const loadPrefs = () => {
    try {
      const stored = localStorage.getItem('student-mgmt-prefs')
      if (stored) {
        const prefs = JSON.parse(stored)
        theme.value = prefs.theme || 'light'
        viewMode.value = prefs.viewMode || 'list'
        sidebarCollapsed.value = prefs.sidebarCollapsed || false
        pageSize.value = prefs.pageSize || 8
      }
    } catch (err) {
      console.error('Error loading preferences:', err)
    }
  }

  // Save to localStorage
  const savePrefs = () => {
    try {
      const prefs = {
        theme: theme.value,
        viewMode: viewMode.value,
        sidebarCollapsed: sidebarCollapsed.value,
        pageSize: pageSize.value,
      }
      localStorage.setItem('student-mgmt-prefs', JSON.stringify(prefs))
    } catch (err) {
      console.error('Error saving preferences:', err)
    }
  }

  // Watch for changes and persist
  watch([theme, viewMode, sidebarCollapsed, pageSize], () => {
    savePrefs()
  })

  // Actions
  const setTheme = (newTheme) => {
    theme.value = newTheme
    // Apply theme class to document
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  const setViewMode = (mode) => {
    viewMode.value = mode
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setPageSize = (size) => {
    pageSize.value = size
  }

  const resetPrefs = () => {
    theme.value = 'light'
    viewMode.value = 'list'
    sidebarCollapsed.value = false
    pageSize.value = 8
    localStorage.removeItem('student-mgmt-prefs')
  }

  // Load preferences on store initialization
  loadPrefs()
  // Apply theme immediately
  document.documentElement.setAttribute('data-theme', theme.value)

  return {
    // State
    theme,
    viewMode,
    sidebarCollapsed,
    pageSize,
    // Actions
    setTheme,
    toggleTheme,
    setViewMode,
    toggleSidebar,
    setPageSize,
    resetPrefs,
  }
})
