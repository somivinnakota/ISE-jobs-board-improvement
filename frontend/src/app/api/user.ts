import { createClient } from "@/lib/server";

export async function getRole() {
  console.log("=== GET ROLE CALLED ===");
  const supabase = await createClient();
  
  // Use getUser() instead of getSession() - more secure and reliable
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  console.log("User exists:", !!user);
  console.log("User ID:", user?.id);

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  console.log("Profile data:", data);
  console.log("Profile error:", error?.message);

  if (error || !data) return null;

  return data.role as string;
}

export async function getUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return user.id;
}

export async function getCompanyIdFromUserId(userId: string): Promise<string | null> {
  const supabase = await createClient();

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