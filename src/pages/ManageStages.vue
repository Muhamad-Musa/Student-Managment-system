<template>
  <div class="page">
    <h1>🎓 Manage Academic Stages</h1>

    <!-- Add Stage Form -->
    <div class="form-section">
      <h2>Add New Stage</h2>
      <form @submit.prevent="onAddStage" class="form">
        <BaseInput
          v-model="newStage.name"
          label="Stage Name"
          placeholder="e.g., First Year, Semester 1"
          :error="errors.name"
          required
        />
        <BaseInput
          v-model.number="newStage.level"
          label="Level"
          type="number"
          placeholder="e.g., 1, 2, 3, 4"
          :error="errors.level"
          min="1"
          max="10"
          required
        />
        <BaseInput
          v-model="newStage.academicYear"
          label="Academic Year"
          placeholder="e.g., 2024-2025"
          :error="errors.academicYear"
          required
        />
        <div class="form-actions">
          <BaseButton variant="primary" type="submit" :disabled="store.loading" :loading="store.loading">
            Add Stage
          </BaseButton>
          <BaseButton variant="secondary" type="reset" @click="resetForm">Clear</BaseButton>
        </div>
      </form>
      <div v-if="successMessage" class="notice success">✅ {{ successMessage }}</div>
      <div v-if="errorMessage" class="notice error">❌ {{ errorMessage }}</div>
    </div>

    <!-- Stages List -->
    <div class="list-section">
      <h2>All Stages ({{ store.stages.length }})</h2>
      
      <div v-if="store.loading" class="loading">Loading stages...</div>
      
      <div v-else-if="store.stages.length === 0" class="empty">
        No stages yet. Add one above! 👆
      </div>

      <table v-else class="stages-table">
        <thead>
          <tr>
            <th>Stage Name</th>
            <th>Level</th>
            <th>Academic Year</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stage in store.stages" :key="stage.id">
            <td>
              <strong>{{ stage.name }}</strong>
            </td>
            <td>
              <BaseBadge variant="primary" size="small">Level {{ stage.level }}</BaseBadge>
            </td>
            <td>{{ stage.academicYear }}</td>
            <td class="actions">
              <BaseButton variant="secondary" size="small" @click="editStage(stage)">Edit</BaseButton>
              <BaseButton variant="danger" size="small" @click="confirmDelete(stage.id)">Delete</BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <BaseModal v-if="showEditModal" @close="closeEditModal" title="Edit Stage">
      <form @submit.prevent="onUpdateStage" class="form">
        <BaseInput
          v-model="editingStage.name"
          label="Stage Name"
          placeholder="e.g., First Year, Semester 1"
          required
        />
        <BaseInput
          v-model.number="editingStage.level"
          label="Level"
          type="number"
          placeholder="e.g., 1, 2, 3, 4"
          min="1"
          max="10"
          required
        />
        <BaseInput
          v-model="editingStage.academicYear"
          label="Academic Year"
          placeholder="e.g., 2024-2025"
          required
        />
        <div class="form-actions">
          <BaseButton variant="primary" type="submit" :disabled="store.loading">
            Update Stage
          </BaseButton>
          <BaseButton variant="secondary" type="button" @click="closeEditModal">Cancel</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStudentStore } from "../stores/studentStore";
import { useNotification } from "../composables/useNotification";
import { BaseInput, BaseButton, BaseBadge, BaseModal } from "../components/base";

const store = useStudentStore();
const { success, error: notifyError } = useNotification();

const newStage = ref({
  name: "",
  level: 1,
  academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
});

const editingStage = ref(null);
const showEditModal = ref(false);
const errors = ref({ name: "", level: "", academicYear: "" });
const successMessage = ref("");
const errorMessage = ref("");

// Load stages on mount
onMounted(async () => {
  try {
    await store.fetchAllStages();
  } catch (err) {
    errorMessage.value = "Failed to load stages";
  }
});

