<template>
  <div class="base-select" :class="{ 'base-select--error': error, 'base-select--disabled': disabled }">
    <label v-if="label" :for="selectId" class="base-select__label">
      {{ label }}
      <span v-if="required" class="base-select__required" aria-label="required">*</span>
    </label>
    
    <div class="base-select__wrapper">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :aria-label="ariaLabel || label"
        :aria-describedby="error ? `${selectId}-error` : helpText ? `${selectId}-help` : undefined"
        :aria-invalid="!!error"
        class="base-select__field"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <slot></slot>
      </select>
      <span class="base-select__icon" aria-hidden="true">▼</span>
    </div>
    
    <small v-if="error" :id="`${selectId}-error`" class="base-select__error" role="alert">
      {{ error }}
    </small>
    
    <small v-else-if="helpText" :id="`${selectId}-help`" class="base-select__help">
      {{ helpText }}
    </small>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  ariaLabel: {
    type: String,
    default: undefined
  },
  id: {
    type: String,
    default: undefined
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'change'])

const selectId = computed(() => props.id || `select-${Math.random().toString(36).substr(2, 9)}`)

const handleChange = (event) => {
  emit('update:modelValue', event.target.value)
  emit('change', event.target.value)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}
</script>

<style scoped>
.base-select {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.base-select__label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.base-select__required {
  color: #ff4d4f;
}

.base-select__wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.base-select__field {
  flex: 1;
  appearance: none;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.6rem 2.5rem 0.6rem 0.8rem;
  font-size: 1rem;
  font-family: inherit;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
  color: inherit;
  width: 100%;
}

.base-select__field:focus {
  outline: none;
  border-color: #2f80ed;
  box-shadow: 0 0 0 2px rgba(47, 128, 237, 0.1);
}

.base-select--error .base-select__field {
  border-color: #ff4d4f;
}

.base-select--error .base-select__field:focus {
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1);
}

.base-select__field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
}

.base-select__icon {
  position: absolute;
  right: 0.8rem;
  pointer-events: none;
  color: #666;
  font-size: 0.7rem;
}

.base-select__error {
  color: #ff4d4f;
  font-size: 0.875rem;
}

.base-select__help {
  color: #666;
  font-size: 0.875rem;
  font-style: italic;
}

.base-select--disabled {
  opacity: 0.6;
}

/* Dark theme */
[data-theme="dark"] .base-select__label {
  color: #f0f0f0;
}

[data-theme="dark"] .base-select__field {
  background: #2a2a2a;
  border-color: #444;
  color: #e0e0e0;
}

[data-theme="dark"] .base-select__field:disabled {
  background: #1a1a1a;
}

[data-theme="dark"] .base-select__icon {
  color: #999;
}
</style>
