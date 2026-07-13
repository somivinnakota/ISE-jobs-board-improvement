"use client"

import React, { useEffect, useMemo, useState } from "react"
import JobPostings from "@/components/ui/JobPostings"
import { JobPosting } from "@/types/job-posting"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectTrigger, SelectValue } from "../ui/select"
import { SelectItem } from "@radix-ui/react-select"
import { Checkbox } from "../ui/checkbox"

interface Props {
  initialJobPostings: JobPosting[]
  error: string | null
}

const FAVOURITES_KEY = "favouritedJobPostings"

export default function ClientJobPostings({ initialJobPostings, error }: Props) {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>(
    initialJobPostings.map(job => ({ ...job, isFavourited: false }))
  )

  const [wantsFavourites, setWantsFavourites] = useState<boolean>()

  useEffect(() => {
    const savedFaves = JSON.parse(localStorage.getItem(FAVOURITES_KEY) || "[]")
    setJobPostings(
      initialJobPostings.map(job => ({
        ...job,
        isFavourited: savedFaves.includes(job.id),
      }))
    )
  }, [initialJobPostings])

  useEffect(() => {
    const faves = jobPostings.filter(j => j.isFavourited).map(j => j.id)
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(faves))
  }, [jobPostings])

  const toggleFavourite = (id: string) => {
    setJobPostings(jobs =>
      jobs.map(job =>
        job.id === id ? { ...job, isFavourited: !job.isFavourited } : job
      )
    )
  }

  const [selectedLocation, setSelectedLocation] = useState<string>("any")
  const [selectedResidency, setSelectedResidency] = useState<string>("any")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [minSalary, setMinSalary] = useState<number>(0)

  const locations = useMemo(() =>
    Array.from(new Set(jobPostings.map(job => job.location))),
    [jobPostings]
  )

  const filteredJobPostings = useMemo(() =>
    jobPostings.filter(job =>
      job.company.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedLocation === "any" || job.location === selectedLocation) &&
      (selectedResidency === "any" || job.residency === selectedResidency) &&
      job.salary >= minSalary &&
      (wantsFavourites ? (job.isFavourited) : true)
    ),
    [jobPostings, searchQuery, selectedLocation, selectedResidency, minSalary, wantsFavourites]
  )

  return (
    <div className="flex w-screen flex-col px-8 pt-16 md:pt-20">
      <div className="my-4 flex w-fit items-center gap-x-8 bg-white p-2 dark:bg-black">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            className="max-w-fit"
            id="search"
            onChangeCapture={e => setSearchQuery(e.currentTarget.value)}
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Select onValueChange={e => setSelectedLocation(e)}>
            <SelectTrigger id="location">
              <SelectValue placeholder="Choose...">
                {selectedLocation}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="p-1 hover:cursor-pointer">
              <SelectItem value="any" key="any" className="p-1 text-sm italic text-gray-600 hover:underline">
                any
              </SelectItem>
              {locations.map(loc => (
                <SelectItem value={loc} key={loc} className="p-1 text-sm hover:underline">
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="residency">Residency</Label>
          <Select onValueChange={e => setSelectedResidency(e)}>
            <SelectTrigger id="residency">
              <SelectValue placeholder="Choose...">
                {selectedResidency}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="p-1 hover:cursor-pointer">
              <SelectItem value="any" key="any" className="p-1 text-sm italic text-gray-600 hover:underline">
                any
              </SelectItem>
              <SelectItem value="1" key="1" className="p-1 text-sm hover:underline">
                1
              </SelectItem>
              <SelectItem value="1+2" key="1+2" className="p-1 text-sm hover:underline">
                1+2
              </SelectItem>
              <SelectItem value="2" key="2" className="p-1 text-sm hover:underline ">
                2
              </SelectItem>
              <SelectItem value="3" key="3" className="p-1 text-sm hover:underline ">
                3
              </SelectItem>
              <SelectItem value="4" key="4" className="p-1 text-sm hover:underline ">
                4
              </SelectItem>
              <SelectItem value="5" key="5" className="p-1 text-sm hover:underline ">
                5
              </SelectItem>
            </SelectContent>
          </Select>
        </div>


        <div>
          <Label htmlFor="salary">Min Salary</Label>
          <Input
            className="max-w-fit"
            id="salary"
            type="number"
            onChangeCapture={e => setMinSalary(Number(e.currentTarget.value))}
          />
        </div>

        <div className="flex flex-row items-center gap-x-2">
          <Label htmlFor="fav">Only Favourites?</Label>
          <Checkbox
            checked={wantsFavourites}
            onCheckedChange={() => setWantsFavourites(!wantsFavourites)}
          />
        </div>
      </div>

      <JobPostings jobPostings={filteredJobPostings} onToggleFavourite={toggleFavourite} />
    </div>
  )
}
