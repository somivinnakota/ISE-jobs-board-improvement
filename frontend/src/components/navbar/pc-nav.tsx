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


export function PcNavbar() {
  return (
    <div className="max-w-screen fixed z-50 hidden w-screen flex-col md:flex">
      <div className="flex py-1 text-sm flex-row items-center bg-gradient-to-r from-green-400 to-green-600 text-center text-white">
        <div className="mx-auto">
          <span className="font-bold text-green-800">Upcoming Deadline!</span> Submit your R1 rankings by June 6th.
        </div>
      </div>
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
            <NavigationMenuItem>
              <Link href="/job-postings" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Job Postings
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

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

const ListItem = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href=""
          className={cn(
            "block select-none space-y-1 p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-3 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
