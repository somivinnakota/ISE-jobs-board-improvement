"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { InterviewWithStudent } from "@/app/api/utils"
import Image from "next/image"

const columns: ColumnDef<InterviewWithStudent>[] = [
  {
    header: "Student",
    accessorFn: row => row.student.name,
    cell: info => <span className="font-medium">{info.getValue<string>()}</span>,
  },
  {
    header: "Company",
    accessorKey: "job_posting.company",
    cell: ({ row }) => (
      <div className="flex flex-row items-center gap-x-2">
        <Image
          src={row.original.job_posting.company.company_profile.company_avatar ?? ""}
          alt="Company logo image"
          className="rounded-md"
          width={32}
          height={32}
        />
        {row.original.job_posting.company.company_name}
      </div>
    )
  },
  {
    header: "Posting",
    accessorFn: row => row.job_posting.job_title,
  },
  {
    header: "Interview ID",
    accessorKey: "id",
  },
]

export default function InterviewsTable({ data }: { data: InterviewWithStudent[] }) {
  return <DataTable columns={columns} data={data} />
}
