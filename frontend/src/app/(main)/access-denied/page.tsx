import { Button } from "@/components/ui/button";
import { CardTitle, Card } from "@/components/ui/card";
import Link from "next/link";

export default function AccessDenied() {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center bg-white dark:bg-black p-8">
                <p>access denied</p>
                <Link
                    className="mt-2 bg-black p-3 text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    href="/"
                >
                    return home
                </Link>
            </div>
        </div>
    );
}
