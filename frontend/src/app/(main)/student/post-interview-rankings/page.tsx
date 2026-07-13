import StudentJobRanking from "@/components/student/post-interview-rankings";
import { getUserIdClient } from "@/app/api/client-user";
import { createClient } from "@/lib/client";
import { getUserId } from "@/app/api/user";
import { redirect } from "next/navigation";

export default async function StudentRankingPage() {
    const supabase = createClient();
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    const studentId = await getUserId();

    if (studentId) {
        return (
            <div>
                <StudentJobRanking studentId={studentId} />
            </div>
        )
    } else {
        redirect('/access-denied')
    }
}
