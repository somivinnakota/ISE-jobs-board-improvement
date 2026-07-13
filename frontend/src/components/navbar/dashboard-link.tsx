import { createClient } from "@/lib/server";
import { NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "../ui/navigation-menu";
import Link from "next/link";
import { env } from "@/env";
import { getCompanyIdFromUserId, getRole } from "@/app/api/user";

export async function DashboardLink() {
    let role = await getRole()
    let userID = ""

    const supabase = await createClient()

    const session = await supabase.auth.getSession()

    if (session.data.session) {
        userID = session.data.session.user.id
    }

    if (role == "admin") {
        return (
            <NavigationMenuItem>
                <Link href={"/admin-dashboard"} legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Admin Dashboard
                    </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>
        )
    }

    if (role == "company") {
        //Get company from userID
        let companyId = await getCompanyIdFromUserId(userID)
        return (
            <>
                <NavigationMenuItem>
                    <Link href={"/rp-dashboard"} legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            RP Dashboard
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <Link href={"/company/" + companyId} legacyBehavior passHref>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Your Company Profile
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </>
        )
    }

    if (role == "student") {
        return (
            <NavigationMenuItem>
                <Link href={"/student/" + userID} legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        Your Profile
                    </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>
        )
    } else {
        return null
    }
}
