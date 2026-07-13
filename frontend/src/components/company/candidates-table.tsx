"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import Image from "next/image";

interface Candidate {
  student_id: string;
  student_name: string;
  email: string;
  job_posting_id: string;
  job_title: string;
  avatar_url: string | null;
}

interface CandidatesTableProps {
  companyId: string;
}

export function CandidatesTable({ companyId }: CandidatesTableProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        const url = process.env.NEXT_PUBLIC_API_URL;

        const response = await fetch(`${url}/company/${companyId}/candidates`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch candidates: ${response.status}`);
        }

        const data: Candidate[] = await response.json();
        setCandidates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch candidates");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span>Loading Table...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-400">
        Error loading candidates: {error}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        No interview candidates found for this company's job postings.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="text-left p-3 font-semibold"></th>
            <th className="text-left p-3 font-semibold">Student Name</th>
            <th className="text-left p-3 font-semibold">Email</th>
            <th className="text-left p-3 font-semibold">Job Position</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr
              key={`${candidate.student_id}-${candidate.job_posting_id}`}
              className="border-b border-gray-700 transition-colors"
            >
              <td className="p-3">
                <Image src={candidate.avatar_url ?? ""} alt="user image" width={32} height={32} className="rounded-full" />
              </td>
              <td className="p-3">{candidate.student_name}</td>
              <td className="p-3">{candidate.email}</td>
              <td className="p-3">{candidate.job_title}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-sm text-gray-400">
        Total candidates: {candidates.length}
      </div>
    </div>
  );
}
