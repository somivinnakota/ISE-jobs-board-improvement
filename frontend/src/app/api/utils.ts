import { createClient } from "@/lib/server";
import { env } from "@/env";
import { JobPosting } from "@/types/job-posting";
import { getUserId } from "./user";
export interface NewCompanyProfileDTO {
  subtitle: string
  avatar: string
  banner_image: string
  description: string
}

export interface NewCompanyDTO {
  name: string
  profile: NewCompanyProfileDTO
}

// the shape your backend returns
export interface Company {
  id: string
  name: string
  company_profile: string
}

export interface JobRanking {
  jobId: string,
  ranking: number
}

export async function getJobPostings(): Promise<JobPosting[]> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token
  const url = env.NEXT_PUBLIC_API_URL

  const res = await fetch(`${url}/job-postings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  })

  if (!res.ok) {
    console.log("RES: ", res)
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }

  return (await res.json()) as JobPosting[]
}

export async function getJobPostingsByCompany(companyID: string): Promise<JobPosting[]> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token
  const url = env.NEXT_PUBLIC_API_URL

  const res = await fetch(`${url}/job-postings/company/` + companyID, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  })

  if (!res.ok) {
    console.log("SUS!")
    console.log("RES: ", res)
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }

  console.log(res)

  return (await res.json()) as JobPosting[]
}

//Send a user's pre-interview rankings via POST
export async function submitJobRankings(rankings: JobRanking[]) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token
  const url = env.NEXT_PUBLIC_API_URL
  const studentId = getUserId()

  if (!token) { throw new Error("No Access token found") }
  if (!studentId) { throw new Error("No student id found") }

  const res = await fetch(`${url}/pre-interview-rankings/${studentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(rankings),
  })

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${res.statusText} — ${errorText}`)
  }
}

export async function createCompany(
  dto: NewCompanyDTO
): Promise<Company> {
  const url = env.NEXT_PUBLIC_API_URL
  const res = await fetch(`${url}/residency`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${res.statusText} — ${text}`)
  }

  return (await res.json()) as Company
}

export async function getCompanies() {
  const url = env.NEXT_PUBLIC_API_URL
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token
  const res = await fetch(`${url}/companies`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${res.statusText} — ${text}`)
  }
}


export interface StudentWithProfile {
  id: string
  name: string
  year: number
  student_profile: {
    id: string
    qca: string | null
    pronouns: string | null
    description: string | null
    avatar_url: string | null
    cv_url: string | null
    github_link: string | null
    linkedin_link: string | null
    personal_site_link: string | null
  },
  accepted_student_emails: [{
    email: string
  }]
}

export async function fetchStudentsWithProfiles(
  year?: string
): Promise<StudentWithProfile[]> {
  const res = await fetch(`http://localhost:8080/api/v1/students-with-profile/${year}`, {
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(`Error ${res.status}: ${message}`)
  }

  return (await res.json()) as StudentWithProfile[]
}
type InterviewMatch =

  Record<string, {
    positions: number
    id: string
  }[]>

type ResidencyMatch =
  Record<string, {
    name: string
    id: string
    positions: number
    hires: { id: string; name: string }[]
  }>

const API_ROOT = env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1"

export async function runInterviewMatch(
  year: string,
  residency: string
): Promise<InterviewMatch> {
  const resp = await fetch(`${API_ROOT}/match-interviews/${year}/${residency}`, {
    method: "POST",
  })

  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText)
    throw new Error(`Interview-match failed (${resp.status}): ${msg}`)
  }

  return resp.json()
}

export async function runResidencyMatch(
  year: string,
  residency: string
): Promise<ResidencyMatch> {
  console.log(`${API_ROOT}/match-residency/${year}/${residency}`)

  const resp = await fetch(`${API_ROOT}/match-residency/${year}/${residency}`, {
    method: "POST",
  })

  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText)
    throw new Error(`Residency-match failed (${resp.status}): ${msg}`)
  }

  return resp.json()
}

export type InterviewWithStudent = {
  id: number
  student_id: string
  job_posting_id: string
  student: {
    id: string;
    name: string;
    year: number
  }
  job_posting: {
    id: string;
    job_title: string
    company: {
      company_name: string;
      company_profile: {
        company_avatar: string;
      }
    }
  }
}

export interface InterviewTableProps {
  students: InterviewWithStudent[]
}

export async function fetchInterviews(
  year: string,
): Promise<InterviewTableProps> {
  const resp = await fetch(`${API_ROOT}/interviews/${year}`, {
    method: "GET"
  })


  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText)
    throw new Error(`Interview fetch failed (${resp.status}): ${msg}`)
  }

  const students = (await resp.json()) as InterviewWithStudent[]
  return { students }
}

export interface JobPostingRow {
  id: string
  job_title: string | null
  salary: number | null
  accommodation_support: boolean | null
  description: string | null
  contact_email: string | null
  location: string | null
  position_count: number | null
  residency: string | null
}

export interface CompanyWithPostings {
  id: string
  name: string | null
  job_posting: JobPostingRow[]
}

export async function fetchJobPostingsByResidency(
  residency: string,
): Promise<CompanyWithPostings[]> {
  const res = await fetch(
    `${API_ROOT}/job-posting/${residency}`,
    {
      method: "GET",
      next: { revalidate: 0 },
    },
  )

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText)
    throw new Error(
      `fetchJobPostingsByResidency failed (${res.status}): ${msg}`,
    )
  }

  return res.json()
}

export interface FinalMatchRow {
  id: string
  student_id: string
  job_posting_id: string

  student: {
    id: string
    name: string | null
    student_profile_id: string
    year: number | null
  }

  job_posting: {
    id: string
    job_title: string | null
    salary: number
    accommodation_support: boolean
    description: string
    contact_email: string
    location: string
    position_count: number
    residency: string
  }
}

export async function fetchFinalMatches(
  year: string,
): Promise<FinalMatchRow[]> {
  const res = await fetch(
    `${API_ROOT}/final-match/${encodeURIComponent(year)}`,
    {
      method: "GET",
      next: { revalidate: 0 },
    },
  )

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText)
    throw new Error(`fetchFinalMatches failed (${res.status}): ${msg}`)
  }
  return res.json()
}
