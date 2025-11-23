<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
    :aria-label="ariaLabel"
    :aria-busy="loading"
  >
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <span :class="{ 'visually-hidden': loading && hideTextOnLoading }">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'danger', 'success', 'warning'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  outline: {
    type: Boolean,
    default: false
  },
  hideTextOnLoading: {
    type: Boolean,
    default: false
  },
  ariaLabel: {
    type: String,
    default: undefined
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  return [
    'base-button',
    `base-button--${props.variant}`,
    `base-button--${props.size}`,
    {
      'base-button--block': props.block,
      'base-button--outline': props.outline,
      'base-button--loading': props.loading,
      'base-button--disabled': props.disabled
    }
  ]
})

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 2px solid transparent;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  line-height: 1.5;
  text-decoration: none;
  white-space: nowrap;
}

.base-button:focus-visible {
  outline: 2px solid #2f80ed;
  outline-offset: 2px;
}

.base-button:active:not(:disabled) {
  transform: translateY(1px);
}

/* Sizes */
.base-button--small {
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
}

.base-button--medium {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
}

.base-button--large {
  padding: 0.8rem 1.6rem;
  font-size: 1.125rem;
}

/* Variants */
.base-button--default {
  background: #f5f5f5;
  color: #2c3e50;
  border-color: #ddd;
}

.base-button--default:hover:not(:disabled) {
  background: #e8e8e8;
}

.base-button--primary {
  background: #2f80ed;
  color: white;
  border-color: #2f80ed;
}

.base-button--primary:hover:not(:disabled) {
  background: #2563be;
  border-color: #2563be;
}

.base-button--danger {
  background: #ff4d4f;
  color: white;
  border-color: #ff4d4f;
}

.base-button--danger:hover:not(:disabled) {
  background: #d9363e;
  border-color: #d9363e;
}

.base-button--success {
  background: #52c41a;
  color: white;
  border-color: #52c41a;
}

.base-button--success:hover:not(:disabled) {
  background: #3da80f;
  border-color: #3da80f;
}

.base-button--warning {
  background: #ffa940;
  color: white;
  border-color: #ffa940;
}

.base-button--warning:hover:not(:disabled) {
  background: #d48806;
  border-color: #d48806;
}

/* Outline variant */
.base-button--outline.base-button--default {
  background: transparent;
  color: #2c3e50;
}

.base-button--outline.base-button--primary {
  background: transparent;
  color: #2f80ed;
}

.base-button--outline.base-button--danger {
  background: transparent;
  color: #ff4d4f;
}

.base-button--outline.base-button--success {
  background: transparent;
  color: #52c41a;
}

.base-button--outline.base-button--warning {
  background: transparent;
  color: #ffa940;
}

.base-button--outline:hover:not(:disabled) {
  opacity: 0.8;
}

/* Block */
.base-button--block {
  width: 100%;
}

/* Disabled */
.base-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading */
.base-button--loading {
  cursor: wait;
}

.spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Dark theme */
[data-theme="dark"] .base-button--default {
  background: #2a2a2a;
  color: #e0e0e0;
  border-color: #444;
}

[data-theme="dark"] .base-button--default:hover:not(:disabled) {
  background: #3a3a3a;
}
</style>
