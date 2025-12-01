import { FIB_CONFIG } from '../config/fib'

class FIBPaymentService {
  constructor() {
    this.config = FIB_CONFIG
    this.token = null
    this.tokenExpiry = null
  }

  async getAuthToken() {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token
    }
    
    const params = new URLSearchParams()
    params.append('grant_type', 'client_credentials')
    params.append('client_id', this.config.identifier)
    params.append('client_secret', this.config.secretKey)
    
    const response = await fetch(`${this.config.baseUrl}/auth/realms/fib-online-shop/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('FIB Auth Error:', response.status, errorData)
      throw new Error(`Authentication failed: ${response.status}`)
    }

    const data = await response.json()
    this.token = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000
    return data.access_token
  }

  async createPayment(paymentData) {
    const token = await this.getAuthToken()
    
    const payload = {
      monetaryValue: {
        amount: String(paymentData.amount || this.config.amount),
        currency: this.config.currency
      },
      description: paymentData.description || this.config.paymentDescription,
      expiresIn: 'PT9M'
    }

    const response = await fetch(`${this.config.baseUrl}/protected/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('FIB Payment Error:', response.status, errorData)
      throw new Error(errorData.message || `Payment creation failed: ${response.status}`)
    }

    const data = await response.json()
    console.log('Payment created:', data.paymentId)
    
    return {
      paymentId: data.paymentId,
      readableCode: data.readableCode,
      personalAppLink: data.personalAppLink,
      businessAppLink: data.businessAppLink,
      corporateAppLink: data.corporateAppLink,
      qrCode: data.qrCode,
      validUntil: data.validUntil
    }
  }

  async checkPaymentStatus(paymentId) {
    const token = await this.getAuthToken()
    
    const response = await fetch(`${this.config.baseUrl}/protected/v1/payments/${paymentId}/status`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`)
    }

    const data = await response.json()
    return {
      status: data.status,
      paid: data.status === 'PAID' || data.status === 'SUCCESS'
    }
  }

  async cancelPayment(paymentId) {
    const token = await this.getAuthToken()
    
    const response = await fetch(`${this.config.baseUrl}/protected/v1/payments/${paymentId}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!response.ok) {
      throw new Error(`Cancellation failed: ${response.status}`)
    }

    // Handle empty response
    const text = await response.text()
    return text ? JSON.parse(text) : { success: true }
  }

  async waitForPayment(paymentId, maxAttempts = 60, interval = 5000) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const status = await this.checkPaymentStatus(paymentId)
        
        if (status.paid) {
          return { success: true, status }
        }
        
        if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(status.status)) {
          return { success: false, status, reason: status.status }
        }
        
        await new Promise(resolve => setTimeout(resolve, interval))
      } catch (error) {
        console.error('Payment check failed:', error)
        if (i === maxAttempts - 1) throw new Error('Payment verification timeout')
        await new Promise(resolve => setTimeout(resolve, interval))
      }
    }
    
    throw new Error('Payment verification timeout')
  }
}

export const fibPaymentService = new FIBPaymentService()
