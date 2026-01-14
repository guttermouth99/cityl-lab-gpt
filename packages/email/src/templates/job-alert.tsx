import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface JobAlertEmailProps {
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
  unsubscribeUrl: string
  viewAllUrl: string
}

export function JobAlertEmail({
  userName = 'there',
  alertName = 'Job Alert',
  jobs = [],
  unsubscribeUrl = '#',
  viewAllUrl = '#',
}: JobAlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New jobs matching your "{alertName}" alert</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>🌱 Baito Jobs</Heading>
          
          <Text style={paragraph}>Hi {userName},</Text>
          
          <Text style={paragraph}>
            We found <strong>{jobs.length} new job{jobs.length !== 1 ? 's' : ''}</strong> matching your "{alertName}" alert:
          </Text>

          <Section style={jobsSection}>
            {jobs.map((job) => (
              <div key={job.id} style={jobCard}>
                <Link href={`https://baito.jobs/jobs/${job.slug}`} style={jobTitle}>
                  {job.title}
                </Link>
                <Text style={jobMeta}>
                  {job.organizationName}
                  {job.location && ` • ${job.location}`}
                  {job.jobType && ` • ${job.jobType}`}
                </Text>
              </div>
            ))}
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href={viewAllUrl}>
              View All Jobs
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You're receiving this because you have job alerts enabled.{' '}
            <Link href={unsubscribeUrl} style={link}>
              Manage your alerts
            </Link>{' '}
            or{' '}
            <Link href={unsubscribeUrl} style={link}>
              unsubscribe
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default JobAlertEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#10b981',
  padding: '17px 0 0',
  textAlign: 'center' as const,
}

const paragraph = {
  margin: '0 0 15px',
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4149',
  padding: '0 40px',
}

const jobsSection = {
  padding: '0 40px',
}

const jobCard = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
  border: '1px solid #e5e7eb',
}

const jobTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#10b981',
  textDecoration: 'none',
}

const jobMeta = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '4px 0 0',
}

const buttonSection = {
  padding: '27px 0 27px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
}

const link = {
  color: '#10b981',
}
