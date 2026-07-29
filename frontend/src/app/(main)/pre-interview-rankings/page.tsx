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
    company_profile: { avatar: string };
  };
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

function getResidencyGroups(year: number) {
  switch (year) {
    case 1: return [
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

function SortableJobItem({ job, rank }: { job: JobPosting; rank: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}
      className={`bg-white border shadow-sm ${isDragging ? 'opacity-50 shadow-lg' : ''}`}>
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
            {job.salary > 0 && <span><EuroIcon size={14} className="inline mb-0.5" />{job.salary?.toLocaleString()}</span>}
            <span><MapPin size={14} className="inline mb-0.5" /> {job.location}</span>
            <span><Users size={14} className="inline mb-0.5" /> {job.position_count} position{job.position_count !== 1 ? 's' : ''}</span>
            {job.accommodation_support && <span><House size={14} className="inline mb-0.5" /> Housing</span>}
          </div>
        </div>
        <div {...attributes} {...listeners} className="flex-shrink-0 ml-4 cursor-grab active:cursor-grabbing">
          <GripVertical className="text-gray-600" />
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
  const [submitted, setSubmitted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoading(false); return; }
        setSession(session);

        const { data: profile } = await supabase
       .from('profiles')
       .select('year, pre_interview_submitted')
       .eq('id', session.user.id)
       .single();

if (profile?.pre_interview_submitted) {
  setSubmitted(true);
}

        if (!profile?.year) { setLoading(false); return; }
        const userYear = profile.year;
        setYear(userYear);

        const { data: jobData } = await supabase
          .from('job_postings')
          .select(`
            id, job_title, salary, accommodation_support,
            position_count, location, residency,
            companies ( name, company_profiles ( avatar ) )
          `)
          .eq('status', 'approved');

        const jobs: JobPosting[] = (jobData ?? []).map((j: any) => ({
          ...j,
          company: {
            name: j.companies?.name ?? '',
            company_profile: { avatar: j.companies?.company_profiles?.[0]?.avatar ?? '' },
          },
        }));

        const accessible = getAccessibleResidencies(userYear);
        const filtered = jobs.filter(job => accessible.includes(job.residency));
        const groups = getResidencyGroups(userYear);
        setResidencyGroups(groups);

        // Load any saved draft rankings to restore order
const { data: savedRankings } = await supabase
  .from('pre_interview_rankings')
  .select('job_posting_id, rank')
  .eq('student_id', session.user.id)
  .eq('is_draft', true)
  .order('rank', { ascending: true });

const rankMap = new Map(
  (savedRankings ?? []).map(r => [r.job_posting_id, r.rank])
);

const grouped: { [key: string]: JobPosting[] } = {};
groups.forEach(g => {
  const groupJobs = filtered.filter(job => g.residencies.includes(job.residency));
  
  // If we have saved rankings for this group, sort by them
  if (savedRankings && savedRankings.length > 0) {
    groupJobs.sort((a, b) => {
      const rankA = rankMap.get(a.id) ?? 999;
      const rankB = rankMap.get(b.id) ?? 999;
      return rankA - rankB;
    });
  }
  
  grouped[g.label] = groupJobs;
});
      setJobsByResidency(grouped);
      } catch (err) {
        console.error('Error loading rankings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function autoSave(label: string, jobs: JobPosting[]) {
    if (autoSaveTimers.current[label]) clearTimeout(autoSaveTimers.current[label]);
    setSaveStatus(s => ({ ...s, [label]: 'saving' }));
    autoSaveTimers.current[label] = setTimeout(async () => {
      if (!session) return;
      try {
        const supabase = createClient();
        const userId = session.user.id;
        const jobIds = jobs.map(j => j.id);
        await supabase.from('pre_interview_rankings').delete()
          .eq('student_id', userId).eq('is_draft', true).in('job_posting_id', jobIds);
        const rows = jobs.map((job, i) => ({
          student_id: userId, job_posting_id: job.id, rank: i + 1, is_draft: true,
        }));
        const { error } = await supabase.from('pre_interview_rankings').insert(rows);
        if (error) throw error;
        setSaveStatus(s => ({ ...s, [label]: 'saved' }));
        setLastSaved(s => ({ ...s, [label]: new Date() }));
      } catch {
        setSaveStatus(s => ({ ...s, [label]: 'unsaved' }));
      }
    }, 800);
  }

  function handleDragEnd(label: string) {
    return (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        setJobsByResidency(prev => {
          const jobs = prev[label];
          const newJobs = arrayMove(jobs,
            jobs.findIndex(j => j.id === active.id),
            jobs.findIndex(j => j.id === over.id)
          );
          autoSave(label, newJobs);
          return { ...prev, [label]: newJobs };
        });
      }
    };
  }

  async function handleSubmit(label: string) {
  if (!session) return;
  setSubmitting(true);
  try {
    const supabase = createClient();
    const jobs = jobsByResidency[label];
    const userId = session.user.id;
    const jobIds = jobs.map(j => j.id);

    await supabase
      .from('pre_interview_rankings')
      .delete()
      .eq('student_id', userId)
      .in('job_posting_id', jobIds);

    const { error } = await supabase.from('pre_interview_rankings').insert(
      jobs.map((job, index) => ({
        student_id: userId,
        job_posting_id: job.id,
        rank: index + 1,
        is_draft: false,
      }))
    );

    if (error) throw error;

    // Lock the submission
    await supabase
      .from('profiles')
      .update({ pre_interview_submitted: true })
      .eq('id', userId);

    setSubmitted(true);
    alert(`${label} rankings submitted and locked!`);
  } catch (error) {
    console.error('Submit error:', error);
    alert(`Failed to submit ${label} rankings`);
  } finally {
    setSubmitting(false);
  }
}

  if (loading) return <main className="pt-28 px-6 max-w-4xl mx-auto"><LoadingSpinner /></main>;
  if (!session) return <main className="pt-28 px-6 max-w-4xl mx-auto"><p className="text-center">Please log in.</p></main>;
  if (!year) return <main className="pt-28 px-6 max-w-4xl mx-auto"><p className="text-center">Your profile does not have a year set. Please contact an administrator.</p></main>;
  if (submitted) {
  return (
    <main className="pt-28 px-6 max-w-4xl mx-auto pb-8">
      <div className="bg-black border border-green-800 p-8 text-center">
        <div className="text-green-400 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-white mb-2">Rankings Submitted</h1>
        <p className="text-neutral-400 mb-6">
          Your pre-interview rankings have been submitted and locked. 
          Please contact an ISE administrator if you need to make changes.
        </p>
        <a href="/" className="bg-white text-black px-6 py-2 font-semibold hover:bg-neutral-200">
          Back to Home
        </a>
      </div>
    </main>
  );
}

  return (
    <main className="pt-28 px-6 max-w-4xl mx-auto pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Rank Job Postings</h1>
        <p className="text-black dark:text-white">Drag and drop to rank in order of preference.</p>
      </div>

      {residencyGroups.map(group => {
        const jobs = jobsByResidency[group.label] || [];
        return (
          <div key={group.label} className="mb-12">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-semibold text-black dark:text-white">{group.label}</h2>
              <div className="text-sm">
                {saveStatus[group.label] === 'saving' && <span className="text-gray-400">Saving...</span>}
                {saveStatus[group.label] === 'saved' && <span className="text-green-600">✓ Saved {lastSaved[group.label]?.toLocaleTimeString()}</span>}
                {saveStatus[group.label] === 'unsaved' && <span className="text-amber-500">Unsaved changes</span>}
              </div>
            </div>
            <div className="border-b border-gray-300 dark:border-gray-600 mb-4" />

            {jobs.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800">
                <p className="text-gray-500">No job postings available for {group.label}.</p>
              </div>
            ) : (
              <>
                <DndContext sensors={sensors} collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd(group.label)} modifiers={[restrictToVerticalAxis]}>
                  <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-0 mb-6">
                      {jobs.map((job, i) => <SortableJobItem key={job.id} job={job} rank={i + 1} />)}
                    </div>
                  </SortableContext>
                </DndContext>
                <div className="flex justify-center mb-8">
                  <button onClick={() => handleSubmit(group.label)} disabled={submitting}
                    className="bg-green-600 text-white px-6 py-2 font-semibold hover:bg-green-700 disabled:opacity-50">
                    {submitting ? 'Submitting...' : `Submit ${group.label} Rankings`}
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}

      <div className="flex justify-center mt-8">
        <button onClick={() => router.back()} className="bg-gray-600 text-white px-8 py-3 font-semibold hover:bg-gray-700">
          Back
        </button>
      </div>
    </main>
  );
}