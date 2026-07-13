import { JobPosting } from "@/types/job-posting"
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { BriefcaseBusiness, ExternalLink, HandCoins, Heart, House, MapPin, User, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface JobSheetProps {
  job: JobPosting
  isFavourited: boolean
  setIsFavourited: (id: string) => void
}

export const JobPostingSheetContents = ({ job, isFavourited, setIsFavourited }: JobSheetProps) => {
  return (
    <SheetContent className="w-[9999px] max-w-full sm:!max-w-[600px]" side="right">
      <SheetHeader>
        <SheetTitle>
          Job Posting
        </SheetTitle>
      </SheetHeader>
      <div className="mt-8 flex flex-row justify-between">
        <div className="w-full">
          <div className="flex flex-roww-full items-start space-x-2">
            <Image
              src={job.company.company_profile.avatar ?? "/placeholder.svg"}
              alt={`${job.company.name} logo`}
              className="w-16 h-16 rounded-lg object-cover"
              width={64}
              height={64}
            />
            <div>
              <Link
                className="text-3xl font-bold flex items-center gap-x-2 hover:underline"
                href={`/company/` + job.company.id}
              >
                {job.company.name}
                <ExternalLink size={20} className="mb-1" />
              </Link>
              <h2 className="text-lg">{job.job_title}</h2>
            </div>
          </div>

          <div className="w-full mb-4 mt-2 h-[2px] dark:bg-white/20 bg-black/20" />

          <div className="relative flex flex-col space-y-2">
            <div>
              <button
                className={`
                    ${isFavourited ? "bg-red-500 text-white" : "bg-transparent"} group mt-2 flex max-w-fit
                    absolute right-4 cursor-pointer
                    flex-row items-center gap-x-2 rounded-sm p-2 text-xs font-bold text-red-500 outline outline-2 outline-red-500
                    `}
                onClick={() => setIsFavourited}
              >
                <Heart className={`${isFavourited ? "fill-white" : "text-gray-400 group-hover:text-red-500"} h-4 w-4`} />
                Favourite
              </button>
            </div>
            <span className="flex flex-row items-center text-sm">
              <BriefcaseBusiness size={18} className="mr-2" /> Residency {job.residency}
            </span>

            <span className="flex flex-row items-center text-sm">
              <Users size={18} className="mr-2" /> {job.position_count} positions
            </span>

            <span className="flex flex-row items-center text-sm">
              <MapPin size={18} className="mr-2" /> {job.location}
            </span>

            <span className="flex flex-row text-sm">
              <HandCoins size={18} className="mr-2" /> €{job.salary} per month
            </span>

            <span className="flex flex-row text-sm">
              <House size={18} className="mr-2" />

              Accommodation Support?
              <span className={`${job.accommodation_support ? "text-green-600" : "text-red-600"} ml-2 text-sm font-bold`}>
                {job.accommodation_support ? "Yes" : "No"}
              </span>
            </span>

            <span className="flex flex-row text-sm">
              <User size={18} className="mr-2" />
              Contact: <span className="font-sans">{job.contact_email}</span>
            </span>
          </div>
        </div>

      </div >

      <div className="w-full my-4 h-[3px] dark:bg-white/20 bg-black/20" />

      <p className="whitespace-pre-line px-4 font-sans">
        {job.description}
      </p>
    </SheetContent >
  )
}
