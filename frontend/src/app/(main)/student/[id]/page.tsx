import { createClient } from "@/lib/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, GraduationCap, User } from "lucide-react";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, role, year")
    .eq("id", id)
    .single();

  if (error || !profile) notFound();

  return (
    <div className="pt-28 px-8 pb-16 max-w-2xl mx-auto">
      <div className="bg-black border border-neutral-800 p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-neutral-800 flex items-center justify-center">
            <User size={32} className="text-neutral-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Student Profile</h1>
            <p className="text-neutral-400 text-sm font-mono">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-700">
            <Mail size={18} className="text-neutral-400" />
            <div>
              <p className="text-xs text-neutral-500 font-mono uppercase mb-1">Email</p>
              <p className="text-white text-sm">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-700">
            <GraduationCap size={18} className="text-neutral-400" />
            <div>
              <p className="text-xs text-neutral-500 font-mono uppercase mb-1">Year Group</p>
              <p className="text-white text-sm">Year {profile.year}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-neutral-900 border border-neutral-700">
            <User size={18} className="text-neutral-400" />
            <div>
              <p className="text-xs text-neutral-500 font-mono uppercase mb-1">Role</p>
              <p className="text-white text-sm capitalize">{profile.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/" className="bg-white text-black px-6 py-2 text-sm font-semibold hover:bg-neutral-200">
          Back to Home
        </Link>
      </div>
    </div>
  );
}