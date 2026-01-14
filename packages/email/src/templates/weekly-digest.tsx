import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface WeeklyDigestEmailProps {
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
  unsubscribeUrl: string
}

export function WeeklyDigestEmail({
  userName = 'there',
  totalNewJobs = 0,
  topJobs = [],
  topCategories = [],
  unsubscribeUrl = '#',
}: WeeklyDigestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your weekly impact job digest - {totalNewJobs} new jobs</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>🌱 Weekly Job Digest</Heading>
          
          <Text style={paragraph}>Hi {userName},</Text>
          
          <Text style={paragraph}>
            Here's your weekly roundup of impact jobs. This week we added{' '}
            <strong>{totalNewJobs} new positions</strong> across various organizations.
          </Text>

          {topJobs.length > 0 && (
            <>
              <Heading as="h2" style={subheading}>
                Top Jobs This Week
              </Heading>
              <Section style={jobsSection}>
                {topJobs.map((job) => (
                  <div key={job.id} style={jobCard}>
                    <Link href={`https://baito.jobs/jobs/${job.slug}`} style={jobTitle}>
                      {job.title}
                    </Link>
                    <Text style={jobMeta}>
                      {job.organizationName}
                      {job.location && ` • ${job.location}`}
                    </Text>
                  </div>
                ))}
              </Section>
            </>
          )}

          {topCategories.length > 0 && (
            <>
              <Heading as="h2" style={subheading}>
                Trending Categories
              </Heading>
              <Section style={categoriesSection}>
                {topCategories.map((category) => (
                  <Text key={category.name} style={categoryItem}>
                    {category.name}: {category.count} jobs
                  </Text>
                ))}
              </Section>
            </>
          )}

          <Section style={buttonSection}>
            <Button style={button} href="https://baito.jobs/jobs">
              Explore All Jobs
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            You're receiving this weekly digest.{' '}
            <Link href={unsubscribeUrl} style={link}>
              Manage your email preferences
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WeeklyDigestEmail

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

const subheading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  padding: '0 40px',
  marginTop: '24px',
  marginBottom: '12px',
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

const categoriesSection = {
  padding: '0 40px',
}

const categoryItem = {
  fontSize: '14px',
  color: '#4b5563',
  margin: '4px 0',
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
