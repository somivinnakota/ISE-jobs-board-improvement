import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Building2, Clock, CheckCircle, XCircle, Eye, Bookmark } from "lucide-react";

export default async function RPDashboard() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  // Get company owned by this user
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, website, description")
    .eq("created_by", session.user.id)
    .single();

  if (companyError || !company) {
    return (
      <div className="flex w-full flex-col px-8 pt-20">
        <h1 className="text-3xl font-bold text-white mb-4">Residency Partner Dashboard</h1>
        <div className="bg-amber-900/30 border border-amber-600 text-amber-400 p-6 rounded">
          <p className="font-semibold mb-2">No company found for your account.</p>
          <p className="text-sm">Please contact an ISE administrator to set up your company profile.</p>
        </div>
      </div>
    );
  }
  // Get current cycle phase from ranking periods
const { data: rankingPeriods } = await supabase
  .from('ranking_periods')
  .select('residency, is_open')
  .order('residency');

const anyOpen = rankingPeriods?.some(p => p.is_open) ?? false;
const openResidencies = rankingPeriods?.filter(p => p.is_open).map(p => p.residency) ?? [];

// Determine current phase
const phases = [
  { label: "Submissions Open", done: true, active: false },
  { label: "Admin Review", done: true, active: false },
  {
    label: anyOpen
      ? `Ranking Live (R${openResidencies.join(', R')})`
      : "Ranking",
    done: false,
    active: anyOpen,
  },
  { label: "Interviews", done: false, active: false },
  { label: "Outcomes", done: false, active: false },
];

  // Get all job postings for this company
const { data: jobPostings } = await supabase
  .from("job_postings")
  .select("id, job_title, residency, position_count, salary, status, created_at, view_count")
  .eq("company_id", company.id)
  .order("created_at", { ascending: false });

  const postings = jobPostings ?? [];

  // Stats
  const approved = postings.filter(p => p.status === "approved").length;
  const pending = postings.filter(p => p.status === "pending").length;
  const rejected = postings.filter(p => p.status === "rejected").length;
  const archived = postings.filter(p => p.status === "archived").length;

  // Status badge helper
  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      approved: "bg-green-900/40 text-green-400 border border-green-700",
      pending:  "bg-amber-900/40 text-amber-400 border border-amber-700",
      rejected: "bg-red-900/40 text-red-400 border border-red-700",
      archived: "bg-gray-800 text-gray-400 border border-gray-600",
    };
    return styles[status] ?? "bg-gray-800 text-gray-400";
  }

  return (
    <div className="flex w-full flex-col px-8 pt-20 pb-16 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-1">Partner Dashboard</h1>
        <p className="text-neutral-400 font-mono">{company.name}</p>
      </div>

      {/* Stats row — NEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-black border border-neutral-800 p-5">
          <p className="text-xs text-neutral-500 font-mono uppercase mb-1">Approved</p>
          <p className="text-3xl font-bold text-green-400">{approved}</p>
        </div>
        <div className="bg-black border border-neutral-800 p-5">
          <p className="text-xs text-neutral-500 font-mono uppercase mb-1">Pending Review</p>
          <p className="text-3xl font-bold text-amber-400">{pending}</p>
        </div>
        <div className="bg-black border border-neutral-800 p-5">
          <p className="text-xs text-neutral-500 font-mono uppercase mb-1">Rejected</p>
          <p className="text-3xl font-bold text-red-400">{rejected}</p>
        </div>
        <div className="bg-black border border-neutral-800 p-5">
          <p className="text-xs text-neutral-500 font-mono uppercase mb-1">Archived</p>
          <p className="text-3xl font-bold text-gray-400">{archived}</p>
        </div>
      </div>

      {/* Cycle timeline — NEW */}
      <div className="bg-black border border-neutral-800 p-6 mb-10">
        <h2 className="text-lg font-bold text-white mb-4 font-mono">Residency Cycle — Current Phase</h2>
        <div className="flex flex-col lg:flex-row gap-2">
          {phases.map((phase, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`flex-1 p-3 text-center text-xs font-mono border ${
                phase.active
                  ? "bg-white text-black border-white font-bold"
                  : phase.done
                  ? "bg-neutral-900 text-green-400 border-green-800"
                  : "bg-neutral-900 text-neutral-600 border-neutral-800"
              }`}>
                {phase.done && !phase.active && <span className="mr-1">✓</span>}
                {phase.label}
              </div>
              {i < 4 && <span className="text-neutral-600 hidden lg:block">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Action panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-black border border-neutral-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Company Profile</h2>
          <p className="text-neutral-400 text-sm mb-4">
            {company.description ?? "No description set yet."}
          </p>
          <Link
            href={`/company/${company.id}`}
            className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-neutral-200"
          >
            <Building2 size={16} /> View Profile
          </Link>
        </div>

        <div className="bg-black border border-neutral-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Job Postings</h2>
          <p className="text-neutral-400 text-sm mb-4">
            Create a new posting or repost one from a previous cycle.
          </p>
          <div className="flex gap-3">
            <Link
              href="/rp-dashboard/new-job-posting"
              className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-neutral-200"
            >
              <PlusCircle size={16} /> New Posting
            </Link>
          </div>
        </div>
      </div>

      {/* Job postings table */}
      <div className="bg-black border border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white font-mono">All Postings</h2>
          <Link
            href="/rp-dashboard/new-job-posting"
            className="inline-flex items-center gap-2 bg-white text-black px-3 py-1.5 text-sm font-semibold hover:bg-neutral-200"
          >
            <PlusCircle size={14} /> Create New
          </Link>
        </div>

        {postings.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <p className="mb-2">No job postings yet.</p>
            <Link href="/rp-dashboard/new-job-posting" className="text-white underline text-sm">
              Create your first posting →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 text-left">
                  <th className="pb-3 pr-4">Job Title</th>
                  <th className="pb-3 pr-4">Residency</th>
                  <th className="pb-3 pr-4">Positions</th>
                  <th className="pb-3 pr-4">Salary</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Views</th>
                  <th className="pb-3 pr-4">Submitted</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {postings.map(posting => (
                  <tr key={posting.id} className="border-b border-neutral-900 hover:bg-neutral-900/40">
                    <td className="py-3 pr-4 text-white font-semibold">{posting.job_title}</td>
                    <td className="py-3 pr-4 text-neutral-400">R{posting.residency}</td>
                    <td className="py-3 pr-4 text-neutral-400">{posting.position_count}</td>
                    <td className="py-3 pr-4 text-neutral-400">€{posting.salary?.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 text-xs rounded ${statusBadge(posting.status)}`}>
                        {posting.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-neutral-400">
                    <span className="flex items-center gap-1">
                    <Eye size={13} /> {(posting as any).view_count ?? 0}
                  </span>
                  </td>
                 <td className="py-3 pr-4 text-neutral-500">
                   {new Date(posting.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/rp-dashboard/new-job-posting?duplicate=${posting.id}`}
                        className="text-xs text-neutral-400 hover:text-white underline"
                      >
                        Repost
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}