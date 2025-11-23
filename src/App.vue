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
[data-theme="dark"] h3,
[data-theme="dark"] h4,
[data-theme="dark"] h5,
[data-theme="dark"] h6 {
  color: #f0f0f0;
}

[data-theme="dark"] p,
[data-theme="dark"] span,
[data-theme="dark"] div,
[data-theme="dark"] label {
  color: #e0e0e0;
}

/* Forms and inputs */
[data-theme="dark"] input,
[data-theme="dark"] select,
[data-theme="dark"] textarea {
  background-color: #2a2a2a;
  color: #e0e0e0;
  border-color: #444;
}

[data-theme="dark"] input::placeholder {
  color: #888;
}

[data-theme="dark"] input:focus,
[data-theme="dark"] select:focus,
[data-theme="dark"] textarea:focus {
  border-color: #2f80ed;
  background-color: #333;
}

/* Buttons */
[data-theme="dark"] .btn,
[data-theme="dark"] button {
  background-color: #2a2a2a;
  color: #e0e0e0;
  border-color: #444;
}

[data-theme="dark"] .btn:hover,
[data-theme="dark"] button:hover {
  background-color: #333;
}

[data-theme="dark"] .btn.primary {
  background-color: #2f80ed;
  border-color: #2f80ed;
  color: #ffffff;
}

/* Tables */
[data-theme="dark"] table,
[data-theme="dark"] .students-table,
[data-theme="dark"] .student-card,
[data-theme="dark"] .card {
  background-color: #1e1e1e;
  border-color: #333;
  color: #e0e0e0;
}

[data-theme="dark"] table th,
[data-theme="dark"] .students-table th {
  background-color: #2a2a2a;
  color: #f0f0f0;
  border-color: #444;
}

[data-theme="dark"] table td,
[data-theme="dark"] .students-table td {
  border-color: #333;
  color: #e0e0e0;
}

[data-theme="dark"] table tr:hover,
[data-theme="dark"] .students-table tr:hover {
  background-color: #2a2a2a;
}

[data-theme="dark"] tbody tr {
  background-color: #1e1e1e;
}

/* Lists */
[data-theme="dark"] ul,
[data-theme="dark"] li {
  color: #e0e0e0;
}

/* Forms and containers */
[data-theme="dark"] .form,
[data-theme="dark"] .form-group,
[data-theme="dark"] .page {
  background-color: #1e1e1e;
  border-color: #333;
  color: #e0e0e0;
}

[data-theme="dark"] .empty-state,
[data-theme="dark"] .loading,
[data-theme="dark"] .empty-msg {
  color: #b0b0b0;
}

/* Specific page elements */
[data-theme="dark"] .stage-list li,
[data-theme="dark"] .course-item,
[data-theme="dark"] .stat-card,
[data-theme="dark"] .students-list,
[data-theme="dark"] .assigned-list {
  background-color: #2a2a2a;
  border-color: #444;
  color: #e0e0e0;
}

[data-theme="dark"] .stage-list li.active {
  background-color: #2f80ed;
  color: #ffffff;
}

[data-theme="dark"] .stage-list li:hover {
  background-color: #333;
}

/* Attendance and specific components */
[data-theme="dark"] .attendance-table,
[data-theme="dark"] .recent-table {
  background-color: #1e1e1e;
  color: #e0e0e0;
}

[data-theme="dark"] .attendance-table thead,
[data-theme="dark"] .recent-table thead {
  background-color: #2a2a2a;
}

[data-theme="dark"] .course-students,
[data-theme="dark"] .nav-buttons {
  color: #e0e0e0;
}

/* Router links */
[data-theme="dark"] a {
  color: #5ca4ff;
}

[data-theme="dark"] a:hover {
  color: #7db8ff;
}

[data-theme="dark"] .router-link-active {
  color: #2f80ed;
}

/* Warning/No data states */
[data-theme="dark"] .no-students,
[data-theme="dark"] .warning {
  background-color: #3a3000;
  border-color: #665500;
  color: #ffeb99;
}

/* Strong/Bold text */
[data-theme="dark"] strong {
  color: #f0f0f0;
}

/* Smooth transitions for all theme changes */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>
