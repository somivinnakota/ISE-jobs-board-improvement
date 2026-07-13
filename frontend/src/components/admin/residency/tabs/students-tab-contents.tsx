import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CompanyWithPostings, StudentWithProfile } from "@/app/api/utils"
import { runResidencyMatch, runInterviewMatch } from "@/app/api/utils"
import { ActionButtons } from "@/app/(main)/admin-dashboard/residency/[slug]/action-button"
import StudentsTable from "../tables/student-table"
import JobPostingTable from "../tables/job-posting-table"

export async function StudentsTabContents({
  students,
  postings,
  year,
  residency
}: {
  students: StudentWithProfile[],
  postings: CompanyWithPostings[],
  year: string,
  residency: string
}) {

  async function handleResidencyMatch() {
    "use server"
    await runResidencyMatch(year, residency)
  }

  async function handleInterviewMatch() {
    "use server"
    await runInterviewMatch(year, residency)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Students</CardTitle>
          <ActionButtons
            onResidencyMatch={handleResidencyMatch}
            onInterviewMatch={handleInterviewMatch}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <StudentsTable students={students} />
        </div>
      </CardContent>

      <CardHeader>
        <CardTitle className="text-2xl">Job Postings </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <JobPostingTable postings={postings} />
        </div>
      </CardContent>
    </Card>
  )
}
