// src/components/auth/LoginLogoutButton.tsx
"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/lib/client";
import { Button } from "../ui/button";
import Link from "next/link";

export default function LoginLogoutButton() {
    const [session, setSession] = useState<Session | null>(null);
    const router = useRouter();
    const supabaseBrowser = createClient();

    useEffect(() => {
        supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabaseBrowser.auth.onAuthStateChange(
            (_event: AuthChangeEvent, newSession: Session | null) => {
                setSession(newSession);
            },
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (session === undefined) {
        return null;
    }

    if (!session) {
        return (
            <Link href={"/auth/login"}>
                <Button className="ml-2 w-24">Log In</Button>
            </Link>
        );
    }

    return (
        <Button className="ml-2 w-24">
            <a
                onClick={async () => {
                    await supabaseBrowser.auth.signOut();
                    router.refresh();
                    redirect('/auth/login')
                }}
            >
                Log Out
            </a>
        </Button>
    );
}
