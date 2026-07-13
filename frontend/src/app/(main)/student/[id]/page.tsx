import { EditProfileForm } from "@/components/student-profile/edit-profile";
import { WickedLink } from "@/components/student-profile/link";
import { SuspensedImage } from "@/components/student-profile/suspensed-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { env } from "@/env";
import { createClient } from "@/lib/server";
import { StudentJoinedWithProfile } from "@/types/student";
import { FileQuestion, FileText, Github, Globe, Linkedin, Pencil } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";

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
    const url = env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${url}/students/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.warn("metadata fetch failed:", res.status, await res.text());
      return {
        title: "404 - ISE Jobs Board",
        description: "Student not found!",
      }
    }

    const studentData: StudentJoinedWithProfile = await res.json();

    return {
      title: `${studentData.name} - ISE Jobs Board`,
      description: `View ${studentData.name}'s profile, projects, and information.`,
    };
  } catch (e) {
    console.error("Error fetching student data for metadata:", e);
    return {
      title: "Student Profile",
      description: "Student profile page",
    };
  }
}

const FallbackPage = () => {
  return (
    <div className="flex w-screen flex-col px-8 pt-16 md:px-16 md:pt-32 xl:pl-20 xl:pr-40 2xl:pr-64">
      <div className="flex flex-col">
        <div className="flex flex-row items-end gap-x-8">
          <div className="h-64 w-64 animate-pulse rounded-full bg-muted"></div>
          <div className="mb-8 flex flex-col py-2">
            <div className="mb-1 h-16 w-96 animate-pulse rounded-xl bg-muted" />
            <div className="h-6 w-40 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>

        <h2 className="mt-8 bg-white text-2xl font-bold">Overview</h2>
        <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />

        <h2 className="mt-8 bg-white text-2xl font-bold">Projects</h2>
      </div>
    </div>
  );
};

async function StudentDetails({ id }: { id: string }) {
  // fetch with auth
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  const url = env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${url}/students/profile/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 404) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>student not found</p>
        <WickedLink url="/" text="return home" icon={<FileQuestion />} />
      </div>
    );
  }
  if (!res.ok) {
    throw new Error(`Unexpected error: ${res.status}`);
  }

  const student: StudentJoinedWithProfile = await res.json();

  return (
    <div className="flex w-screen flex-col px-8 pt-16 md:px-16 md:pt-32 xl:pl-20 xl:pr-40 2xl:pr-64">
      <div className="flex flex-col items-center gap-x-8 lg:flex-row lg:items-end">
        <SuspensedImage imageURL={student.student_profile.avatar_url} />
        <div className="flex flex-col bg-white dark:bg-black py-2">
          <h1 className="text-6xl md:text-7xl">{student.name}</h1>
          <span className="flex flex-row -mt-2 text-xl">
            <h2 className="">
              {["Year " + student.year, student.student_profile.pronouns]
                .filter(Boolean)
                .join(" | ")}
              {[student.year, student.student_profile.pronouns].filter(Boolean)
                .length > 0 && " | "}
            </h2>
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex flex-row items-center gap-x-1 ml-3">
                  Edit <Pencil size={18} className="mb-1" />
                </button>
              </DialogTrigger>
              <DialogContent className="overflow-scroll h-3/4">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <EditProfileForm currentValues={student} />
              </DialogContent>
            </Dialog>
          </span>
          <div className="mt-3 flex flex-col gap-x-4 gap-y-2 sm:flex-row">
            <WickedLink
              text="CV.pdf"
              url={student.student_profile.cv_url ?? ""}
              icon={<FileText size={20} />}
            />
            <WickedLink
              text="GitHub"
              url={student.student_profile.github_link ?? ""}
              icon={<Github size={20} />}
            />
            <WickedLink
              text="LinkedIn"
              url={student.student_profile.linkedin_link ?? ""}
              icon={<Linkedin size={20} />}
            />
            <WickedLink
              text="Personal Site"
              url={student.student_profile.personal_site_link ?? ""}
              icon={<Globe size={20} />}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 border-2 border-black bg-white dark:bg-black dark:border-white p-2 rounded-sm">
        <h2 className="text-2xl font-bold">Overview</h2>
        <p className="whitespace-pre-line text-sm md:text-base">
          {student.student_profile.description}
        </p>
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
      <StudentDetails id={id} />
    </Suspense>
  );
}