// Add stage
async function onAddStage() {
  errors.value = { name: "", level: "", academicYear: "" };
  errorMessage.value = "";
  successMessage.value = "";

  if (!newStage.value.name.trim()) {
    errors.value.name = "Stage name is required";
    return;
  }

  if (!newStage.value.level || newStage.value.level < 1) {
    errors.value.level = "Valid level is required";
    return;
  }

  if (!newStage.value.academicYear.trim()) {
    errors.value.academicYear = "Academic year is required";
    return;
  }

  try {
    await store.addStage(newStage.value);
    successMessage.value = `Stage "${newStage.value.name}" added successfully!`;
    success(`Stage "${newStage.value.name}" added!`);
    resetForm();
  } catch (err) {
    errorMessage.value = "Failed to add stage: " + err.message;
    notifyError("Failed to add stage");
  }
}

// Edit stage
function editStage(stage) {
  editingStage.value = { ...stage };
  showEditModal.value = true;
}

async function onUpdateStage() {
  try {
    await store.updateStage(editingStage.value.id, {
      name: editingStage.value.name,
      level: editingStage.value.level,
      academicYear: editingStage.value.academicYear,
    });
    success("Stage updated successfully!");
    closeEditModal();
  } catch (err) {
    notifyError("Failed to update stage");
  }
}

function closeEditModal() {
  showEditModal.value = false;
  editingStage.value = null;
}

// Delete stage
function confirmDelete(stageId) {
  const stage = store.stages.find(s => s.id === stageId);
  if (confirm(`Delete stage "${stage.name}"? This cannot be undone.`)) {
    deleteStage(stageId);
  }
}

async function deleteStage(stageId) {
  try {
    await store.deleteStage(stageId);
    success("Stage deleted!");
  } catch (err) {
    notifyError("Failed to delete stage");
  }
}

// Reset form
function resetForm() {
  newStage.value = {
    name: "",
    level: 1,
    academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
  };
  errors.value = { name: "", level: "", academicYear: "" };
  successMessage.value = "";
}
</script>

<style scoped>
.page {
  max-width: 1000px;
  margin: 1.2rem auto;
  padding: 0 1rem;
}

h1 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #34495e;
  font-size: 1.2rem;
}

.form-section,
.list-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
}

.form-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.notice {
  margin-top: 1rem;
  padding: 0.8rem;
  border-radius: 4px;
  font-size: 0.95rem;
}

.notice.success {
  background: #ecf9f1;
  border: 1px solid #bfe9cf;
  color: #27ae60;
}

.notice.error {
  background: #fdeaea;
  border: 1px solid #f5b7b1;
  color: #c0392b;
}

.loading,
.empty {
  padding: 2rem;
  text-align: center;
  color: #666;
  font-size: 1rem;
}

.stages-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.stages-table th,
.stages-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.stages-table th {
  background: #f0f0f0;
  font-weight: bold;
  color: #333;
}

.stages-table tbody tr:hover {
  background: #f9f9f9;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

/* Dark Theme */
[data-theme="dark"] .page {
  color: #e0e0e0;
}

[data-theme="dark"] h1,
[data-theme="dark"] h2 {
  color: #f0f0f0;
}

[data-theme="dark"] .form-section,
[data-theme="dark"] .list-section {
  background: #2a2a2a;
}

[data-theme="dark"] .notice.success {
  background: #1a3d1a;
  border-color: #2d5a2d;
  color: #7ec87e;
}

[data-theme="dark"] .notice.error {
  background: #3d1f1f;
  border-color: #5a2a2a;
  color: #ff6b6b;
}

[data-theme="dark"] .loading,
[data-theme="dark"] .empty {
  color: #999;
}

[data-theme="dark"] .stages-table {
  background: #1e1e1e;
  color: #e0e0e0;
}

[data-theme="dark"] .stages-table th {
  background: #2a2a2a;
  color: #f0f0f0;
  border-bottom-color: #444;
}

[data-theme="dark"] .stages-table td {
  border-bottom-color: #444;
}

[data-theme="dark"] .stages-table tbody tr:hover {
  background: #2a2a2a;
}
</style>
