import { z } from 'zod';

export const StudentSchema = z.object({
	id: z.string(),
	name: z.string(),
	year: z.string(),
	student_profile_id: z.string(),
});

export const StudentProfileSchema = z.object({
	id: z.string(),
	qca: z.string(),
	pronouns: z.string(),
	description: z.string(),
	avatar_url: z.string(),
	cv_url: z.string(),
	github_link: z.string(),
	linkedin_link: z.string(),
	personal_site_link: z.string(),
});

export const StudentJoinedProfileSchema = z.object({
	...StudentSchema.shape,
	student_profile: StudentProfileSchema
});

export type Student = z.infer<typeof StudentSchema>;
export type StudentProfile = z.infer<typeof StudentProfileSchema>;
export type StudentJoinedWithProfile = z.infer<typeof StudentJoinedProfileSchema>;
