import { JobPosting } from "@/types/job-posting";
import { JobCard } from "./job-card";

type JobPostingsProps = {
  jobPostings: JobPosting[]
  onToggleFavourite: (id: string) => void
}

export default function JobPostings({ jobPostings, onToggleFavourite }: JobPostingsProps) {
  if (jobPostings.length == 0) {
    return (
      <div className="w-full flex p-8 justify-center bg-white">
        no postings found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobPostings.map((job) => (
        <JobCard key={job.id} job={job} isFavourited={job.isFavourited} onToggleFavourite={onToggleFavourite} />
      ))}
    </div>
  )
}
