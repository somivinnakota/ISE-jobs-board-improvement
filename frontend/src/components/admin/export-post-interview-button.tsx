"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { createClient } from "@/lib/client"

export default function ExportPostInterviewButton() {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("post_interview_rankings")
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

      // Group by student
      const grouped: Record<string, any[]> = {}
      for (const row of data ?? []) {
        const email = row.profiles?.email ?? "Unknown"
        if (!grouped[email]) grouped[email] = []
        grouped[email].push(row)
      }

      // Build CSV
      const headers = [
        "Student Email", "Year", "Rank", "Job Title",
        "Company", "Residency", "Location", "Salary", "Submitted At",
      ]

      const csvLines: string[] = [headers.join(",")]

      for (const [email, rankings] of Object.entries(grouped)) {
        csvLines.push(`"--- ${email} ---","","","","","","","",""`)
        const sorted = rankings.sort((a, b) => a.rank - b.rank)
        for (const row of sorted) {
          csvLines.push([
            row.profiles?.email ?? "",
            row.profiles?.year ?? "",
            row.rank,
            row.job_postings?.job_title ?? "",
            row.job_postings?.companies?.name ?? "",
            row.job_postings?.residency ?? "",
            row.job_postings?.location ?? "",
            row.job_postings?.salary ?? "",
            new Date(row.updated_at).toLocaleDateString(),
          ].map((cell: any) => `"${cell}"`).join(","))
        }
        csvLines.push("")
      }

      const csv = csvLines.join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ise-post-interview-rankings-${new Date().toISOString().split("T")[0]}.csv`
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