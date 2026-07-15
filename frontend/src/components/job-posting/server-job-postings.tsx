import React from "react"
import ClientJobPostings from "@/components/job-posting/client-job-postings"
import { JobPosting } from "@/types/job-posting"
import { createClient } from "@/lib/server"

export default async function ServerJobPosting() {
  let jobPostings: JobPosting[] = []
  let error = null

  try {
    const supabase = await createClient()

    const { data, error: fetchError } = await supabase
      .from("job_postings")
      .select(`
        id,
        job_title,
        salary,
        accommodation_support,
        description,
        contact_email,
        location,
        position_count,
        residency,
        companies (
          id,
          name,
          company_profiles (
            avatar
          )
        )
      `)
      .eq("status", "approved")
      .order("id")

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    // Normalise Supabase shape to match JobPosting type
    jobPostings = (data ?? []).map((j: any) => ({
      id: j.id,
      job_title: j.job_title,
      salary: j.salary ?? 0,
      accommodation_support: j.accommodation_support ?? false,
      description: j.description ?? "",
      contact_email: j.contact_email ?? "",
      location: j.location ?? "",
      position_count: j.position_count ?? 1,
      residency: j.residency ?? "",
      isFavourited: false,
      company: {
        id: j.companies?.id ?? "",
        name: j.companies?.name ?? "",
        company_profile: {
          avatar: j.companies?.company_profiles?.[0]?.avatar ?? "",
        },
      },
    }))

    // Sort by company name
    jobPostings.sort((a, b) => a.company.name.localeCompare(b.company.name))

  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load job postings"
    console.error("Job postings fetch error:", error)
  }

  return (
    <div>
      <ClientJobPostings initialJobPostings={jobPostings} error={error} />
    </div>
  )
}