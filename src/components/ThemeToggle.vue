<template>
  <button 
    @click="toggleTheme" 
    class="theme-toggle"
    :title="`Switch to ${prefsStore.theme === 'light' ? 'dark' : 'light'} theme`"
  >
    <span v-if="prefsStore.theme === 'light'">🌙</span>
    <span v-else>☀️</span>
  </button>
</template>

<script setup>
import { usePrefsStore } from '../stores/prefsStore'

const prefsStore = usePrefsStore()

const toggleTheme = () => {
  prefsStore.toggleTheme()
}
</script>

<style scoped>
.theme-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1.2rem;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}
</style>
