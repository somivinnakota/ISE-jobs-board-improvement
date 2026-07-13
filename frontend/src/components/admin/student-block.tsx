
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { LoaderCircle } from "lucide-react"

type Stu = {
  id: string
  name: string
  qca: string | null
  interviews?: number   // ⟵ optional, show whatever you like
}

export function StudentBlock({
  students,
  busy,
  onRun,
  actionLabel,
  error,
}: {
  students: Stu[] | null
  busy: boolean
  onRun: () => void
  actionLabel: string
  error: string | null
}) {
  /* ─── table column definitions ─── */
  const columns: ColumnDef<Stu>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      header: "QCA",
      accessorKey: "qca",
    },
    {
      header: "Interviews",
      accessorKey: "interviews",
      cell: ({ row }) => row.original.interviews ?? "—",
    },
  ]

  /* ─── state handling ─── */
  if (error) return <p className="text-red-500">⚠️ {error}</p>
  if (!students)
    return (
      <p className="flex items-center gap-2 text-sm text-gray-500">
        <LoaderCircle className="animate-spin" size={16} /> Loading students…
      </p>
    )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button disabled={busy} onClick={onRun}>
          {busy ? (
            <LoaderCircle className="mr-2 animate-spin" size={16} />
          ) : null}
          {actionLabel}
        </Button>
      </div>

      <DataTable columns={columns} data={students} />
    </div>
  )
}
