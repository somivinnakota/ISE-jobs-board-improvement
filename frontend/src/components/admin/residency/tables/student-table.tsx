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
import Link from "next/link"

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

export default function StudentsTable({ students }: { students: StudentWithProfile[] }) {

  return (
    < Table >
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>QCA</TableHead>
          <TableHead>Ranking Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {students.map((s) => (
          <TableRow key={s.id}>
            <TableCell className="font-medium">
              <Link
                href={`/student/${s.id}`}
                className="hover:underline"
              >
                {s.name}
              </Link>
            </TableCell>
            <TableCell className="text-gray-600">{s.accepted_student_emails[0]?.email ?? "24xxxxx@studentmail.ul.ie"}</TableCell>
            <TableCell>{s.student_profile.qca}</TableCell>
            <TableCell>
              <Badge
                variant={s.year === 1 ? "default" : "secondary"}
              >
                {"Active"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}

        {students.length === 0 && (
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
