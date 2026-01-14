// Main entry point for @baito/email package
export * from './client'
export * from './send'

// Export templates for customization
export { JobAlertEmail } from './templates/job-alert'
export { WeeklyDigestEmail } from './templates/weekly-digest'
export { WelcomeEmail } from './templates/welcome'
