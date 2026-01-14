import type {
  ExperienceLevel,
  JobBranch,
  JobStatus,
  JobType,
  PackageType,
  RemoteType,
} from "../constants/categories";
import type { JobSource } from "../constants/sources";

export interface Job {
  id: string;
  organizationId: string;
  title: string;
  slug: string;
  description: string;
  externalId: string | null;
  source: JobSource;
  sourceFeed: string | null;
  contentHash: string;
  status: JobStatus;
  jobType: JobType | null;
  jobBranch: JobBranch | null;
  remoteType: RemoteType | null;
  experienceLevel: ExperienceLevel | null;
  packageType: PackageType | null;
  boostCount: number;
  boostedAt: Date | null;
  expiresAt: Date | null;
  embedding: number[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobLocation {
  id: string;
  jobId: string;
  city: string | null;
  state: string | null;
  country: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface CreateJobInput {
  organizationId: string;
  title: string;
  description: string;
  externalId?: string | null;
  source: JobSource;
  sourceFeed?: string | null;
  jobType?: JobType | null;
  jobBranch?: JobBranch | null;
  remoteType?: RemoteType | null;
  experienceLevel?: ExperienceLevel | null;
  packageType?: PackageType | null;
  expiresAt?: Date | null;
  locations?: Omit<JobLocation, "id" | "jobId">[];
}

export interface UpdateJobInput {
  title?: string;
  description?: string;
  status?: JobStatus;
  jobType?: JobType | null;
  jobBranch?: JobBranch | null;
  remoteType?: RemoteType | null;
  experienceLevel?: ExperienceLevel | null;
  boostCount?: number;
  boostedAt?: Date | null;
  expiresAt?: Date | null;
}
