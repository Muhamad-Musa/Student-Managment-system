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
  background-color: #0d0d0d;
}

[data-theme="dark"] h1,
[data-theme="dark"] h2,
[data-theme="dark"] h3 {
  color: #f0f0f0;
}

[data-theme="dark"] input,
[data-theme="dark"] select,
[data-theme="dark"] textarea {
  background-color: #2a2a2a;
  color: #e0e0e0;
  border-color: #444;
}

[data-theme="dark"] .btn {
  background-color: #2a2a2a;
  color: #e0e0e0;
  border-color: #444;
}

[data-theme="dark"] .btn.primary {
  background-color: #2f80ed;
  border-color: #2f80ed;
}

[data-theme="dark"] .students-table,
[data-theme="dark"] .student-card {
  background-color: #1e1e1e;
  border-color: #333;
}

[data-theme="dark"] .students-table th {
  background-color: #2a2a2a;
  color: #f0f0f0;
}

[data-theme="dark"] .students-table tr:hover {
  background-color: #2a2a2a;
}

[data-theme="dark"] .empty-state,
[data-theme="dark"] .loading {
  color: #b0b0b0;
}

[data-theme="dark"] .form {
  background-color: #1e1e1e;
  border: 1px solid #333;
}

/* Smooth transitions for all theme changes */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>
