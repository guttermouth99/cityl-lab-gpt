export interface Organization {
  id: string;
  name: string;
  slug: string;
  url: string | null;
  domain: string | null;
  isImpact: boolean;
  isBlacklisted: boolean;
  careerPageUrl: string | null;
  embedding: number[] | null;
  contentHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationInput {
  name: string;
  url?: string | null;
  domain?: string | null;
  isImpact?: boolean;
  careerPageUrl?: string | null;
}

export interface UpdateOrganizationInput {
  name?: string;
  url?: string | null;
  domain?: string | null;
  isImpact?: boolean;
  isBlacklisted?: boolean;
  careerPageUrl?: string | null;
  contentHash?: string | null;
}
