'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/loading-spinner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Session } from '@supabase/supabase-js';
import { getUserIdClient } from '@/app/api/client-user';
import { EuroIcon, GripVertical, House, MapPin, Users } from 'lucide-react';
import { createClient } from '@/lib/client';

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
    company_profile: {
      avatar: string;
    };
  };
}

interface SortableJobItemProps {
  job: JobPosting;
  rank: number;
}

function getAccessibleResidencies(year: number): (number | string)[] {
  switch (year) {
    case 1: return [1, '1', 2, '2', '1+2'];
    case 2: return [3, '3'];
    case 3: return [4, '4'];
    case 4: return [5, '5'];
    default: return [];
  }
}

function getResidencyGroups(year: number): { label: string; residencies: (number | string)[] }[] {
  switch (year) {
    case 1:
      return [
        { label: 'Residency 1', residencies: [1, '1'] },
        { label: 'Residency 2', residencies: [2, '2'] },
        { label: 'Residency 1+2', residencies: ['1+2'] },
      ];
    case 2: return [{ label: 'Residency 3', residencies: [3, '3'] }];
    case 3: return [{ label: 'Residency 4', residencies: [4, '4'] }];
    case 4: return [{ label: 'Residency 5', residencies: [5, '5'] }];
    default: return [];
  }
}

function DragHandle() {
  return (
    <div className="flex flex-col gap-1 p-2 cursor-grab active:cursor-grabbing">
      <GripVertical className="text-gray-600" />
    </div>
  );
}

function SortableJobItem({ job, rank }: SortableJobItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border shadow-sm ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
    >
      <div className="flex items-center p-4">
        <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold mr-4">
          {rank}
        </div>
        <div className="flex-shrink-0 w-12 h-12 bg-gray-200 mr-4 overflow-hidden">
          {job.company?.company_profile?.avatar ? (
            <img src={job.company.company_profile.avatar} alt={job.company.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
              {job.company?.name?.charAt(0) || 'C'}
            </div>
          )}
        </div>
        <div className="flex-grow">
          <h3 className="font-semibold text-lg text-gray-800">{job.job_title}</h3>
          <p className="text-gray-600">{job.company?.name}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>Residency {job.residency}</span>
            <span><EuroIcon size={14} className="inline mb-0.5" />{job.salary?.toLocaleString()}</span>
            <span><MapPin size={14} className="inline mb-0.5" /> {job.location}</span>
            <span><Users size={14} className="inline mb-0.5" /> {job.position_count} position{job.position_count !== 1 ? 's' : ''}</span>
            {job.accommodation_support && <span><House size={14} className="inline mb-0.5" /> Housing</span>}
          </div>
        </div>
        <div {...attributes} {...listeners} className="flex-shrink-0 ml-4">
          <DragHandle />
        </div>
      </div>
    </div>
  );
}

