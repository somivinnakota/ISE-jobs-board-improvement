'use client';

import { useState, useEffect } from 'react';
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
import {
  useSortable,
  SortableContext as SortableContextType,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { env } from '@/env';
import { createBrowserClient } from '@supabase/ssr';
import { Session } from '@supabase/supabase-js';
import { getUserId } from '@/app/api/user';
import { getStudentYearClient, getUserIdClient } from '@/app/api/client-user';
import { Euro, EuroIcon, GripVertical, House, MapPin, Users } from 'lucide-react';
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
    case 1:
      return [1, '1', 2, '2', '1+2']; // Handle both number and string formats in case db changes
    case 2:
      return [3, '3'];
    case 3:
      return [4, '4'];
    case 4:
      return [5, '5'];
    default:
      return [];
  }
}

function getResidencyGroups(year: number): { label: string; residencies: (number | string)[] }[] {
  switch (year) {
    case 1:
      return [
        { label: 'Residency 1', residencies: [1, '1'] },
        { label: 'Residency 2', residencies: [2, '2'] },
        { label: 'Residency 1+2', residencies: ['1+2'] }
      ];
    case 2:
      return [{ label: 'Residency 3', residencies: [3, '3'] }];
    case 3:
      return [{ label: 'Residency 4', residencies: [4, '4'] }];
    case 4:
      return [{ label: 'Residency 5', residencies: [5, '5'] }];
    default:
      return [];
  }
}

function DragHandle() {
  return (
    <div className="flex flex-col gap-1 p-2 cursor-grab active:cursor-grabbing">
      <GripVertical className='text-gray-600'/>
    </div>
  );
}

function SortableJobItem({ job, rank }: SortableJobItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border shadow-sm ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div className="flex items-center p-4">
        <div className="flex-shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center font-bold mr-4">
          {rank}
        </div>
        
        <div className="flex-shrink-0 w-12 h-12 bg-gray-200 mr-4 overflow-hidden">
          {job.company?.company_profile?.avatar ? (
            <img 
              src={job.company.company_profile.avatar} 
              alt={job.company.name}
              className="w-full h-full object-cover"
            />
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
            <span><EuroIcon size={14} className='inline items-center justify-center mb-0.5' />{job.salary?.toLocaleString()}</span>
            <span><MapPin size={14} className='inline items-center justify-center mb-0.5' /> {job.location}</span>
            <span><Users size={14} className='inline items-center justify-center mb-0.5' /> {job.position_count} position{job.position_count !== 1 ? 's' : ''}</span>
            {job.accommodation_support && <span><House size={14} className='inline items-center justify-center mb-0.5' /> Housing</span>}
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
  const [allJobs, setAllJobs] = useState<JobPosting[]>([]);
  const [jobsByResidency, setJobsByResidency] = useState<{[key: string]: JobPosting[]}>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [studentId, setStudentId] = useState<string>();
  const [year, setYear] = useState<number>();
  const [residencyGroups, setResidencyGroups] = useState<{ label: string; residencies: (number | string)[] }[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    async function fetchJobsAndAuth() {
      try {
        const supabase = createClient()
        
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) {
          console.error('Auth error:', authError);
          return;
        }
        
        setSession(session);

        if (!session) {
          console.error('No session found');
          return;
        }

        const userId = await getUserIdClient();
        if (userId) {
          setStudentId(userId);
        } else {
          throw new Error("Could not find user id");
        }

        const userYear = await getStudentYearClient(userId);
        setYear(userYear);

        // Fetch job postings
        const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/job-postings`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.status}`);
        }

        const jobData = await response.json();
        console.log('Raw job data:', jobData);
        console.log('Sample job residency values:', jobData.slice(0, 3).map((job: JobPosting) => ({ 
          id: job.id, 
          title: job.job_title, 
          residency: job.residency, 
          residencyType: typeof job.residency 
        })));
        setAllJobs(jobData);

        // Filter jobs by accessible residencies
        const accessibleResidencies = getAccessibleResidencies(userYear);
        console.log('Accessible residencies for year', userYear, ':', accessibleResidencies);
        
        const filteredJobs = jobData.filter((job: JobPosting) => 
          accessibleResidencies.includes(job.residency)
        );
        console.log('Filtered jobs:', filteredJobs.length, 'out of', jobData.length);

        // Group jobs by residency groups
        const groups = getResidencyGroups(userYear);
        setResidencyGroups(groups);

        const jobGroups: {[key: string]: JobPosting[]} = {};
        groups.forEach(group => {
          jobGroups[group.label] = filteredJobs.filter((job: JobPosting) => 
            group.residencies.includes(job.residency)
          );
          console.log(`Jobs for ${group.label}:`, jobGroups[group.label].length);
        });

        setJobsByResidency(jobGroups);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        alert('Failed to load job postings');
      } finally {
        setLoading(false);
      }
    }

    fetchJobsAndAuth();
  }, []);

  function handleDragEnd(residencyLabel: string) {
    return (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setJobsByResidency(prev => {
          const jobs = prev[residencyLabel];
          const oldIndex = jobs.findIndex((job) => job.id === active.id);
          const newIndex = jobs.findIndex((job) => job.id === over.id);

          return {
            ...prev,
            [residencyLabel]: arrayMove(jobs, oldIndex, newIndex)
          };
        });
      }
    };
  }

  async function handleSubmit(residencyLabel: string) {
    if (!session) {
      alert('You must be logged in to submit rankings');
      return;
    }

    setSubmitting(true);
    try {
      const jobs = jobsByResidency[residencyLabel];
      const rankings = jobs.map((job, index) => ({
        job_posting_id: job.id,
        rank: index + 1, 
      }));

      console.log(`Submitting rankings for ${residencyLabel}:`, rankings);

      const studentId = await getUserIdClient();
      const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/pre-interview-rankings/${studentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rankings }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit rankings: ${response.status}`);
      }

      alert(`Rankings for ${residencyLabel} submitted successfully!`);
    } catch (error) {
      console.error('Error submitting rankings:', error);
      alert(`Failed to submit rankings for ${residencyLabel}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="pt-24 px-6 max-w-4xl mx-auto">
        <LoadingSpinner />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="pt-24 px-6 max-w-4xl mx-auto">
        <div className="text-center">Please log in to rank job postings.</div>
      </main>
    );
  }

  if (!year) {
    return (
      <main className="pt-24 px-6 max-w-4xl mx-auto">
        <div className="text-center">Unable to determine your year level.</div>
      </main>
    );
  }

  return (
    <main className="pt-24 px-6 max-w-4xl mx-auto pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Rank Job Postings</h1>
        <p className="text-black dark:text-white mb-2">
          Drag and drop to rank the job postings in order of your preference for each residency.
        </p>
      </div>

      {residencyGroups.map(group => {
        const jobs = jobsByResidency[group.label] || [];
        
        return (
          <div key={group.label} className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
                {group.label}
              </h2>
              <div className="border-b border-gray-300 dark:border-gray-600 mb-4"></div>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800">
                <p className="text-gray-600 dark:text-gray-400">
                  No job postings available for {group.label}.
                </p>
              </div>
            ) : (
              <>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd(group.label)}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext 
                    items={jobs.map(job => job.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-0 mb-6">
                      {jobs.map((job, index) => (
                        <SortableJobItem
                          key={job.id}
                          job={job}
                          rank={index + 1}
                        />
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
        <button
          onClick={() => router.back()}
          className="bg-gray-600 text-white px-8 py-3 font-semibold hover:bg-gray-700"
        >
          Back
        </button>
      </div>
    </main>
  );
}