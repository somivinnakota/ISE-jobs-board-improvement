import { createClient } from "@/lib/client";

export async function getRoleClient() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (error || !data) {
    console.warn("Could not fetch role:", error?.message);
    return null;
  }

  return data.role as string;
}

export async function getUserIdClient() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return null;
  return session.user.id;
}

export async function getCompanyIdFromUserIdClient(userId: string): Promise<string | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("id")
    .eq("created_by", userId)
    .single();

  if (error || !data) {
    console.warn("Could not fetch company:", error?.message);
    return null;
  }

  return data.id as string;
}

export async function getStudentYearClient(studentId: string): Promise<number | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("year")
    .eq("id", studentId)
    .single();

  if (error || !data) {
    console.warn("Could not fetch student year:", error?.message);
    return null;
  }

  return data.year as number;
}