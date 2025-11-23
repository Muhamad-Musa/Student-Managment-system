<template>
  <div class="base-input" :class="{ 'base-input--error': error, 'base-input--disabled': disabled }">
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required" aria-label="required">*</span>
    </label>
    
    <div class="base-input__wrapper">
      <span v-if="$slots.prefix" class="base-input__prefix">
        <slot name="prefix"></slot>
      </span>
      
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :aria-label="ariaLabel || label"
        :aria-describedby="error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined"
        :aria-invalid="!!error"
        class="base-input__field"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      
      <span v-if="$slots.suffix" class="base-input__suffix">
        <slot name="suffix"></slot>
      </span>
    </div>
    
    <small v-if="error" :id="`${inputId}-error`" class="base-input__error" role="alert">
      {{ error }}
    </small>
    
    <small v-else-if="helpText" :id="`${inputId}-help`" class="base-input__help">
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
  type: {
    type: String,
    default: 'text'
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
  readonly: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: undefined
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

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`)

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}
</script>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.base-input__label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.base-input__required {
  color: #ff4d4f;
}

.base-input__wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.6rem;
  transition: border-color 0.2s;
  background: white;
}

.base-input__wrapper:focus-within {
  border-color: #2f80ed;
  outline: 2px solid rgba(47, 128, 237, 0.1);
  outline-offset: 0;
}

.base-input--error .base-input__wrapper {
  border-color: #ff4d4f;
}

.base-input--error .base-input__wrapper:focus-within {
  outline-color: rgba(255, 77, 79, 0.1);
}

.base-input__field {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  font-family: inherit;
  background: transparent;
  color: inherit;
}

.base-input__field::placeholder {
  color: #999;
}

.base-input__field:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.base-input__prefix,
.base-input__suffix {
  display: flex;
  align-items: center;
  color: #666;
}

.base-input__error {
  color: #ff4d4f;
  font-size: 0.875rem;
}

.base-input__help {
  color: #666;
  font-size: 0.875rem;
  font-style: italic;
}

.base-input--disabled {
  opacity: 0.6;
}

.base-input--disabled .base-input__wrapper {
  background: #f5f5f5;
  cursor: not-allowed;
}

/* Dark theme */
[data-theme="dark"] .base-input__label {
  color: #f0f0f0;
}

[data-theme="dark"] .base-input__wrapper {
  background: #2a2a2a;
  border-color: #444;
}

[data-theme="dark"] .base-input__field {
  color: #e0e0e0;
}

[data-theme="dark"] .base-input--disabled .base-input__wrapper {
  background: #1a1a1a;
}
</style>
