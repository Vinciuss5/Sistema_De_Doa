import { projectId, publicAnonKey } from './supabase/info'
import { getAccessToken } from './supabase/client'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-9a2c3dfe`

// Helper function to make authenticated requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || publicAnonKey}`,
    ...options.headers as Record<string, string>
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(`API Error (${endpoint}):`, data.error)
      throw new Error(data.error || 'Erro na requisição')
    }

    return data
  } catch (error) {
    console.error(`API Request Failed (${endpoint}):`, error)
    throw error
  }
}

// ==================== DONOR API ====================

export async function getDonors() {
  return apiRequest('/donors')
}

export async function getDonor(code: string) {
  return apiRequest(`/donors/${code}`)
}

export async function createDonor(donor: any) {
  return apiRequest('/donors', {
    method: 'POST',
    body: JSON.stringify(donor)
  })
}

export async function updateDonor(code: string, donor: any) {
  return apiRequest(`/donors/${code}`, {
    method: 'PUT',
    body: JSON.stringify(donor)
  })
}

// ==================== BENEFICIARY API ====================

export async function getBeneficiaries() {
  return apiRequest('/beneficiaries')
}

export async function getBeneficiary(code: string) {
  return apiRequest(`/beneficiaries/${code}`)
}

export async function createBeneficiary(beneficiary: any) {
  return apiRequest('/beneficiaries', {
    method: 'POST',
    body: JSON.stringify(beneficiary)
  })
}

export async function updateBeneficiary(code: string, beneficiary: any) {
  return apiRequest(`/beneficiaries/${code}`, {
    method: 'PUT',
    body: JSON.stringify(beneficiary)
  })
}

// ==================== PRODUCT API ====================

export async function getProducts() {
  return apiRequest('/products')
}

export async function getProduct(id: string) {
  return apiRequest(`/products/${id}`)
}

export async function createProduct(product: any) {
  return apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(product)
  })
}

export async function updateProduct(id: string, product: any) {
  return apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product)
  })
}

// ==================== DISTRIBUTION API ====================

export async function getDistributions() {
  return apiRequest('/distributions')
}

export async function createDistribution(distribution: any) {
  return apiRequest('/distributions', {
    method: 'POST',
    body: JSON.stringify(distribution)
  })
}

// ==================== STATS API ====================

export async function getStats() {
  return apiRequest('/stats')
}
