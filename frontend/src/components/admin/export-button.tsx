"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { createClient } from "@/lib/client"

export default function ExportButton() {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("pre_interview_rankings")
        .select(`
          rank,
          is_draft,
          updated_at,
          profiles ( email, year ),
          job_postings (
            job_title,
            residency,
            location,
            salary,
            companies ( name )
          )
        `)
        .eq("is_draft", false)
        .order("rank", { ascending: true })

      if (error) throw error

      // Build CSV
      const headers = [
        "Student Email",
        "Year",
        "Rank",
        "Job Title",
        "Company",
        "Residency",
        "Location",
        "Salary",
        "Submitted At",
      ]

      const rows = (data ?? []).map((row: any) => [
        row.profiles?.email ?? "",
        row.profiles?.year ?? "",
        row.rank,
        row.job_postings?.job_title ?? "",
        row.job_postings?.companies?.name ?? "",
        row.job_postings?.residency ?? "",
        row.job_postings?.location ?? "",
        row.job_postings?.salary ?? "",
        new Date(row.updated_at).toLocaleDateString(),
      ])

      const csv = [
        headers.join(","),
        ...rows.map(row => row.map((cell: any) => `"${cell}"`).join(","))
      ].join("\n")

      // Download
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ise-rankings-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

    } catch (err) {
      console.error("Export failed:", err)
      alert("Export failed. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-neutral-200 disabled:opacity-50"
    >
      <Download size={16} />
      {exporting ? "Exporting..." : "Export CSV"}
    </button>
  )
}