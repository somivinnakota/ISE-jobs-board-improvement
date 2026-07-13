import { getRole, getUserId } from "@/app/api/user";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EditProfile() {
    let userId = await getUserId();
    let role = await getRole();

    if (!userId || !role) {
        return (
            <div className="flex items-center justify-center h-screen text-4xl">
                <p>Please log in on a student account to access student profile.</p>
                <Link href="/">
                    <Button>
                        Return home
                    </Button>                
                </Link>
            </div>
        );
    } else {
        redirect(`/student/${userId}`)
    }
}
