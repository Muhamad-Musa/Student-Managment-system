<template>
  <div class="app">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
    <NotificationCenter />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import NotificationCenter from './components/NotificationCenter.vue'
</script>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s, color 0.3s;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f9f9f9;
  transition: background-color 0.3s;
}

/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  transition: background-color 0.3s, color 0.3s;
}

h1 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

/* Dark Theme */
[data-theme="dark"] {
  color-scheme: dark;
}

[data-theme="dark"] body {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

[data-theme="dark"] .main-content {
  background-color: #1a1a1a;
}

/* Router links */
[data-theme="dark"] a {
  color: #5ca4ff;
}

[data-theme="dark"] a:hover {
  color: #7db8ff;
}

/* Smooth transitions for theme changes */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>
