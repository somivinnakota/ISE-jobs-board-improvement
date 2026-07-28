import ISE_UL_LOGO from "/public/ise-ul-logo.png";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import Image from "next/image";
import { Menu } from "lucide-react";
import Link from "next/link";
import { ThemeSwapButton } from "../theming/theme-swap-button";
import { getRole } from "@/app/api/user";

export const MobileNavbar = async () => {
  const role = await getRole();

  return (
    <Drawer>
      <div className="fixed z-50 flex w-full flex-row items-center justify-between border-b-2 border-b-neutral-900/60 px-2 py-2 backdrop-blur-sm md:hidden">
        <Image
          src={ISE_UL_LOGO}
          width={150}
          alt="The ISE and University of Limerick logos, side-by-side."
          className="rounded-xl invert dark:invert-0"
        />
        <div className="flex flex-row items-center gap-x-4">
          <ThemeSwapButton />
          <DrawerTrigger>
            <Menu />
          </DrawerTrigger>
        </div>
      </div>
      <DrawerContent className="max-h-[60svh] p-0">
        <div className="flex flex-col space-y-3 overflow-auto p-6">
          <Link href="/" className="font-mono text-lg">Home</Link>
          <Link href="/job-postings" className="font-mono text-lg">Job Postings</Link>
          {role === 'student' && (
            <>
              <Link href="/pre-interview-rankings" className="font-mono text-lg">Rank Your Choices</Link>
              <Link href="/edit-profile" className="font-mono text-lg">Edit Profile</Link>
            </>
          )}
          {role === 'company' && (
            <>
              <Link href="/rp-dashboard" className="font-mono text-lg">Partner Dashboard</Link>
              <Link href="/rp-dashboard/new-job-posting" className="font-mono text-lg">Add Job Posting</Link>
            </>
          )}
          {role === 'admin' && (
            <Link href="/admin-dashboard" className="font-mono text-lg">Admin Dashboard</Link>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};