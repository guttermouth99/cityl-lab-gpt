DROP TABLE "organization" CASCADE;--> statement-breakpoint
DROP TABLE "job_location" CASCADE;--> statement-breakpoint
DROP TABLE "job" CASCADE;--> statement-breakpoint
DROP TABLE "alert" CASCADE;--> statement-breakpoint
DROP TABLE "sent_job" CASCADE;--> statement-breakpoint
DROP TABLE "customer" CASCADE;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "alert_frequency";--> statement-breakpoint
DROP TYPE "public"."alert_frequency";--> statement-breakpoint
DROP TYPE "public"."experience_level";--> statement-breakpoint
DROP TYPE "public"."job_branch";--> statement-breakpoint
DROP TYPE "public"."job_source";--> statement-breakpoint
DROP TYPE "public"."job_status";--> statement-breakpoint
DROP TYPE "public"."job_type";--> statement-breakpoint
DROP TYPE "public"."package_type";--> statement-breakpoint
DROP TYPE "public"."remote_type";--> statement-breakpoint
DROP TYPE "public"."customer_plan";--> statement-breakpoint
DROP TYPE "public"."customer_status";