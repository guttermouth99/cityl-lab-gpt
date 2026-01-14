import { render } from '@react-email/components'
import { sendgridClient, EMAIL_FROM, UNSUBSCRIBE_URL } from './client'
import { JobAlertEmail } from './templates/job-alert'
import { WeeklyDigestEmail } from './templates/weekly-digest'
import { WelcomeEmail } from './templates/welcome'
import type React from 'react'

interface SendEmailOptions {
  to: string
  subject: string
  component: React.ReactElement
  listUnsubscribe?: string
}

export async function sendEmail({ to, subject, component, listUnsubscribe }: SendEmailOptions) {
  const html = await render(component)
  const text = await render(component, { plainText: true })

  const headers: Record<string, string> = {}
  if (listUnsubscribe) {
    headers['List-Unsubscribe'] = `<${listUnsubscribe}>`
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'
  }

  await sendgridClient.send({
    to,
    from: EMAIL_FROM,
    subject,
    html,
    text,
    headers,
  })
}

// Convenience functions for specific email types

export async function sendJobAlertEmail(
  to: string,
  data: {
    userName: string
    alertName: string
    jobs: {
      id: string
      title: string
      slug: string
      organizationName: string
      location?: string
      jobType?: string
    }[]
    unsubscribeUrl?: string
    viewAllUrl?: string
  },
) {
  await sendEmail({
    to,
    subject: `${data.jobs.length} new job${data.jobs.length !== 1 ? 's' : ''} matching "${data.alertName}"`,
    component: JobAlertEmail({
      userName: data.userName,
      alertName: data.alertName,
      jobs: data.jobs,
      unsubscribeUrl: data.unsubscribeUrl || UNSUBSCRIBE_URL,
      viewAllUrl: data.viewAllUrl || 'https://baito.jobs/jobs',
    }),
    listUnsubscribe: data.unsubscribeUrl || UNSUBSCRIBE_URL,
  })
}

export async function sendWeeklyDigestEmail(
  to: string,
  data: {
    userName: string
    totalNewJobs: number
    topJobs: {
      id: string
      title: string
      slug: string
      organizationName: string
      location?: string
    }[]
    topCategories: { name: string; count: number }[]
    unsubscribeUrl?: string
  },
) {
  await sendEmail({
    to,
    subject: `Your weekly job digest - ${data.totalNewJobs} new impact jobs`,
    component: WeeklyDigestEmail({
      userName: data.userName,
      totalNewJobs: data.totalNewJobs,
      topJobs: data.topJobs,
      topCategories: data.topCategories,
      unsubscribeUrl: data.unsubscribeUrl || UNSUBSCRIBE_URL,
    }),
    listUnsubscribe: data.unsubscribeUrl || UNSUBSCRIBE_URL,
  })
}

export async function sendWelcomeEmail(
  to: string,
  data: {
    userName: string
    verificationUrl?: string
  },
) {
  await sendEmail({
    to,
    subject: 'Welcome to Baito Jobs! 🌱',
    component: WelcomeEmail({
      userName: data.userName,
      verificationUrl: data.verificationUrl,
    }),
  })
}

// Batch sending for newsletters
export async function sendBatchEmails(
  emails: { to: string; subject: string; component: React.ReactElement }[],
) {
  const messages = await Promise.all(
    emails.map(async (email) => ({
      to: email.to,
      from: EMAIL_FROM,
      subject: email.subject,
      html: await render(email.component),
      text: await render(email.component, { plainText: true }),
    })),
  )

  // SendGrid supports up to 1000 recipients per batch
  return sendgridClient.send(messages)
}
