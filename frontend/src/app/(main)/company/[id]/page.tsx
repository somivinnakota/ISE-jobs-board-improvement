import { createClient } from "@/lib/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Globe, MapPin, Users, EuroIcon, House } from "lucide-react"

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: company, error } = await supabase
    .from("companies")
    .select("id, name, website, description, company_profiles ( avatar, culture_notes )")
    .eq("id", id)
    .single()

  if (error || !company) notFound()

  const companyData = company as {
    id: string
    name: string
    website: string
    description: string
    company_profiles: { avatar: string; culture_notes: string }[]
  }

  const { data: postings } = await supabase
    .from("job_postings")
    .select("id, job_title, location, residency, salary, position_count, accommodation_support, description")
    .eq("company_id", id)
    .eq("status", "approved")
    .order("residency")

  const profile = companyData.company_profiles?.[0]

  return (
    <div className="pt-28 px-8 pb-16 max-w-5xl mx-auto">
      <div className="flex items-start gap-6 mb-10">
        <div className="flex-shrink-0 w-20 h-20 bg-neutral-800 flex items-center justify-center overflow-hidden">
          {profile?.avatar ? (
            <img src={profile.avatar} alt={companyData.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-white">
              {companyData.name?.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-grow">
          <h1 className="text-4xl font-bold text-white mb-2">{companyData.name}</h1>
          {companyData.website && (
            <a
              href={companyData.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-neutral-400 hover:text-white text-sm font-mono mb-3"
            >
              <Globe size={14} /> {companyData.website}
            </a>
          )}
          {companyData.description && (
            <p className="text-neutral-300 text-sm leading-relaxed max-w-2xl">
              {companyData.description}
            </p>
          )}
        </div>
      </div>

      {profile?.culture_notes && (
        <div className="bg-black border border-neutral-800 p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-3 font-mono">About Working Here</h2>
          <p className="text-neutral-400 text-sm leading-relaxed">{profile.culture_notes}</p>
        </div>
      )}

      <div className="bg-black border border-neutral-800 p-6">
        <h2 className="text-xl font-bold text-white mb-6 font-mono">
          Open Residency Positions ({postings?.length ?? 0})
        </h2>
        {!postings || postings.length === 0 ? (
          <p className="text-neutral-500 text-center py-8">No open positions at this time.</p>
        ) : (
          <div className="space-y-4">
            {postings.map((job: any) => (
              <div key={job.id} className="border border-neutral-700 p-5 hover:border-neutral-500 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{job.job_title}</h3>
                  <span className="text-xs font-mono text-amber-400 border border-amber-700 px-2 py-0.5">
                    Residency {job.residency}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400 mb-3">
                  {job.location && (
                    <span className="flex items-center gap-1"><MapPin size={13} /> {job.location}</span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-1"><EuroIcon size={13} /> {job.salary.toLocaleString()}/mo</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users size={13} /> {job.position_count} position{job.position_count !== 1 ? "s" : ""}
                  </span>
                  {job.accommodation_support && (
                    <span className="flex items-center gap-1 text-green-400"><House size={13} /> Housing provided</span>
                  )}
                </div>
                {job.description && (
                  <p className="text-neutral-500 text-sm line-clamp-2">{job.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link href="/job-postings" className="text-neutral-400 hover:text-white text-sm font-mono">
          Back to all postings
        </Link>
      </div>
    </div>
  )
}
