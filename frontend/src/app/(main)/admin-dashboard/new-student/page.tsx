"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import LoadingSpinner from "@/components/loading-spinner";

export default function NewStudentsPage() {
  const router = useRouter();
  const [rawEmails, setRawEmails] = useState("");
  const [year, setYear] = useState("1");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{ email: string; status: string }[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Not authenticated");
        router.push("/auth/login");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResults([]);

    const listOfEmails = rawEmails
      .split(/[\n,]+/)
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

    if (listOfEmails.length === 0) {
      alert("Please enter at least one email.");
      setSubmitting(false);
      return;
    }

    const supabase = createClient();
    const resultLog: { email: string; status: string }[] = [];

    for (const email of listOfEmails) {
      // Check if a user with this email already exists in auth.users
      // We do this by checking the profiles table
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (existing) {
        // Update their role and year if they already exist
        await supabase
          .from("profiles")
          .update({ role: "student", year: Number(year) })
          .eq("email", email);
        resultLog.push({ email, status: "updated" });
      } else {
        // Insert a placeholder profile — they'll claim it when they sign up
        // We use a deterministic approach: insert with email, no id yet
        // When they sign up Supabase will create the auth user
        // For now we store them in a pending_students table
        const { error } = await supabase
          .from("pending_students")
          .insert({ email, year: Number(year) });

        if (error) {
          resultLog.push({ email, status: `failed: ${error.message}` });
        } else {
          resultLog.push({ email, status: "added to pending" });
        }
      }
    }

    setResults(resultLog);
    setSubmitting(false);
  };

  if (loading) {
    return <main className="pt-28 px-6 max-w-xl mx-auto"><LoadingSpinner /></main>;
  }

  return (
    <main className="pt-28 px-6 max-w-2xl mx-auto pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Add New Students</h1>
        <p className="text-neutral-400 text-sm font-mono">
          Students will be added as pending until they sign up with their email.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium text-white">Year Group</label>
          <select
            className="w-full p-3 bg-neutral-900 border border-neutral-700 text-white outline-none focus:border-white"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-white">
            Student Emails
          </label>
          <p className="text-neutral-500 text-xs mb-2">One per line or comma separated</p>
          <textarea
            rows={8}
            className="w-full p-3 bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 outline-none focus:border-white font-mono text-sm"
            placeholder="student1@studentmail.ul.ie&#10;student2@studentmail.ul.ie&#10;student3@studentmail.ul.ie"
            value={rawEmails}
            onChange={(e) => setRawEmails(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-white text-black py-3 font-semibold hover:bg-neutral-200 disabled:opacity-50"
          >
            {submitting ? "Adding students..." : "Add Students"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin-dashboard")}
            className="bg-neutral-800 text-white px-6 py-3 hover:bg-neutral-700 border border-neutral-600"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-8 bg-black border border-neutral-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4 font-mono">Results</h2>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm font-mono">
                <span className="text-neutral-300">{r.email}</span>
                <span className={
                  r.status === "updated" ? "text-blue-400" :
                  r.status === "added to pending" ? "text-green-400" :
                  "text-red-400"
                }>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push("/admin-dashboard")}
            className="mt-6 w-full bg-white text-black py-2 font-semibold hover:bg-neutral-200"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </main>
  );
}