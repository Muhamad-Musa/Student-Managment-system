<template>
  <div class="stage-management">
    <h1>🏫 Manage Stages</h1>

    <!-- Add New Stage -->
    <form @submit.prevent="addStage" class="add-stage-form">
      <BaseInput
        v-model="newStageName"
        placeholder="Enter stage name (e.g., Stage 1, Stage 4A)"
        label="Stage Name"
        required
      />
      <BaseButton type="submit" :loading="store.loading">
        Add Stage
      </BaseButton>
    </form>

    <!-- Stage List -->
    <div class="stage-list">
      <h2>📚 Available Stages</h2>
      <div v-if="store.loading" class="loading">Loading stages...</div>
      <div v-else-if="store.stages.length > 0">
        <ul>
          <li
            v-for="stageItem in store.stages"
            :key="stageItem.id"
            @click="selectStage(stageItem.id)"
            :class="{ active: selectedStageId === stageItem.id }"
          >
            {{ stageItem.name }}
            <BaseBadge variant="info" size="small">
              {{ studentsInStage(stageItem.id).length }} students
            </BaseBadge>
          </li>
        </ul>
      </div>
      <div v-else>No stages yet</div>
    </div>

    <!-- Students in Selected Stage -->
    <div v-if="selectedStageId" class="students-list">
      <h3>👨‍🎓 Students in {{ selectedStageName }}</h3>
      <div v-if="studentsInSelectedStage.length > 0">
        <ul>
          <li
            v-for="student in studentsInSelectedStage"
            :key="student.id"
          >
            {{ student.name }} (Age: {{ student.age }})
          </li>
        </ul>
      </div>
      <p v-else class="empty-msg">
        No students assigned to this stage yet.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStudentStore } from "../stores/studentStore";
import { useNotification } from "../composables/useNotification";
import { BaseInput, BaseButton, BaseBadge } from "../components/base";

const store = useStudentStore();
const { showNotification } = useNotification();
const newStageName = ref("");
const selectedStageId = ref(null);

// Load stages and students on mount
onMounted(async () => {
  try {
    console.log('🚀 ClassManagement: Loading data...');
    await Promise.all([
      store.fetchAllStages(),
      store.fetchAllStudents()
    ]);
    console.log('✅ ClassManagement: Data loaded');
    console.log('📊 Stages:', store.stages);
    console.log('👥 Students:', store.students);
    
    // Log each student's stage_id
    store.students.forEach(student => {
      console.log(`Student: ${student.name}, stage_id: ${student.stage_id}, type: ${typeof student.stage_id}`);
    });
  } catch (err) {
    console.error("❌ Failed to load data:", err);
    showNotification(`Failed to load data: ${err.message}`, 'error');
  }
});

// Add stage function
async function addStage() {
  if (newStageName.value.trim() === "") return;
  try {
    await store.addStage(newStageName.value.trim());
    newStageName.value = "";
    showNotification('Stage added successfully', 'success');
  } catch (err) {
    console.error("❌ Failed to add stage:", err);
    showNotification(`Failed to add stage: ${err.message}`, 'error');
  }
}

// Get the name of selected stage
const selectedStageName = computed(() => {
  const stageItem = store.stages.find((s) => s.id === selectedStageId.value);
  return stageItem ? stageItem.name : "";
});

// computed: students of selected stage
const studentsInSelectedStage = computed(() => {
  if (!selectedStageId.value) return [];
  console.log(`🔄 Computed: Getting students for selected stage ${selectedStageId.value}`);
  const result = store.getStudentsByStage(selectedStageId.value);
  console.log(`🔄 Computed result:`, result);
  return result;
});

function selectStage(stageId) {
  selectedStageId.value = stageId;
  console.log(`📌 Selected stage: ${stageId}`);
  console.log(`👥 Students in stage:`, studentsInStage(stageId));
}

// Helper to get students for a specific stage
function studentsInStage(stageId) {
  try {
    const students = store.getStudentsByStage(stageId);
    console.log(`🔍 Getting students for stage ${stageId}:`, students);
    return students;
  } catch (err) {
    console.error(`❌ Error getting students for stage ${stageId}:`, err);
    showNotification(`Error loading students: ${err.message}`, 'error');
    return [];
  }
}
</script>

<style scoped>
.stage-management {
  padding: 20px;
  max-width: 800px;
  margin: auto;
}

.add-stage-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.add-stage-form input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.add-stage-form button {
  background-color: #2f80ed;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;
}

.add-stage-form button:hover:not(:disabled) {
  background-color: #2563be;
}

.add-stage-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  color: #666;
  padding: 1rem;
  text-align: center;
}

.stage-list ul {
  list-style: none;
  padding: 0;
}

.stage-list li {
  background: #f8f9fa;
  margin-bottom: 8px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.3s;
}

.stage-list li:hover {
  background: #e2e6ea;
}

.stage-list li.active {
  background: #2f80ed;
  color: white;
}

.students-list {
  margin-top: 30px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.students-list ul {
  list-style: none;
  padding: 0;
}

.students-list li {
  background: white;
  padding: 8px;
  margin-bottom: 6px;
  border-radius: 4px;
  border-left: 3px solid #2f80ed;
}

.empty-msg {
  color: #777;
  font-style: italic;
}

/* Dark Theme */
[data-theme="dark"] .stage-management {
  color: #e0e0e0;
}

[data-theme="dark"] .add-stage-form input {
  background: #1e1e1e;
  border-color: #444;
  color: #e0e0e0;
}

[data-theme="dark"] .add-stage-form input::placeholder {
  color: #666;
}

[data-theme="dark"] .loading {
  color: #999;
}

[data-theme="dark"] .stage-list li {
  background: #2a2a2a;
  color: #e0e0e0;
}

[data-theme="dark"] .stage-list li:hover {
  background: #333;
}

[data-theme="dark"] .stage-list li.active {
  background: #2f80ed;
  color: white;
}

[data-theme="dark"] .students-list {
  background: #2a2a2a;
}

[data-theme="dark"] .students-list li {
  background: #1e1e1e;
  color: #e0e0e0;
  border-left-color: #2f80ed;
}

[data-theme="dark"] .empty-msg {
  color: #999;
}
</style>
