"use client"

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CompanyWithPostings } from "@/app/api/utils"

export interface StudentWithProfile {
  id: string
  name: string
  year: number
  student_profile: {
    id: string
    qca: string | null
    pronouns: string | null
    description: string | null
    avatar_url: string | null
    cv_url: string | null
    github_link: string | null
    linkedin_link: string | null
    personal_site_link: string | null
  }
  accepted_student_emails: [{
    email: string
  }]
}

export default function JobPostingTable({ postings }: { postings: CompanyWithPostings[] }) {

  return (
    < Table >
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Job Title</TableHead>
          <TableHead>Contact Email</TableHead>
          <TableHead>Positions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {postings.map((j) => (
          <TableRow key={j.id}>
            <TableCell className="font-medium">{j.name}</TableCell>
            <TableCell className="text-gray-600">{j.job_posting[0].job_title}</TableCell>
            <TableCell>{j.job_posting[0].contact_email}</TableCell>
            <TableCell>
              <Badge
              >
                {j.job_posting[0].position_count}
              </Badge>
            </TableCell>
          </TableRow>
        ))}

        {postings.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center">
              No students for this residency&nbsp;yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table >
  )
}
