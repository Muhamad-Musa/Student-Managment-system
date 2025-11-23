<template>
  <footer>
    <p>&copy; 2025 Student Management System. All rights reserved.</p>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
footer {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
  margin-top: 2rem;
}

[data-theme="dark"] footer {
  background-color: #1a1a1a;
  border-top: 1px solid #444;
}
</style>
