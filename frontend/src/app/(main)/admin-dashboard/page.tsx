import AnimatedHeroText from "@/components/animated-hero";
import { FloatingLink } from "@/components/home/floating-link";
import {
  LayoutDashboard,
  UserPlus,
  GitCompare
} from "lucide-react";
import UpcomingDeadlines from "@/components/admin/upcoming-deadlines";


export default function Home() {
  return (
    <div className="flex w-full flex-col px-8 pt-12 md:pt-16">
      <AnimatedHeroText text="Admin Dashboard" emphasis={[0, 1, 2, 3, 4]} />

      <h2 className="w-3/4 mt-3 font-mono text-gray-800 lg:pt-0 dark:text-neutral-300">
        Welcome to the Immersive Software Engineering Admin Portal
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-10 mb-10">
        <div className="flex flex-col justify-between w-full bg-black p-6 text-white dark:bg-white dark:text-black shadow">
          <h2 className="pb-3 text-3xl">Residencies</h2>
          <p className="text-neutral-300 dark:text-neutral-700">
            Manage residency partners, reminders, and dashboards.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <FloatingLink href="/admin-dashboard/new-rp">
              <UserPlus size={18} />
              Onboard New RP
            </FloatingLink>
            <FloatingLink href="/admin-dashboard/rp-dashboard">
              <LayoutDashboard size={18} />
              RP Dashboard
            </FloatingLink>
          </div>
        </div>

        <div className="flex flex-col justify-between w-full bg-black p-6 text-white dark:bg-white dark:text-black shadow">
          <h2 className="pb-3 text-3xl">Students</h2>
          <p className="text-neutral-300 dark:text-neutral-700">
            Manage student profiles, dashboards, and reminders.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <FloatingLink href="/admin-dashboard/new-student">
              <UserPlus size={18} />
              Add New Students
            </FloatingLink>
            <FloatingLink href="/students-dashboard">
              <LayoutDashboard size={18} />
              Students Dashboard
            </FloatingLink>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between w-full mb-10 bg-black p-6 text-white dark:bg-white dark:text-black shadow">
        <h2 className="pb-3 text-3xl">Manage Residency</h2>
        <p className="text-neutral-300 dark:text-neutral-700">
          Manage the progress of each residency.
        </p>
        <div className="flex flex-wrap gap-3 pt-4">
          <FloatingLink href="/admin-dashboard/residency/1">
            <GitCompare size={18} />
            Residency 1
          </FloatingLink>
          <FloatingLink href="/admin-dashboard/residency/2">
            <GitCompare size={18} />
            Residency 2
          </FloatingLink>
          <FloatingLink href="/admin-dashboard/residency/3">
            <GitCompare size={18} />
            Residency 3
          </FloatingLink>
          <FloatingLink href="/admin-dashboard/residency/4">
            <GitCompare size={18} />
            Residency 4
          </FloatingLink>
          <FloatingLink href="/admin-dashboard/residency/5">
            <GitCompare size={18} />
            Residency 5
          </FloatingLink>
        </div>
      </div>

      <div className="w-full">
        <UpcomingDeadlines />
      </div>

    </div>
  );
}
