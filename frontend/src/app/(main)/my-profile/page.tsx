
import { env } from "@/env"
import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"

export default async function MyProfile() {
    const supabase = await createClient()

    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/auth/login`)
    }

    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/account/${user.id}`)

    if (!res.ok) {
        redirect('/auth/login')
    }

    const account = await res.json()

    if (!account.student_id) {
        redirect('/') // User is not a student
    }

    redirect(`/student/${user.id}`)

    return <h1>Loading...</h1>
}
