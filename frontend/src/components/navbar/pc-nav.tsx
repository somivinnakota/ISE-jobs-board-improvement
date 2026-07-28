import Link from "next/link";
import Image from "next/image";
import ISE_UL_LOGO from "/public/ise-ul-logo.png";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ThemeSwapButton } from "../theming/theme-swap-button";
import LoginLogoutButton from "./login-logout-button";
import { forwardRef } from "react";
import { DashboardLink } from "./dashboard-link";
import { createClient } from "@/lib/server";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Menu } from "lucide-react";

async function getDeadlineBanner() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ranking_periods")
    .select("residency, is_open, closed_at")
    .eq("is_open", true)
    .order("residency")
    .limit(1);

  if (!data || data.length === 0) return null;

  const open = data[0];
  return `Ranking window for Residency ${open.residency} is now open — submit your rankings!`;
}

export async function PcNavbar() {
  const banner = await getDeadlineBanner();

  return (
    <div className="max-w-screen fixed z-50 hidden w-screen flex-col md:flex">
      {banner && (
        <div className="flex py-1 text-sm flex-row items-center bg-gradient-to-r from-green-400 to-green-600 text-center text-white">
          <div className="mx-auto">
            <span className="font-bold text-green-800">Upcoming Deadline!</span> {banner}
          </div>
        </div>
      )}
      <div className="w-screen flex-row items-center border-b-2 border-neutral-900/20 bg-white p-2 font-mono tracking-tight dark:border-neutral-100/10 dark:bg-black md:flex">
        <Link href="/">
          <Image
            src={ISE_UL_LOGO}
            width={200}
            alt="The ISE and University of Limerick logos, side-by-side."
            className="mr-6 invert dark:invert-0" />
        </Link>
        <NavigationMenu className="">
          <NavigationMenuList>
            <DashboardLink />
          </NavigationMenuList>
        </NavigationMenu>
        <div className="ml-auto mr-4 flex items-center" suppressHydrationWarning>
          <ThemeSwapButton />
          <LoginLogoutButton />
        </div>
      </div>
    </div>
  );
}

