"use client"

import { useState } from "react"
import { Archive, Search } from "lucide-react"

interface Posting {
  id: string
  job_title: string
  residency: string
  companies: { name: string } | null
}

interface ArchiveTableProps {
  postings: Posting[]
  archiveAction: (formData: FormData) => Promise<void>
}

export default function ArchiveTable({ postings, archiveAction }: ArchiveTableProps) {
  const [search, setSearch] = useState("")

  const filtered = postings.filter(p =>
    p.job_title?.toLowerCase().includes(search.toLowerCase()) ||
    (p.companies as any)?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.residency?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-700 px-3 py-2 mb-6 w-full max-w-sm">
        <Search size={14} className="text-neutral-500" />
        <input
          type="text"
          placeholder="Search by title, company or residency..."
          className="bg-transparent text-white text-sm outline-none w-full placeholder-neutral-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-neutral-500 text-center py-4">
          {search ? `No postings matching "${search}"` : "No approved postings to archive."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-left">
                <th className="pb-3 pr-4">Job Title</th>
                <th className="pb-3 pr-4">Company</th>
                <th className="pb-3 pr-4">Residency</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((posting) => (
                <tr key={posting.id} className="border-b border-neutral-900 hover:bg-neutral-900/40">
                  <td className="py-2 pr-4 text-white">{posting.job_title}</td>
                  <td className="py-2 pr-4 text-neutral-400">{(posting.companies as any)?.name}</td>
                  <td className="py-2 pr-4 text-neutral-400">R{posting.residency}</td>
                  <td className="py-2">
                    <form action={archiveAction}>
                      <input type="hidden" name="id" value={posting.id} />
                      <button type="submit"
                        className="flex items-center gap-1 text-xs text-neutral-400 hover:text-amber-400 border border-neutral-700 hover:border-amber-700 px-2 py-1">
                        <Archive size={12} /> Archive
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-neutral-600 text-xs font-mono mt-3">
            Showing {filtered.length} of {postings.length} postings
          </p>
        </div>
      )}
    </div>
  )
}