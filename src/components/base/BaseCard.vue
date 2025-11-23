<template>
  <div class="base-card" :class="cardClasses">
    <div v-if="$slots.header || title" class="base-card__header">
      <h3 v-if="title" class="base-card__title">{{ title }}</h3>
      <slot name="header"></slot>
    </div>
    
    <div class="base-card__body">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  bordered: {
    type: Boolean,
    default: true
  },
  shadow: {
    type: String,
    default: 'sm',
    validator: (value) => ['none', 'sm', 'md', 'lg'].includes(value)
  },
  padding: {
    type: String,
    default: 'normal',
    validator: (value) => ['none', 'sm', 'normal', 'lg'].includes(value)
  }
})

const cardClasses = computed(() => {
  return [
    {
      'base-card--hoverable': props.hoverable,
      'base-card--bordered': props.bordered
    },
    `base-card--shadow-${props.shadow}`,
    `base-card--padding-${props.padding}`
  ]
})
</script>

<style scoped>
.base-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.base-card--bordered {
  border: 1px solid #e0e0e0;
}

.base-card--shadow-none {
  box-shadow: none;
}

.base-card--shadow-sm {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.base-card--shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.base-card--shadow-lg {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.base-card--hoverable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.base-card__header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.base-card--padding-none .base-card__header {
  padding: 0;
  border-bottom: none;
}

.base-card--padding-sm .base-card__header {
  padding: 0.75rem;
}

.base-card--padding-lg .base-card__header {
  padding: 2rem;
}

.base-card__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.base-card__body {
  padding: 1.5rem;
}

.base-card--padding-none .base-card__body {
  padding: 0;
}

.base-card--padding-sm .base-card__body {
  padding: 0.75rem;
}

.base-card--padding-lg .base-card__body {
  padding: 2rem;
}

.base-card__footer {
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.base-card--padding-none .base-card__footer {
  padding: 0;
  border-top: none;
}

.base-card--padding-sm .base-card__footer {
  padding: 0.75rem;
}

.base-card--padding-lg .base-card__footer {
  padding: 2rem;
}

/* Dark theme */
[data-theme="dark"] .base-card {
  background: #1e1e1e;
  border-color: #333;
}

[data-theme="dark"] .base-card__header,
[data-theme="dark"] .base-card__footer {
  border-color: #333;
}

[data-theme="dark"] .base-card__title {
  color: #f0f0f0;
}
</style>
