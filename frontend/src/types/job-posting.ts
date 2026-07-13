export interface JobPosting {
	id: string;
	job_title: string;
	salary: number;
	accommodation_support: bool;
	description: string;
	contact_email: string;
	location: string;
	position_count: number;
	residency: string;
	company: {
		id: string;
		name: string;
		company_profile: {
			avatar: string;
		};
	};
	isFavourited: boolean;
}
