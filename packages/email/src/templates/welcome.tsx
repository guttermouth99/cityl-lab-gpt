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
} from "@react-email/components";

interface WelcomeEmailProps {
  userName: string;
  verificationUrl?: string;
}

export function WelcomeEmail({
  userName = "there",
  verificationUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Baito Jobs - find your next impact career</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>🌱 Welcome to Baito!</Heading>

          <Text style={paragraph}>Hi {userName},</Text>

          <Text style={paragraph}>
            Welcome to Baito Jobs! We're excited to have you join our community
            of purpose-driven professionals looking to make a positive impact.
          </Text>

          {verificationUrl && (
            <Section style={buttonSection}>
              <Button href={verificationUrl} style={button}>
                Verify Your Email
              </Button>
            </Section>
          )}

          <Text style={paragraph}>Here's what you can do next:</Text>

          <ul style={list}>
            <li style={listItem}>
              <strong>Browse jobs</strong> - Explore our curated selection of
              impact-focused positions
            </li>
            <li style={listItem}>
              <strong>Set up job alerts</strong> - Get notified when jobs
              matching your criteria are posted
            </li>
            <li style={listItem}>
              <strong>Complete your profile</strong> - Help organizations find
              you
            </li>
          </ul>

          <Section style={buttonSection}>
            <Button href="https://baito.jobs/jobs" style={secondaryButton}>
              Explore Jobs
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Questions? Reply to this email or visit our{" "}
            <Link href="https://baito.jobs/help" style={link}>
              help center
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const heading = {
  fontSize: "28px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#10b981",
  padding: "17px 0 0",
  textAlign: "center" as const,
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
  padding: "0 40px",
};

const list = {
  padding: "0 40px 0 60px",
  margin: "0 0 15px",
};

const listItem = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#3c4149",
  marginBottom: "8px",
};

const buttonSection = {
  padding: "20px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#10b981",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const secondaryButton = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  color: "#374151",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 40px",
};

const link = {
  color: "#10b981",
};
