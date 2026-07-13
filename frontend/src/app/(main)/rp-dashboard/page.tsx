import AnimatedHeroText from "@/components/animated-hero";
import { FloatingLink } from "@/components/home/floating-link";
import {
  LayoutDashboard,
  Users2,
  CirclePlus,
  SquarePen,
  PlusCircle
} from "lucide-react";
import { getCompanyIdFromUserId, getUserId } from "@/app/api/user";
import { getJobPostingsByCompany } from "@/app/api/utils";
import Link from "next/link";
import { JobPostingsDataTable } from "@/components/company/posting-table/data-table";
import { columns } from "@/components/company/posting-table/columns";

export default async function RPDashboard() {
  const userId = await getUserId()
  let profileUrl: string
  let companyId = ""

  if (!userId) {
    throw new Error("User not found")
  } else {
    try {
      companyId = await getCompanyIdFromUserId(userId) ?? ""
      profileUrl = ("/company/" + companyId)
    } catch (error) {
      throw new Error("Company id not found")
    }
  }

  const jobPostings = await getJobPostingsByCompany(companyId)
  jobPostings.sort((jpA, jpB) => jpA.id.localeCompare(jpB.id))

  return (
    <div className="flex w-full flex-col px-8 pt-12 md:pt-16">
      <AnimatedHeroText text="Residency Partner Dashboard" emphasis={[0, 1, 2, 3, 4, 5, 6, 7, 8]} />

      <h2 className="mt-3 w-3/4 font-mono text-gray-800 dark:text-neutral-300 lg:pt-0">
        Welcome to the Immersive Software Engineering Residency Partner Portal.
      </h2>

      <div className="mb-10 grid grid-cols-1 gap-8 pt-10 lg:grid-cols-2">
        {/* Residencies Panel */}
        <div className="flex w-full flex-col justify-between bg-black p-6 text-white shadow dark:bg-white dark:text-black">
          <h2 className="pb-3 text-3xl">My Company</h2>
          <p className="text-neutral-300 dark:text-neutral-700">
            Manage your company profile and rank residency candidates.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <FloatingLink href={profileUrl}>
              <LayoutDashboard size={18} />
              Company Profile
            </FloatingLink>
            <FloatingLink href="/admin-dashboard/rp-dashboard">
              <Users2 size={18} />
              Rank Students
            </FloatingLink>
          </div>
        </div>

        {/* Students Panel */}
        <div className="flex w-full flex-col justify-between bg-black p-6 text-white shadow dark:bg-white dark:text-black">
          <h2 className="pb-3 text-3xl">Job Postings</h2>
          <p className="text-neutral-300 dark:text-neutral-700">
            Create new job postings and manage existing job postings.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <FloatingLink href="/rp-dashboard/new-job-posting">
              <CirclePlus size={18} />
              Add New Job Posting
            </FloatingLink>
            <FloatingLink href="/students-dashboard">
              <SquarePen size={18} />
              Edit Job Postings
            </FloatingLink>
          </div>
        </div>

        <div className="flex flex-col gap-y-4 bg-black p-4 dark:bg-white lg:col-span-2">
          <div className="flex flex-row justify-between">
            <h2 className="text-2xl font-bold text-white dark:text-black">Job Table</h2>
            <Link
              href={"/rp-dashboard/new-job-posting"}
              className="max-w-fit flex flex-row items-center gap-x-1 bg-white p-2 text-sm text-black dark:bg-black dark:text-white"
            >
              <PlusCircle size={16} />
              Create New
            </Link>
          </div>
          <JobPostingsDataTable columns={columns} data={jobPostings} />
        </div>
      </div>

    </div>
  );
}
