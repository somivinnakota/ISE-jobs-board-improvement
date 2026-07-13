import AnimatedHeroText from "@/components/animated-hero"
import { fetchFinalMatches, fetchInterviews, fetchStudentsWithProfiles } from "@/app/api/utils"
import { fetchJobPostingsByResidency } from "@/app/api/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeftRight, Cigarette, Handshake, Users } from "lucide-react"
import { StudentsTabContents } from "@/components/admin/residency/tabs/students-tab-contents"
import { MatchingTabContents } from "@/components/admin/residency/tabs/matching-tab-contents"
import InterviewsTabContents from "@/components/admin/residency/tabs/interviews-tab-contents"

export default async function ResidencyManager({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: residencySlug } = await params
  let year: string = residencySlug

  if (!(["1", "2", "3", "4", "5"].includes(year))) {
    throw new Error(`Unknown slug`)
  }

  switch (residencySlug) {
    case "1":
      year = "1"
      break;
    case "2":
      year = "1"
      break
    case "3":
      year = "2"
      break
    case "4":
      year = "3"
      break
    case "5":
      year = "4"
      break
  }

  console.log(year)

  const students = await fetchStudentsWithProfiles(year)
  const interviews = await fetchInterviews(year)
  const postings = await fetchJobPostingsByResidency(year)
  const matches = await fetchFinalMatches(year)

  return (
    <div className="flex w-full flex-col px-8 pt-12 md:pt-16">
      <AnimatedHeroText text={`Residency ${residencySlug}`} emphasis={[10]} />

      <Tabs defaultValue="students" className="w-full mt-8">
        <TabsList>
          <TabsTrigger value="students" className="flex gap-x-2 items-center"><Users size={16} /> Students</TabsTrigger>
          <TabsTrigger value="interviews" className="flex gap-x-2 items-center"><Cigarette size={16} /> Interviews</TabsTrigger>
          <TabsTrigger value="matching" className="flex gap-x-2 items-center"><ArrowLeftRight size={16} /> Matching</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <StudentsTabContents students={students} postings={postings} year={year} residency={residencySlug} />
        </TabsContent>

        <TabsContent value="interviews">
          <InterviewsTabContents interviews={interviews} />
        </TabsContent>

        <TabsContent value="matching">
          <MatchingTabContents matches={matches} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

