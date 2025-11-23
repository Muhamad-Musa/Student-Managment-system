<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="base-modal-overlay"
        @click="handleOverlayClick"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="hasDescription ? contentId : undefined"
      >
        <div
          class="base-modal"
          :class="`base-modal--${size}`"
          @click.stop
          ref="modalRef"
        >
          <div class="base-modal__header">
            <h2 v-if="title" :id="titleId" class="base-modal__title">{{ title }}</h2>
            <slot name="header"></slot>
            <button
              v-if="showClose"
              class="base-modal__close"
              @click="close"
              aria-label="Close modal"
              type="button"
            >
              ✕
            </button>
          </div>
          
          <div :id="contentId" class="base-modal__content">
            <slot></slot>
          </div>
          
          <div v-if="$slots.footer" class="base-modal__footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'full'].includes(value)
  },
  showClose: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  closeOnEscape: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const modalRef = ref(null)
const titleId = computed(() => `modal-title-${Math.random().toString(36).substr(2, 9)}`)
const contentId = computed(() => `modal-content-${Math.random().toString(36).substr(2, 9)}`)
const hasDescription = computed(() => !!props.title)

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close()
  }
}

const handleEscape = (event) => {
  if (event.key === 'Escape' && props.closeOnEscape && props.modelValue) {
    close()
  }
}

// Focus trap
const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
let firstFocusable = null
let lastFocusable = null

const trapFocus = (event) => {
  if (!modalRef.value) return

  const focusables = modalRef.value.querySelectorAll(focusableElements)
  firstFocusable = focusables[0]
  lastFocusable = focusables[focusables.length - 1]

  if (event.key === 'Tab') {
    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus()
        event.preventDefault()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus()
        event.preventDefault()
      }
    }
  }
}

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
    // Focus first focusable element
    setTimeout(() => {
      const focusables = modalRef.value?.querySelectorAll(focusableElements)
      if (focusables && focusables.length > 0) {
        focusables[0].focus()
      }
    }, 100)
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  document.addEventListener('keydown', trapFocus)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.removeEventListener('keydown', trapFocus)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.base-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.base-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.base-modal--small {
  width: 100%;
  max-width: 400px;
}

.base-modal--medium {
  width: 100%;
  max-width: 600px;
}

.base-modal--large {
  width: 100%;
  max-width: 900px;
}

.base-modal--full {
  width: 95vw;
  max-width: none;
}

.base-modal__header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.base-modal__title {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.base-modal__close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color 0.2s;
  border-radius: 4px;
}

.base-modal__close:hover {
  color: #ff4d4f;
}

.base-modal__close:focus-visible {
  outline: 2px solid #2f80ed;
  outline-offset: 2px;
}

.base-modal__content {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.base-modal__footer {
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .base-modal,
.modal-leave-active .base-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .base-modal,
.modal-leave-to .base-modal {
  transform: scale(0.9);
}

/* Dark theme */
[data-theme="dark"] .base-modal {
  background: #1e1e1e;
  color: #e0e0e0;
}

[data-theme="dark"] .base-modal__header,
[data-theme="dark"] .base-modal__footer {
  border-color: #444;
}

[data-theme="dark"] .base-modal__title {
  color: #f0f0f0;
}

[data-theme="dark"] .base-modal__close {
  color: #999;
}

[data-theme="dark"] .base-modal__close:hover {
  color: #ff4d4f;
}
</style>
