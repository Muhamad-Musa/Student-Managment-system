<template>
  <span :class="badgeClasses" role="status" :aria-label="ariaLabel">
    <slot></slot>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  dot: {
    type: Boolean,
    default: false
  },
  ariaLabel: {
    type: String,
    default: undefined
  }
})

const badgeClasses = computed(() => {
  return [
    'base-badge',
    `base-badge--${props.variant}`,
    `base-badge--${props.size}`,
    {
      'base-badge--dot': props.dot
    }
  ]
})
</script>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 12px;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Sizes */
.base-badge--small {
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
}

.base-badge--medium {
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
}

.base-badge--large {
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
}

/* Variants */
.base-badge--default {
  background: #f5f5f5;
  color: #2c3e50;
  border: 1px solid #ddd;
}

.base-badge--primary {
  background: #2f80ed;
  color: white;
}

.base-badge--success {
  background: #52c41a;
  color: white;
}

.base-badge--warning {
  background: #ffa940;
  color: white;
}

.base-badge--danger {
  background: #ff4d4f;
  color: white;
}

.base-badge--info {
  background: #1890ff;
  color: white;
}

/* Dot variant */
.base-badge--dot {
  padding: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  font-size: 0;
}

.base-badge--dot.base-badge--small {
  width: 6px;
  height: 6px;
}

.base-badge--dot.base-badge--large {
  width: 10px;
  height: 10px;
}

/* Dark theme */
[data-theme="dark"] .base-badge--default {
  background: #2a2a2a;
  color: #e0e0e0;
  border-color: #444;
}
</style>
