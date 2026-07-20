import AnimatedHeroText from "@/components/animated-hero";
import { FloatingLink } from "@/components/home/floating-link";
import { LayoutDashboard, UserPlus, GitCompare, CheckCircle, XCircle } from "lucide-react";
import UpcomingDeadlines from "@/components/admin/upcoming-deadlines";
import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

async function approvePosting(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const supabase = await createClient();
  await supabase.from('job_postings').update({ status: 'approved' }).eq('id', id);
  revalidatePath('/admin-dashboard');
}

async function rejectPosting(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const reason = formData.get('reason') as string;
  const supabase = await createClient();
  await supabase.from('job_postings')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', id);
  revalidatePath('/admin-dashboard');
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch pending postings
  const { data: pendingPostings } = await supabase
    .from('job_postings')
    .select(`
      id, job_title, location, residency, salary, 
      position_count, description, contact_email,
      accommodation_support, created_at,
      companies ( name )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  // Fetch stats
  const { data: allPostings } = await supabase
    .from('job_postings')
    .select('status');

  const stats = {
    pending: allPostings?.filter(p => p.status === 'pending').length ?? 0,
    approved: allPostings?.filter(p => p.status === 'approved').length ?? 0,
    rejected: allPostings?.filter(p => p.status === 'rejected').length ?? 0,
    total: allPostings?.length ?? 0,
  };

  return (
    <div className="flex w-full flex-col px-8 pt-20 pb-16 max-w-7xl mx-auto">
      <AnimatedHeroText text="Admin Dashboard" emphasis={[0, 1, 2, 3, 4]} />
      <h2 className="w-3/4 mt-3 font-mono text-gray-800 lg:pt-0 dark:text-neutral-300">
        Welcome to the Immersive Software Engineering Admin Portal
      </h2>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 mb-10">
        <div className="bg-black border border-neutral-800 p-5">
          <p className="text-xs text-neutral-500 font-mono uppercase mb-1">Total Postings</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-black border border-amber-800 p-5">
          <p className="text-xs text-amber-500 font-mono uppercase mb-1">Pending Review</p>
          <p className="text-3xl font-bold text-amber-400">{stats.pending}</p>
        </div>
        <div className="bg-black border border-green-800 p-5">
          <p className="text-xs text-green-500 font-mono uppercase mb-1">Approved</p>
          <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
        </div>
        <div className="bg-black border border-red-800 p-5">
          <p className="text-xs text-red-500 font-mono uppercase mb-1">Rejected</p>
          <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Approval queue — NEW */}
      <div className="bg-black border border-amber-800 p-6 mb-10">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-white">Pending Approvals</h2>
          {stats.pending > 0 && (
            <span className="bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-full">
              {stats.pending}
            </span>
          )}
        </div>

        {!pendingPostings || pendingPostings.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <CheckCircle size={32} className="mx-auto mb-2 text-green-600" />
            <p>No postings awaiting review — all clear!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingPostings.map((posting: any) => (
              <div key={posting.id} className="border border-neutral-700 p-5 bg-neutral-900">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white">{posting.job_title}</h3>
                      <span className="text-xs font-mono text-amber-400 border border-amber-700 px-2 py-0.5">
                        R{posting.residency}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-sm mb-3">
                      {posting.companies?.name} · {posting.location} · €{posting.salary?.toLocaleString()}/mo · {posting.position_count} position{posting.position_count !== 1 ? 's' : ''}
                      {posting.accommodation_support && ' · Housing provided'}
                    </p>
                    {posting.description && (
                      <p className="text-neutral-500 text-sm mb-3 line-clamp-3">
                        {posting.description}
                      </p>
                    )}
                    <p className="text-xs text-neutral-600 font-mono">
                      Submitted {new Date(posting.created_at).toLocaleDateString()} 
                      {posting.contact_email && ` · ${posting.contact_email}`}
                    </p>
                  </div>

                  {/* Approve / Reject actions */}
                  <div className="flex flex-col gap-3 min-w-48">
                    {/* Approve */}
                    <form action={approvePosting}>
                      <input type="hidden" name="id" value={posting.id} />
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 text-sm font-semibold"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                    </form>

                    {/* Reject with reason */}
                    <form action={rejectPosting} className="flex flex-col gap-2">
                      <input type="hidden" name="id" value={posting.id} />
                      <input
                        type="text"
                        name="reason"
                        placeholder="Reason for rejection..."
                        className="w-full p-2 text-sm bg-neutral-800 border border-neutral-600 text-white placeholder-neutral-500 outline-none focus:border-red-500"
                      />
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-red-900 hover:bg-red-800 text-white px-4 py-2 text-sm font-semibold"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Existing panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="flex flex-col justify-between w-full bg-black p-6 text-white shadow border border-neutral-800">
          <h2 className="pb-3 text-3xl">Residencies</h2>
          <p className="text-neutral-300">Manage residency partners, reminders, and dashboards.</p>
          <div className="flex flex-wrap gap-3 pt-4">
            <FloatingLink href="/admin-dashboard/new-rp">
              <UserPlus size={18} /> Onboard New RP
            </FloatingLink>
            <FloatingLink href="/admin-dashboard/rp-dashboard">
              <LayoutDashboard size={18} /> RP Dashboard
            </FloatingLink>
          </div>
        </div>
        <div className="flex flex-col justify-between w-full bg-black p-6 text-white shadow border border-neutral-800">
          <h2 className="pb-3 text-3xl">Students</h2>
          <p className="text-neutral-300">Manage student profiles, dashboards, and reminders.</p>
          <div className="flex flex-wrap gap-3 pt-4">
            <FloatingLink href="/admin-dashboard/new-student">
              <UserPlus size={18} /> Add New Students
            </FloatingLink>
            <FloatingLink href="/students-dashboard">
              <LayoutDashboard size={18} /> Students Dashboard
            </FloatingLink>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between w-full mb-10 bg-black p-6 text-white shadow border border-neutral-800">
        <h2 className="pb-3 text-3xl">Manage Residency</h2>
        <p className="text-neutral-300">Manage the progress of each residency.</p>
        <div className="flex flex-wrap gap-3 pt-4">
          {[1,2,3,4,5].map(n => (
            <FloatingLink key={n} href={`/admin-dashboard/residency/${n}`}>
              <GitCompare size={18} /> Residency {n}
            </FloatingLink>
          ))}
        </div>
      </div>

      <div className="w-full">
        <UpcomingDeadlines />
      </div>
    </div>
  );
}