export default function JobRankingPage() {
  const router = useRouter();
  const [jobsByResidency, setJobsByResidency] = useState<{ [key: string]: JobPosting[] }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [residencyGroups, setResidencyGroups] = useState<{ label: string; residencies: (number | string)[] }[]>([]);
  const [saveStatus, setSaveStatus] = useState<{ [key: string]: 'saved' | 'saving' | 'unsaved' }>({});
  const [lastSaved, setLastSaved] = useState<{ [key: string]: Date | null }>({});
  const autoSaveTimers = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    export default function JobRankingPage() {
  console.log('COMPONENT MOUNTED');
    async function fetchData() {
  console.log('FETCH DATA STARTED');
      try {
        const supabase = createClient();
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError || !session) {
          console.error('Auth error or no session');
          setLoading(false);
          return;
        }

        setSession(session);

        // Get user profile (year + role) directly from Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('year')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          console.error('Could not load profile:', profileError?.message);
          setLoading(false);
          return;
        }

        const userYear = profile.year;
        setYear(userYear);

        // Get job postings directly from Supabase
        const { data: jobData, error: jobError } = await supabase
  .from('job_postings')
  .select(`
    id,
    job_title,
    salary,
    accommodation_support,
    position_count,
    location,
    residency,
    companies (
      name,
      company_profiles (
        avatar
      )
    )
  `)
  .eq('status', 'approved');

console.log('JOB DATA:', jobData);
console.log('JOB ERROR:', jobError);
console.log('PROFILE:', profile);
console.log('YEAR:', userYear);

        if (jobError) {
          console.error('Could not load jobs:', jobError.message);
          setLoading(false);
          return;
        }

        // Normalise nested company shape to match existing UI
        const jobs: JobPosting[] = (jobData ?? []).map((j: any) => ({
          ...j,
          company: {
            name: j.companies?.name,
            company_profile: {
              avatar: j.companies?.company_profiles?.[0]?.avatar ?? '',
            },
          },
        }));

        const accessibleResidencies = getAccessibleResidencies(userYear);
        const filteredJobs = jobs.filter(job => accessibleResidencies.includes(job.residency));
        const groups = getResidencyGroups(userYear);
        setResidencyGroups(groups);

        const jobGroups: { [key: string]: JobPosting[] } = {};
        groups.forEach(group => {
          jobGroups[group.label] = filteredJobs.filter(job =>
            group.residencies.includes(job.residency)
          );
        });

        setJobsByResidency(jobGroups);
      } catch (error) {
        console.error('Error loading page:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function autoSave(residencyLabel: string, jobs: JobPosting[]) {
    if (autoSaveTimers.current[residencyLabel]) {
      clearTimeout(autoSaveTimers.current[residencyLabel]);
    }
    setSaveStatus(s => ({ ...s, [residencyLabel]: 'saving' }));

    autoSaveTimers.current[residencyLabel] = setTimeout(async () => {
      if (!session) return;
      try {
        const supabase = createClient();
        const userId = session.user.id;

        // Delete existing drafts for this student for these job ids
        const jobIds = jobs.map(j => j.id);
        await supabase
          .from('pre_interview_rankings')
          .delete()
          .eq('student_id', userId)
          .eq('is_draft', true)
          .in('job_posting_id', jobIds);

        // Insert updated draft rankings
        const rows = jobs.map((job, index) => ({
          student_id: userId,
          job_posting_id: job.id,
          rank: index + 1,
          is_draft: true,
        }));

        const { error } = await supabase.from('pre_interview_rankings').insert(rows);

        if (error) {
          console.error('Auto-save error:', error.message);
          setSaveStatus(s => ({ ...s, [residencyLabel]: 'unsaved' }));
        } else {
          setSaveStatus(s => ({ ...s, [residencyLabel]: 'saved' }));
          setLastSaved(s => ({ ...s, [residencyLabel]: new Date() }));
        }
      } catch {
        setSaveStatus(s => ({ ...s, [residencyLabel]: 'unsaved' }));
      }
    }, 800);
  }

  function handleDragEnd(residencyLabel: string) {
    return (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        setJobsByResidency(prev => {
          const jobs = prev[residencyLabel];
          const oldIndex = jobs.findIndex(job => job.id === active.id);
          const newIndex = jobs.findIndex(job => job.id === over.id);
          const newJobs = arrayMove(jobs, oldIndex, newIndex);
          autoSave(residencyLabel, newJobs);
          return { ...prev, [residencyLabel]: newJobs };
        });
      }
    };
  }

  async function handleSubmit(residencyLabel: string) {
    if (!session) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      const jobs = jobsByResidency[residencyLabel];
      const userId = session.user.id;
      const jobIds = jobs.map(j => j.id);

      // Remove any existing submissions for these jobs
      await supabase
        .from('pre_interview_rankings')
        .delete()
        .eq('student_id', userId)
        .in('job_posting_id', jobIds);

      // Insert as final (not draft)
      const rows = jobs.map((job, index) => ({
        student_id: userId,
        job_posting_id: job.id,
        rank: index + 1,
        is_draft: false,
      }));

      const { error } = await supabase.from('pre_interview_rankings').insert(rows);

      if (error) throw error;
      alert(`${residencyLabel} rankings submitted successfully!`);
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Failed to submit ${residencyLabel} rankings`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="pt-24 px-6 max-w-4xl mx-auto"><LoadingSpinner /></main>;
  if (!session) return <main className="pt-24 px-6 max-w-4xl mx-auto"><div className="text-center">Please log in.</div></main>;
  if (!year) return <main className="pt-24 px-6 max-w-4xl mx-auto"><div className="text-center">Your profile does not have a year set. Please contact an administrator.</div></main>;

  return (
    <main className="pt-24 px-6 max-w-4xl mx-auto pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Rank Job Postings</h1>
        <p className="text-black dark:text-white mb-2">
          Drag and drop to rank job postings in order of preference for each residency.
        </p>
      </div>

      {residencyGroups.map(group => {
        const jobs = jobsByResidency[group.label] || [];
        return (
          <div key={group.label} className="mb-12">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">{group.label}</h2>
                <div className="text-sm">
                  {saveStatus[group.label] === 'saving' && <span className="text-gray-400">Saving...</span>}
                  {saveStatus[group.label] === 'saved' && (
                    <span className="text-green-600">✓ Saved {lastSaved[group.label]?.toLocaleTimeString()}</span>
                  )}
                  {saveStatus[group.label] === 'unsaved' && <span className="text-amber-500">Unsaved changes</span>}
                </div>
              </div>
              <div className="border-b border-gray-300 dark:border-gray-600 mb-4"></div>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800">
                <p className="text-gray-600 dark:text-gray-400">No job postings available for {group.label}.</p>
              </div>
            ) : (
              <>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd(group.label)}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-0 mb-6">
                      {jobs.map((job, index) => (
                        <SortableJobItem key={job.id} job={job} rank={index + 1} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <div className="flex gap-4 justify-center mb-8">
                  <button
                    onClick={() => handleSubmit(group.label)}
                    disabled={submitting}
                    className="bg-green-600 text-white px-6 py-2 font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : `Submit ${group.label} Rankings`}
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}

      <div className="mt-8 flex justify-center">
        <button onClick={() => router.back()} className="bg-gray-600 text-white px-8 py-3 font-semibold hover:bg-gray-700">
          Back
        </button>
      </div>
    </main>
  );
}