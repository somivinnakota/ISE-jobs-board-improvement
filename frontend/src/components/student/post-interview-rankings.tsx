"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { GripVertical, Euro, MapPin, Users, House } from "lucide-react";
import { createClient } from "@/lib/client";

interface JobPosting {
  id: string;
  job_title: string;
  salary: number;
  accommodation_support: boolean;
  position_count: number;
  location: string;
  residency: number | string;
  company: {
    name: string;
    company_profile: { avatar: string };
  };
}

function SortableJobItem({ job, rank }: { job: JobPosting; rank: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}
      className={`bg-white border shadow-sm ${isDragging ? "opacity-50 shadow-lg" : ""}`}>
      <div className="flex items-center p-4">
        <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold mr-4">
          {rank}
        </div>
        <div className="flex-shrink-0 w-12 h-12 bg-gray-200 mr-4 overflow-hidden">
          {job.company?.company_profile?.avatar ? (
            <img src={job.company.company_profile.avatar} alt={job.company.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
              {job.company?.name?.charAt(0) || "C"}
            </div>
          )}
        </div>
        <div className="flex-grow">
          <h3 className="font-semibold text-lg text-gray-800">{job.job_title}</h3>
          <p className="text-gray-600 mb-2">{job.company?.name}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {job.salary > 0 && <span className="flex items-center gap-1"><Euro className="w-4 h-4" />{job.salary?.toLocaleString()}</span>}
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{job.position_count} position{job.position_count !== 1 ? "s" : ""}</span>
            <span>Residency {job.residency}</span>
            {job.accommodation_support && <span className="flex items-center gap-1"><House className="w-4 h-4" />Housing</span>}
          </div>
        </div>
        <div {...attributes} {...listeners} className="flex-shrink-0 ml-4 cursor-grab active:cursor-grabbing">
          <GripVertical className="text-gray-600" />
        </div>
      </div>
    </div>
  );
}

export default function StudentJobRanking({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();

        // Get jobs this student has interviewed for
        const { data: interviewData, error: interviewError } = await supabase
          .from("interviews")
          .select(`
            job_posting_id,
            job_postings (
              id, job_title, salary, accommodation_support,
              position_count, location, residency,
              companies ( name, company_profiles ( avatar ) )
            )
          `)
          .eq("student_id", studentId);

        if (interviewError) throw interviewError;

        const jobs: JobPosting[] = (interviewData ?? []).map((row: any) => ({
          id: row.job_postings?.id,
          job_title: row.job_postings?.job_title,
          salary: row.job_postings?.salary,
          accommodation_support: row.job_postings?.accommodation_support,
          position_count: row.job_postings?.position_count,
          location: row.job_postings?.location,
          residency: row.job_postings?.residency,
          company: {
            name: row.job_postings?.companies?.name,
            company_profile: {
              avatar: row.job_postings?.companies?.company_profiles?.[0]?.avatar ?? '',
            },
          },
        }));

        // Check for existing draft rankings and apply order
        const { data: existingRankings } = await supabase
          .from("post_interview_rankings")
          .select("job_posting_id, rank")
          .eq("student_id", studentId)
          .eq("is_draft", true)
          .order("rank");

        if (existingRankings && existingRankings.length > 0) {
          const rankMap = new Map(existingRankings.map(r => [r.job_posting_id, r.rank]));
          jobs.sort((a, b) => (rankMap.get(a.id) ?? 999) - (rankMap.get(b.id) ?? 999));
        }

        setJobPostings(jobs);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (studentId) fetchData();
  }, [studentId]);

  function autoSave(jobs: JobPosting[]) {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveStatus('saving');
    autoSaveTimer.current = setTimeout(async () => {
      try {
        const supabase = createClient();
        const jobIds = jobs.map(j => j.id);
        await supabase.from("post_interview_rankings").delete()
          .eq("student_id", studentId).eq("is_draft", true).in("job_posting_id", jobIds);
        const rows = jobs.map((job, i) => ({
          student_id: studentId, job_posting_id: job.id, rank: i + 1, is_draft: true,
        }));
        const { error } = await supabase.from("post_interview_rankings").insert(rows);
        if (error) throw error;
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch {
        setSaveStatus('unsaved');
      }
    }, 800);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setJobPostings(prev => {
        const newJobs = arrayMove(prev,
          prev.findIndex(j => j.id === active.id),
          prev.findIndex(j => j.id === over.id)
        );
        autoSave(newJobs);
        return newJobs;
      });
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const supabase = createClient();
      await supabase.from("post_interview_rankings").delete()
        .eq("student_id", studentId).in("job_posting_id", jobPostings.map(j => j.id));
      const { error } = await supabase.from("post_interview_rankings").insert(
        jobPostings.map((job, i) => ({
          student_id: studentId, job_posting_id: job.id, rank: i + 1, is_draft: false,
        }))
      );
      if (error) throw error;
      alert("Your post-interview preferences have been submitted!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <main className="pt-28 px-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-12 w-12 border-b-2 border-black"></div>
      </div>
    </main>
  );

  return (
    <main className="pt-28 px-6 max-w-4xl mx-auto pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
          Post-Interview Rankings
        </h1>
        <p className="text-black dark:text-white mb-2">
          Rank the jobs you have interviewed for in order of preference.
        </p>
        <div className="text-sm">
          {saveStatus === 'saving' && <span className="text-gray-400">Saving...</span>}
          {saveStatus === 'saved' && <span className="text-green-600">✓ Saved {lastSaved?.toLocaleTimeString()}</span>}
          {saveStatus === 'unsaved' && <span className="text-amber-500">Unsaved changes</span>}
        </div>
      </div>

      {jobPostings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            You have not been assigned any interviews yet.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Check back after the interview period opens.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Your Interviews ({jobPostings.length})
            </h2>
          </div>
          <div className="border-b border-gray-300 dark:border-gray-600 mb-6"></div>

          <DndContext sensors={sensors} collisionDetection={closestCenter}
            onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={jobPostings.map(j => j.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-0 mb-8">
                {jobPostings.map((job, index) => (
                  <SortableJobItem key={job.id} job={job} rank={index + 1} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex gap-4 justify-center mb-8">
            <button onClick={handleSubmit} disabled={submitting}
              className="bg-green-600 text-white px-8 py-3 font-semibold hover:bg-green-700 disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit Preferences"}
            </button>
          </div>
        </>
      )}

      <div className="flex justify-center mt-4">
        <button onClick={() => router.back()}
          className="bg-gray-600 text-white px-8 py-3 font-semibold hover:bg-gray-700">
          Back
        </button>
      </div>
    </main>
  );
}