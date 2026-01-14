export type UserRole = 'user' | 'customer' | 'admin'

export type AlertFrequency = 'daily' | 'weekly' | 'instant' | 'none'

export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: UserRole
  alertFrequency: AlertFrequency
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  expiresAt: Date
  token: string
  createdAt: Date
  updatedAt: Date
  ipAddress: string | null
  userAgent: string | null
  userId: string
}

export interface Account {
  id: string
  accountId: string
  providerId: string
  userId: string
  accessToken: string | null
  refreshToken: string | null
  idToken: string | null
  accessTokenExpiresAt: Date | null
  refreshTokenExpiresAt: Date | null
  scope: string | null
  password: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Alert {
  id: string
  userId: string
  name: string
  filters: AlertFilters
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AlertFilters {
  keywords?: string[]
  jobTypes?: string[]
  jobBranches?: string[]
  remoteTypes?: string[]
  experienceLevels?: string[]
  locations?: string[]
  organizations?: string[]
}

export interface SentJob {
  id: string
  userId: string
  jobId: string
  alertId: string | null
  sentAt: Date
}
