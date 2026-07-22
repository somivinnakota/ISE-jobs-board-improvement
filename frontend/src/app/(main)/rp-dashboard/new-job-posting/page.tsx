'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/client';
import { Session } from '@supabase/supabase-js';
import LoadingSpinner from '@/components/loading-spinner';

export default function NewJobPostingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateId = searchParams.get('duplicate');

  // Form state
  const [jobTitle, setJobTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [accommodationSupport, setAccommodationSupport] = useState(false);
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [location, setLocation] = useState('');
  const [positionCount, setPositionCount] = useState('');
  const [residency, setResidency] = useState('1');
  const [isDraft, setIsDraft] = useState(false);

  // Auth / company context
  const [session, setSession] = useState<Session | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRepost, setIsRepost] = useState(false);

  useEffect(() => {
    async function fetchContext() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      setSession(session);

      // Get company for this user
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('created_by', session.user.id)
        .single();

      if (company) setCompanyId(company.id);

      // If duplicating a previous posting, pre-fill the form
      if (duplicateId) {
        const { data: existing } = await supabase
          .from('job_postings')
          .select('*')
          .eq('id', duplicateId)
          .single();

        if (existing) {
          setJobTitle(existing.job_title ?? '');
          setSalary(existing.salary?.toString() ?? '');
          setAccommodationSupport(existing.accommodation_support ?? false);
          setDescription(existing.description ?? '');
          setContactEmail(existing.contact_email ?? '');
          setLocation(existing.location ?? '');
          setPositionCount(existing.position_count?.toString() ?? '');
          setResidency(existing.residency ?? '1');
          setIsRepost(true);
        }
      }

      setLoading(false);
    }

    fetchContext();
  }, [duplicateId]);

  async function handleSubmit(e: React.FormEvent, asDraft = false) {
    e.preventDefault();
    if (!session || !companyId) {
      alert('You must be logged in with a company account.');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();

      const { error } = await supabase.from('job_postings').insert({
        company_id: companyId,
        job_title: jobTitle,
        salary: salary ? Number(salary) : null,
        accommodation_support: accommodationSupport,
        description,
        contact_email: contactEmail,
        location,
        position_count: Number(positionCount),
        residency,
        status: asDraft ? 'draft' : 'pending',
      });

      if (error) throw error;

      alert(asDraft
        ? 'Draft saved! You can submit it later from your dashboard.'
        : 'Job posting submitted for admin approval!'
      );
      router.push('/rp-dashboard');
    } catch (err) {
      console.error('Failed to create posting:', err);
      alert('Failed to create job posting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <main className="pt-28 px-6 max-w-xl mx-auto"><LoadingSpinner /></main>;
  }

  if (!companyId) {
    return (
      <main className="pt-28 px-6 max-w-xl mx-auto">
        <div className="bg-amber-900/30 border border-amber-600 text-amber-400 p-6">
          <p className="font-semibold">No company found for your account.</p>
          <p className="text-sm mt-1">Please contact an ISE administrator.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 px-6 max-w-xl mx-auto pb-16">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">
          {isRepost ? 'Repost Job Listing' : 'New Job Posting'}
        </h1>
        {isRepost && (
          <p className="text-amber-400 text-sm font-mono">
            Pre-filled from a previous posting — update as needed before submitting.
          </p>
        )}
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-5">

        <div>
          <label className="block mb-1 font-medium text-white">Job Title</label>
          <input
            type="text"
            className="w-full p-3 bg-neutral-900 border border-neutral-700 text-white focus:border-white outline-none"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Software Engineer Intern"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-white">Residency</label>
          <select
            className="w-full p-3 bg-neutral-900 border border-neutral-700 text-white focus:border-white outline-none"
            value={residency}
            onChange={(e) => setResidency(e.target.value)}
            required
          >
            <option value="1">Residency 1</option>
            <option value="2">Residency 2</option>
            <option value="1+2">Residency 1+2</option>
            <option value="3">Residency 3</option>
            <option value="4">Residency 4</option>
            <option value="5">Residency 5</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-white">Monthly Salary (€)</label>
          <input
            type="number"
            className="w-full p-3 bg-neutral-900 border border-neutral-700 text-white focus:border-white outline-none"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="e.g. 2000"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-white">Location</label>
          <input
            type="text"
            className="w-full p-3 bg-neutral-900 border border-neutral-700 text-white focus:border-white outline-none"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Dublin"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-white">Number of Positions</label>
          <input
            type="number"
            className="w-full p-3 bg-neutral-900 border border-neutral-700 text-white focus:border-white outline-none"
            value={positionCount}
            onChange={(e) => setPositionCount(e.target.value)}
            placeholder="e.g. 2"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-white">Description</label>
          <textarea
            className="w-full p-3 bg-neutral-900 border border-neutral-700 text-white focus:border-white outline-none"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the role, responsibilities, and requirements..."
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-white">Contact Email</label>
          <input
            type="email"
            className="w-full p-3 bg-neutral-900 border border-neutral-700 text-white focus:border-white outline-none"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="talent@company.com"
          />
        </div>

        <div className="flex items-center gap-3 p-3 bg-neutral-900 border border-neutral-700">
          <input
            id="accommodationSupport"
            type="checkbox"
            className="w-4 h-4"
            checked={accommodationSupport}
            onChange={(e) => setAccommodationSupport(e.target.checked)}
          />
          <label htmlFor="accommodationSupport" className="font-medium text-white">
            Accommodation support provided
          </label>
        </div>

        <div className="bg-neutral-900 border border-neutral-700 p-4 text-sm text-neutral-400">
          <p>⚠️ Submitted postings go to <span className="text-white">pending review</span> before appearing on the jobs board. You'll be notified once approved.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-white text-black py-3 font-semibold hover:bg-neutral-200 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e as any, true)}
            className="flex-1 bg-neutral-800 text-white py-3 font-semibold hover:bg-neutral-700 disabled:opacity-50 border border-neutral-600"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => router.push('/rp-dashboard')}
            className="bg-neutral-900 text-neutral-400 px-6 py-3 hover:text-white border border-neutral-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}