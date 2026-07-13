"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import LoadingSpinner from "@/components/loading-spinner";
import { env } from "@/env";

export default function NewStudentsPage() {
    const router = useRouter();
    const supabase = createClient();
    const [rawEmails, setRawEmails] = useState("");
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();
            if (error || !session) {
                alert("Not authenticated");
                router.push("/login");
                return;
            }
            setToken(session.access_token);
            setLoading(false);
        };
        checkAuth();
    }, [router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            alert("Not authenticated");
            return;
        }

        // Parse textarea: split on commas/newlines
        const listOfEmails = rawEmails
            .split(/[\n,]+/)
            .map((x) => x.trim())
            .filter((x) => x.length > 0);

        if (listOfEmails.length === 0) {
            alert("Please enter at least one email.");
            return;
        }

        try {
            const url = env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${url}/accepted-student-emails`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ emails: listOfEmails }),
                },
            );

            if (res.ok) {
                alert("All students added successfully!");
                router.push("/admin-dashboard");
            } else {
                console.error("HTTP Status:", res.status, res.statusText);

                const text = await res.text();
                console.error("Response body:", text);

                let errorMessage = res.statusText;
                if (text) {
                    try {
                        const data = JSON.parse(text);
                        errorMessage = data.message || res.statusText;
                    } catch (e) {
                        errorMessage = text;
                    }
                }

                alert("Failed to add students: " + errorMessage);
            }
        } catch (err) {
            alert("Request failed: " + err);
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
            <h1 className="text-2xl font-bold mb-4">Add New Student Emails</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">
                        Student Emails (one per line or comma separated)
                    </label>
                    <textarea
                        rows={6}
                        className="w-full p-2 border"
                        placeholder="Enter emails here"
                        value={rawEmails}
                        onChange={(e) => setRawEmails(e.target.value)}
                        required
                    />
                </div>
                <div className="flex gap-4 pt-2">
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 hover:bg-green-700"
                    >
                        Submit All
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/admin-dashboard")}
                        className="bg-gray-600 text-white px-4 py-2 hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </main>
    );
}
