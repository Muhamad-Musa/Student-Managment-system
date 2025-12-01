// FIB (First Iraqi Bank) Configuration
export const FIB_CONFIG = {
  identifier: 'salahadin-testig-creds',
  secretKey: '9bcffb11-84d1-469b-b1c1-5cc765598720',
  // Use proxy in development to avoid CORS issues
  baseUrl: import.meta.env.DEV ? '/fib-api' : 'https://fib.stage.fib.iq',
  paymentDescription: 'Student Registration Fee',
  amount: 1,
  currency: 'IQD'
}
