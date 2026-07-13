'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { env } from '@/env';
import { createClient } from '@/lib/client';
import { Session } from '@supabase/supabase-js';
import { getUserIdClient, getCompanyIdFromUserIdClient } from '@/app/api/client-user';
import LoadingSpinner from '@/components/loading-spinner';

export default function NewJobPostingPage() {
  const router = useRouter();

  // Form state
  const [jobTitle, setJobTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [accommodationSupport, setAccommodationSupport] = useState(false);
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [location, setLocation] = useState('');
  const [positionCount, setPositionCount] = useState('');
  const [residency, setResidency] = useState('');

  // Auth / company context
  const [session, setSession] = useState<Session | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContext() {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error.message);
      } else {
        setSession(session);
      }

      const userId = await getUserIdClient();
      if (userId) {
        const cid = await getCompanyIdFromUserIdClient(userId);
        if (cid) {
          setCompanyId(cid);
        } else {
          console.error('No company ID found for user:', userId);
        }
      } else {
        console.error('No user ID found');
      }

      setLoading(false);
    }

    fetchContext();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      alert('You must be logged in.');
      return;
    }
    if (!companyId) {
      alert('Unable to determine company ID.');
      return;
    }

    try {
      const url = env.NEXT_PUBLIC_API_URL!;
      const token = session.access_token;

      const payload = {
        job_title: jobTitle,
        salary: Number(salary),
        accommodation_support: accommodationSupport,
        description,
        contact_email: contactEmail,
        location,
        position_count: Number(positionCount),
        residency,
      };

      const res = await fetch(`${url}/new-job-posting/${companyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('POST /new-job-posting status:', res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error('Failed to create job posting:', res.status, text);
        alert('Failed to create job posting');
        return;
      }

      alert('Job posting created successfully');
      router.push('/admin-dashboard');
    } catch (err) {
      console.error('Request failed:', err);
      alert('Request failed: ' + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <main className="pt-24 px-6 max-w-xl mx-auto">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="pt-24 px-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Job Posting</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Job Title</label>
          <input
            type="text"
            className="w-full p-2 border"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Residency Type</label>
          <input
            type="text"
            className="w-full p-2 border"
            value={residency}
            onChange={(e) => setResidency(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Salary</label>
          <input
            type="number"
            className="w-full p-2 border"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center">
          <input
            id="accommodationSupport"
            type="checkbox"
            className="mr-2"
            checked={accommodationSupport}
            onChange={(e) => setAccommodationSupport(e.target.checked)}
          />
          <label htmlFor="accommodationSupport" className="font-medium">
            Accommodation Support Provided
          </label>
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full p-2 border"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Contact Email</label>
          <input
            type="email"
            className="w-full p-2 border"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            className="w-full p-2 border"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Number of Positions</label>
          <input
            type="number"
            className="w-full p-2 border"
            value={positionCount}
            onChange={(e) => setPositionCount(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 hover:bg-green-700"
            disabled={!session || !companyId}
          >
            Submit
          </button>
          <button
            type="button"
            onClick={() => router.push('/rp-dashboard')}
            className="bg-gray-600 text-white px-4 py-2 hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
