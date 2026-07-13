"use client"

import { Heart, Users, Info, ExternalLink, BriefcaseBusiness } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "./badge";
import { Sheet, SheetTrigger } from "./sheet";
import { JobPosting } from "@/types/job-posting";
import { JobPostingSheetContents } from "../job-posting/job-posting-sheet";
import Image from "next/image";
import Link from "next/link";

interface JobCardProps {
  job: JobPosting
  isFavourited: boolean,
  onToggleFavourite: (id: string) => void
}

export function JobCard({ job, isFavourited, onToggleFavourite }: JobCardProps) {

  console.log(job)

  return (
    <Card className="relative rounded-md border border-gray-200 bg-black transition-shadow hover:shadow-lg dark:bg-white">
      <CardContent className="flex flex-col justify-between p-6 h-full">
        <div className="relative mb-4 flex items-start space-x-3">
          <Image
            src={job.company.company_profile.avatar ?? "/placeholder.svg"}
            alt={`${job.company.name} logo`}
            className="h-10 w-10 rounded-lg object-cover"
            width={40}
            height={40}
          />
          <div className="max-w-[60%] flex-1">
            <Link
              className="flex items-center gap-x-2 font-semibold text-white hover:underline dark:text-gray-900"
              href={`/company/` + job.company.id}
            >
              <span>{job.company.name}</span>
              <ExternalLink size={16} className="mb-1" />
            </Link>
            <p className="text-sm text-white dark:text-gray-600">{job.job_title}</p>
          </div>

          <div className="absolute right-0 top-0 flex flex-col gap-y-2">
            <Badge className="flex h-8 items-center space-x-1 bg-white text-black text-[0.7rem] hover:bg-white  dark:bg-black dark:hover:bg-black dark:text-white">
              <BriefcaseBusiness className="h-3 w-3" />
              <span>
                <span className="hidden sm:inline">Residency</span> <span className="inline sm:hidden">R</span> {job.residency}
              </span>
            </Badge>

            <Badge className="flex h-8 items-center space-x-1 bg-green-600 text-[0.7rem] hover:bg-green-600  dark:bg-green-500 hover:dark:bg-green-500">
              <Users className="h-3 w-3" />
              <span>{job.position_count} <span className="hidden sm:inline">positions</span></span>
            </Badge>
          </div>
        </div>

        <div className="mb-4 space-y-1">
          <p className="text-sm text-white dark:text-gray-600">
            <span className="font-medium">Location:</span> {job.location}
          </p>
          <p className="text-sm text-white dark:text-gray-600">
            <span className="font-medium">Salary:</span> €{job.salary}
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm  font-medium text-white dark:text-gray-600">Accommodation Support:</span>
            <span className={`${job.accommodation_support ? "text-green-600" : "text-red-600"} text-sm font-bold`}>
              {job.accommodation_support ? "Yes" : "No"}
            </span>
          </div>
        </div>

        <div className="flex justify-between space-x-2">
          <Sheet>
            <SheetTrigger
              className="flex items-center space-x-2 bg-white p-2 px-3 text-sm hover:bg-white/80 dark:bg-black dark:hover:bg-black/80"
            >
              <Info size={20} />
              <span>More Info</span>
            </SheetTrigger>

            <JobPostingSheetContents job={job} isFavourited={isFavourited} setIsFavourited={onToggleFavourite} />
          </Sheet>

          <button onClick={() => onToggleFavourite(job.id)}>
            <Heart
              className={`${isFavourited ? "fill-red-500 hover:text-red-700" : "text-gray-400 hover:text-red-500"} h-5 w-5 text-red-500`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
