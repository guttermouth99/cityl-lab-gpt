export type CustomerPlan = 'starter' | 'professional' | 'enterprise'

export type CustomerStatus = 'active' | 'suspended' | 'cancelled'

export interface Customer {
  id: string
  userId: string
  organizationId: string
  stripeCustomerId: string | null
  plan: CustomerPlan
  status: CustomerStatus
  jobsLimit: number
  jobsUsed: number
  billingEmail: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateCustomerInput {
  userId: string
  organizationId: string
  plan?: CustomerPlan
  billingEmail?: string | null
}

export interface UpdateCustomerInput {
  plan?: CustomerPlan
  status?: CustomerStatus
  stripeCustomerId?: string | null
  jobsLimit?: number
  jobsUsed?: number
  billingEmail?: string | null
}
