// Job Types
export const JOB_TYPES = {
  fullTime: 'full_time',
  partTime: 'part_time',
  contract: 'contract',
  freelance: 'freelance',
  internship: 'internship',
  volunteer: 'volunteer',
  apprenticeship: 'apprenticeship',
} as const

export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES]

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  freelance: 'Freelance',
  internship: 'Internship',
  volunteer: 'Volunteer',
  apprenticeship: 'Apprenticeship',
}

// Job Branches / Industries
export const JOB_BRANCHES = {
  social: 'social',
  environment: 'environment',
  health: 'health',
  education: 'education',
  humanRights: 'human_rights',
  development: 'development',
  sustainability: 'sustainability',
  nonprofit: 'nonprofit',
  governance: 'governance',
  research: 'research',
  communications: 'communications',
  technology: 'technology',
  finance: 'finance',
  operations: 'operations',
  other: 'other',
} as const

export type JobBranch = (typeof JOB_BRANCHES)[keyof typeof JOB_BRANCHES]

export const JOB_BRANCH_LABELS: Record<JobBranch, string> = {
  social: 'Social Impact',
  environment: 'Environment & Climate',
  health: 'Health & Wellbeing',
  education: 'Education',
  human_rights: 'Human Rights',
  development: 'International Development',
  sustainability: 'Sustainability',
  nonprofit: 'Nonprofit Management',
  governance: 'Governance & Policy',
  research: 'Research',
  communications: 'Communications & Marketing',
  technology: 'Technology',
  finance: 'Finance & Accounting',
  operations: 'Operations & HR',
  other: 'Other',
}

// Remote Types
export const REMOTE_TYPES = {
  onsite: 'onsite',
  remote: 'remote',
  hybrid: 'hybrid',
} as const

export type RemoteType = (typeof REMOTE_TYPES)[keyof typeof REMOTE_TYPES]

export const REMOTE_TYPE_LABELS: Record<RemoteType, string> = {
  onsite: 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid',
}

// Experience Levels
export const EXPERIENCE_LEVELS = {
  entry: 'entry',
  junior: 'junior',
  mid: 'mid',
  senior: 'senior',
  lead: 'lead',
  executive: 'executive',
} as const

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[keyof typeof EXPERIENCE_LEVELS]

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  entry: 'Entry Level',
  junior: 'Junior',
  mid: 'Mid-Level',
  senior: 'Senior',
  lead: 'Lead / Manager',
  executive: 'Executive / Director',
}

// Job Status
export const JOB_STATUSES = {
  draft: 'draft',
  pending: 'pending',
  active: 'active',
  expired: 'expired',
  archived: 'archived',
} as const

export type JobStatus = (typeof JOB_STATUSES)[keyof typeof JOB_STATUSES]

// Package Types (pricing tiers)
export const PACKAGE_TYPES = {
  basic: 'basic',
  standard: 'standard',
  premium: 'premium',
  featured: 'featured',
} as const

export type PackageType = (typeof PACKAGE_TYPES)[keyof typeof PACKAGE_TYPES]
