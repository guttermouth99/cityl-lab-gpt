import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;

if (apiKey) {
  sgMail.setApiKey(apiKey);
}

export const sendgridClient = sgMail;

export const EMAIL_FROM = {
  email: process.env.EMAIL_FROM || "noreply@baito.jobs",
  name: process.env.EMAIL_FROM_NAME || "Baito Jobs",
};

export const UNSUBSCRIBE_URL =
  process.env.UNSUBSCRIBE_URL || "https://baito.jobs/unsubscribe";
