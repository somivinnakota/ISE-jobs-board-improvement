import { getJobPostings, getJobPostingsByCompany } from "@/app/api/utils";
import { columns } from "@/components/company/posting-table/columns";
import { JobPostingsDataTable } from "@/components/company/posting-table/data-table";
import LoadingSpinner from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/ui/job-card";
import { CandidatesTable } from "@/components/company/candidates-table";
import { createClient } from "@/lib/server";
import { CompanyJoinedWithProfile } from "@/types/company";
import { JobPosting } from "@/types/job-posting";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { env } from "@/env";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;

    try {
        const supabase = await createClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        const url = process.env.NEXT_PUBLIC_API_URL;

        const res = await fetch(`${url}/company/profile/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            console.warn(
                "metadata fetch failed:",
                res.status,
                await res.text(),
            );
            return {
                title: "404 - ISE Jobs Board",
                description: "Company not found!",
            };
        }

        const company: CompanyJoinedWithProfile = await res.json();

        return {
            title: `${company.name} - ISE Jobs Board`,
            description: `View ${company.name}'s company information.`,
        };
    } catch (e) {
        console.error("Error fetching company data for metadata:", e);
        return {
            title: "Company Profile",
            description: "Company profile page",
        };
    }
}

function JobPostings({ jobPostings }: { jobPostings: JobPosting[] }) {
    if (jobPostings.length == 0) {
        return (
            <div className="w-full flex p-8 justify-center bg-white">
                no postings found
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobPostings.map((job) => (
                <JobCard key={job.id} job={job} />
            ))}
        </div>
    );
}

const FallbackPage = () => {
    return <LoadingSpinner />;
};

async function CompanyDetails({ id }: { id: string }) {
    // fetch with auth
    const supabase = await createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    const url = process.env.NEXT_PUBLIC_API_URL;

    const jobPostings = await getJobPostingsByCompany(id);
    jobPostings.sort((jpA, jpB) => jpA.id.localeCompare(jpB.id));

    const res = await fetch(`${url}/company/profile/${id}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center bg-white p-8">
                    <p>company not found</p>
                    <Link
                        className="mt-2 bg-black p-3 text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                        href="/"
                    >
                        return home
                    </Link>
                </div>
            </div>
        );
    }

    const company: CompanyJoinedWithProfile = await res.json();

    return (
        <div className="flex w-screen flex-col px-8 pt-16 md:px-16 md:pt-32">
            <div className="relative">
                <img
                    className="h-56 w-full"
                    src={company.company_profile.banner_image}
                />
                <img
                    className="absolute -bottom-12 left-12 max-h-32 max-w-32 outline outline-8 outline-white dark:outline-black"
                    src={company.company_profile.avatar}
                />
                <h1 className="absolute -bottom-10 left-[11.5rem] bg-white p-4 px-6 pt-10 text-6xl dark:bg-black md:text-7xl">{company.name}</h1>
            </div>

            <div className="mt-16 flex w-fit flex-col bg-white px-12 py-2 dark:bg-black">
                <span className="-mt-2 flex flex-row text-xl">
                    <h2 className="">
                        {company.company_profile.subtitle}
                    </h2>
                </span>
            </div>

            <div className="mx-12 mt-8 border-2 border-black bg-white p-4 dark:border-white dark:bg-black">
                <h2 className="text-2xl font-bold">Overview</h2>
                <p className="whitespace-pre-line font-sans text-sm md:text-base">
                    {company.company_profile.description}
                </p>
            </div>

            <div className="mx-12 mt-4 p-4 border-2 border-black bg-white dark:border-white dark:bg-black">
                <h2 className="text-2xl font-bold mb-2">Job Postings</h2>
                <JobPostings jobPostings={jobPostings} />
            </div>
        </div>
    );
}

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <Suspense fallback={<FallbackPage />}>
            <CompanyDetails id={id} />
        </Suspense>
    );
}
