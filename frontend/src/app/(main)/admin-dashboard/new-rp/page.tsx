'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { env } from '@/env';
import { createClient } from '@/lib/client';
import { Session } from '@supabase/supabase-js';

export default function NewResidencyPartnerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); 
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error.message);
      } else {
        setSession(session); // session: Session | null
      }
      setLoading(false);
    }

    fetchSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with name:", name, "and email:", email);

    if (!session) {
      alert('You must be logged in to perform this action');
      return;
    }

    try {
      const url = env.NEXT_PUBLIC_API_URL!;
      const token = session.access_token;

      const createCompanyRes = await fetch(`${url}/company`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      console.log("createCompanyRes status:", createCompanyRes.status);

      if (!createCompanyRes.ok) {
        const text = await createCompanyRes.text();
        console.error(
          "Failed to create company. Status:",
          createCompanyRes.status,
          "Body:",
          text
        );
        alert('Failed to create company');
        return;
      }

      const createdCompany = (await createCompanyRes.json()) as {
        id: string;
        name: string;
        company_profile: string;
      };
      console.log("Created company:", createdCompany);

      const companyId = createdCompany.id;
      if (!companyId) {
        console.error("No `id` found in createCompany response:", createdCompany);
        alert('Unexpected error: no company ID returned.');
        return;
      }

      const addEmailRes = await fetch(`${url}/company/new-email/${companyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          company: companyId,
          email: email
        })
      });
      console.log("addEmailRes status:", addEmailRes.status);

      if (!addEmailRes.ok) {
        const text = await addEmailRes.text();
        console.error(
          "Failed to insert accepted_company_email. Status:",
          addEmailRes.status,
          "Body:",
          text
        );
        alert('Company was created, but failed to register email.');
        return;
      }

      // Optionally parse the response (the new email‐row JSON) if you want to log it:
      const createdEmailRow = await addEmailRes.json();
      console.log("Inserted into accepted_company_emails:", createdEmailRow);

      alert('Successfully added new Residency Partner and registered email');
      router.push('/admin-dashboard');

    } catch (err) {
      console.error("Request failed:", err);
      alert('Request failed: ' + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <main className="pt-24 px-6 max-w-xl mx-auto">
        <div>Loading...</div>
      </main>
    );
  }

  return (
    <main className="pt-24 px-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Residency Partner</h1>

      {/* Notice: we now have two fields — “Company Name” and “Email” */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Company Name</label>
          <input
            type="text"
            className="w-full p-2 border"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Contact Email</label>
          <input
            type="email"
            className="w-full p-2 border"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 hover:bg-green-700"
            disabled={!session} // disable until we know we have a session
          >
            Submit
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin-dashboard')}
            className="bg-gray-600 text-white px-4 py-2 hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
