import AnimatedHeroText from "@/components/animated-hero";
import { FloatingLink } from "@/components/home/floating-link";
import { BriefcaseBusiness, LayoutDashboard, LayoutList, ListOrdered, UserPen, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex w-screen flex-col px-8 pt-12 md:pt-16">
      <AnimatedHeroText text="The next generation computer science course." emphasis={[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]} />

      <h2 className="w-3/4 mt-3 font-mono text-gray-800 lg:pt-0 dark:text-neutral-300">
        Immersive Software Engineering is a radical leap forward; a highly-competitive program that is producing some of the best software engineers in the world.
      </h2>

      <div className="flex h-full w-full flex-col gap-8 pt-10 lg:flex-row">
        <div className="min-h-full flex flex-col justify-between w-full bg-black p-6 text-white dark:bg-white dark:text-black">
          <h2 className="pb-3 text-3xl">residency partners</h2>

          <p className="text-neutral-300 dark:text-neutral-700">
            Add new job postings, edit your company page, view candidates, and more.
          </p>

          <div className="flex flex-row gap-x-3">
            <FloatingLink href='/rp-dashboard'>
              <LayoutDashboard size={18} className="min-h-5 min-w-5 text-sm transition-all duration-100 group-hover:scale-110" />
              Dashboard
            </FloatingLink>

            <FloatingLink href="/rp-dashboard">
              <Users size={18} className="min-h-5 min-w-5 text-sm transition-all duration-100 group-hover:scale-110" />
              Candidates
            </FloatingLink>

            <FloatingLink href="/rp-dashboard/new-job-posting">
              <BriefcaseBusiness size={18} className="min-h-5 min-w-5 text-sm transition-all duration-100 group-hover:scale-110" />
              Add Job
            </FloatingLink>
          </div>

        </div>

        <div className="min-h-full flex flex-col justify-between w-full bg-black p-6 text-white dark:bg-white dark:text-black">
          <h2 className="pb-3 text-3xl">students</h2>

          <p className="text-neutral-300 dark:text-neutral-700">
            View residency partners, job postings, and submit choices.
          </p>

          <div className="flex flex-row gap-x-3">
            <FloatingLink href="/job-postings">
              <LayoutList size={18} className="min-h-5 min-w-5 text-sm transition-all duration-100 group-hover:scale-110" />
              Job Postings
            </FloatingLink>

            <FloatingLink href="/choose-rankings">
              <ListOrdered size={22} className="min-h-5 min-w-5 text-sm transition-all duration-100 group-hover:scale-110" />
              Rank Your Choices
            </FloatingLink>

            <FloatingLink href="edit-profile">
              <UserPen size={18} className="min-h-5 min-w-5 text-sm transition-all duration-100 group-hover:scale-110" />
              Edit Profile
            </FloatingLink>
          </div>
        </div>
      </div>
    </div>
  );
}
