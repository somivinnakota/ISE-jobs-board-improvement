import React from "react"
import ClientJobPostings from "@/components/job-posting/client-job-postings"
import { JobPosting } from "@/types/job-posting"
import { getJobPostings } from "@/app/api/utils"

export default async function ServerJobPosting() {
  let jobPostings: JobPosting[] = []
  let error = null

  try {
    jobPostings = await getJobPostings()
    jobPostings.sort((a, b) => a.company.name.localeCompare(b.company.name))
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load job postings'
  }

  return (
    <div>
      <ClientJobPostings initialJobPostings={jobPostings} error={error} />
    </div>
  )
}
