import { createClient } from "@/lib/server";
import { env } from "@/env";

const url = env.NEXT_PUBLIC_API_URL

export async function getRole() {
    let role = "";
    let userID = "";

    const supabase = await createClient();
    const session = await supabase.auth.getSession();

    if (session.data.session) {
        userID = session.data.session.user.id;

        const res = await fetch(`${url}/account/role/${userID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.data.session.access_token}`,
            },
        });

        if (!res.ok) {
            console.warn(
                "metadata fetch failed:",
                res.status,
                await res.text(),
            );
            return;
        }

        const roleBody = await res.json();

        role = roleBody.role;
        return role;
    }
    return null
}

export async function getUserId() {
    const supabase = await createClient();
    let userId: string

    const session = await supabase.auth.getSession();

    if (session.data.session) {
        userId = session.data.session.user.id;
        return userId
    }

    return null
}

export async function getCompanyIdFromUserId(
    userId: string
): Promise<string | null> {
    const supabase = await createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;
    if (!token) {
        throw new Error("No token found while trying to fetch company by userid")
    }

    const res = await fetch(`${url}/company-by-userid/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error("metadata fetch failed:" + res.status + text);
    }

    const body = await res.json();
    return (body.company_id as string) ?? null;
}

