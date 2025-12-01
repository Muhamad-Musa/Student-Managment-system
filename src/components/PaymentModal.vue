<template>
  <BaseModal v-if="show" :modelValue="show" @update:modelValue="handleModalClose" :showClose="!isProcessing">
    <div class="payment-modal">
      <h2>{{ title }}</h2>
      
      <!-- Payment Request Stage -->
      <div v-if="stage === 'requesting'" class="payment-stage">
        <div class="loading-spinner"></div>
        <p>Creating payment request...</p>
      </div>
      
      <!-- QR Code Display Stage -->
      <div v-else-if="stage === 'qr'" class="payment-stage">
        <p class="instruction">Scan the QR code with your FIB mobile app to complete payment</p>
        
        <div class="qr-container">
          <img :src="qrCode" alt="Payment QR Code" class="qr-code" />
        </div>
        
        <div class="payment-info">
          <p><strong>Amount:</strong> {{ formatAmount(amount) }} IQD</p>
          <p><strong>Payment Code:</strong> {{ readableCode || paymentId }}</p>
        </div>
        
        <div class="payment-links">
          <p>Or use these direct links:</p>
          <a v-if="personalAppLink" :href="personalAppLink" target="_blank" class="app-link">
            Open in FIB Personal App
          </a>
          <a v-if="businessAppLink" :href="businessAppLink" target="_blank" class="app-link">
            Open in FIB Business App
          </a>
        </div>
        
        <div class="status-check">
          <div class="loading-spinner small"></div>
          <p>Waiting for payment confirmation...</p>
        </div>
      </div>
      
      <!-- Processing Stage -->
      <div v-else-if="stage === 'processing'" class="payment-stage">
        <div class="loading-spinner"></div>
        <p>Verifying payment...</p>
      </div>
      
      <!-- Success Stage -->
      <div v-else-if="stage === 'success'" class="payment-stage success">
        <div class="success-icon">✅</div>
        <p class="success-message">Payment successful!</p>
        <p>Completing student registration...</p>
      </div>
      
      <!-- Error Stage -->
      <div v-else-if="stage === 'error'" class="payment-stage error">
        <div class="error-icon">❌</div>
        <p class="error-message">{{ errorMessage }}</p>
        <div class="modal-actions">
          <BaseButton variant="primary" @click="onRetry" v-if="canRetry">
            Retry Payment
          </BaseButton>
          <BaseButton variant="secondary" @click="onCancel">
            Cancel
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { BaseModal, BaseButton } from './base'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  paymentId: {
    type: String,
    default: ''
  },
  readableCode: {
    type: String,
    default: ''
  },
  qrCode: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    default: 0
  },
  personalAppLink: {
    type: String,
    default: ''
  },
  businessAppLink: {
    type: String,
    default: ''
  },
  stage: {
    type: String,
    default: 'requesting' // requesting, qr, processing, success, error
  },
  errorMessage: {
    type: String,
    default: ''
  },
  canRetry: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['cancel', 'retry'])

const isProcessing = computed(() => {
  return ['requesting', 'processing', 'success'].includes(props.stage)
})

const title = computed(() => {
  switch (props.stage) {
    case 'requesting':
      return 'Creating Payment'
    case 'qr':
      return 'Complete Payment'
    case 'processing':
      return 'Verifying Payment'
    case 'success':
      return 'Payment Successful'
    case 'error':
      return 'Payment Failed'
    default:
      return 'Payment'
  }
})

function formatAmount(amount) {
  return new Intl.NumberFormat('en-IQ').format(amount)
}

function handleModalClose(value) {
  if (!value && !isProcessing.value) {
    emit('cancel')
  }
}

function onCancel() {
  if (!isProcessing.value) {
    emit('cancel')
  }
}

function onRetry() {
  emit('retry')
}
</script>

<style scoped>
.payment-modal {
  min-width: 400px;
  max-width: 500px;
}

.payment-modal h2 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  text-align: center;
}

.payment-stage {
  text-align: center;
  padding: 1rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2f80ed;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

.loading-spinner.small {
  width: 30px;
  height: 30px;
  border-width: 3px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.instruction {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.qr-container {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.qr-code {
  max-width: 250px;
  width: 100%;
  height: auto;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
}

.payment-info {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  text-align: left;
}

.payment-info p {
  margin: 0.5rem 0;
  color: #2c3e50;
}

.payment-links {
  margin: 1.5rem 0;
  text-align: left;
}

.payment-links p {
  margin-bottom: 0.8rem;
  font-weight: 600;
  color: #2c3e50;
}

.app-link {
  display: block;
  padding: 0.8rem 1rem;
  margin: 0.5rem 0;
  background: #2f80ed;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: background 0.2s;
}

.app-link:hover {
  background: #2563be;
}

.status-check {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.status-check p {
  color: #666;
  font-style: italic;
}

.success-icon,
.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-message {
  font-size: 1.3rem;
  color: #52c41a;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-message {
  font-size: 1.1rem;
  color: #ff4d4f;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  margin-top: 1.5rem;
}

/* Dark Theme */
[data-theme="dark"] .payment-modal h2 {
  color: #f0f0f0;
}

[data-theme="dark"] .instruction {
  color: #e0e0e0;
}

[data-theme="dark"] .qr-container {
  background: #1e1e1e;
}

[data-theme="dark"] .payment-info {
  background: #2a2a2a;
}

[data-theme="dark"] .payment-info p {
  color: #e0e0e0;
}

[data-theme="dark"] .payment-links p {
  color: #e0e0e0;
}

[data-theme="dark"] .status-check {
  border-top-color: #444;
}

[data-theme="dark"] .status-check p {
  color: #999;
}
</style>
