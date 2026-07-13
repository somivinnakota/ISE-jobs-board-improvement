import RankCandidates from "@/components/company/rank-candidates";
import { getJobPostingsByCompany } from "@/app/api/utils";
import { JobPosting } from "@/types/job-posting";

export default async function RankCandidatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Company ID

  return <RankCandidates companyId={id} />;
}