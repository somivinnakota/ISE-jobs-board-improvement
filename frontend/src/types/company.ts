import { z } from 'zod';

export const CompanySchema = z.object({
    id: z.string(),
    name: z.string(),
    company_profile_id: z.string(),
});

export const CompanyProfileSchema = z.object({
    id: z.string(),
    subtitle: z.string(),
    description: z.string(),
    avatar: z.string(),
    banner_image: z.string(),
});

export const CompanyJoinedProfileSchema = z.object({
    ...CompanySchema.shape,
    company_profile: CompanyProfileSchema
});

export type Company = z.infer<typeof CompanySchema>;
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
export type CompanyJoinedWithProfile = z.infer<typeof CompanyJoinedProfileSchema>;
