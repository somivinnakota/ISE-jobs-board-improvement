'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { GripVertical, User, Mail } from 'lucide-react';
import { createClient } from '@/lib/client';
import { env } from '@/env';

// Types
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

interface Candidate {
  student_id: string;
  student_name: string;
  email: string;
  job_posting_id: string;
  job_title: string;
}

interface SortableCandidateItemProps {
  candidate: Candidate;
  rank: number;
}

// Drag handle component
function DragHandle() {
  return (
    <div className="flex flex-col gap-1 p-2 cursor-grab active:cursor-grabbing">
      <GripVertical className='text-gray-600'/>
    </div>
  );
}

function SortableCandidateItem({ candidate, rank }: SortableCandidateItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.student_id });

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
        
        <div className="flex-shrink-0 w-12 h-12 bg-gray-200 mr-4 flex items-center justify-center">
          <User className="w-6 h-6 text-gray-600" />
        </div>

        <div className="flex-grow">
          <h3 className="font-semibold text-lg text-gray-800">{candidate.student_name}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{candidate.email}</span>
          </div>
        </div>

        <div {...attributes} {...listeners} className="flex-shrink-0 ml-4">
          <DragHandle />
        </div>
      </div>
    </div>
  );
}

interface RankCandidatesProps {
  companyId: string;
}

export default function RankCandidates({ companyId }: RankCandidatesProps) {
  const router = useRouter();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [candidatesByJobPosting, setCandidatesByJobPosting] = useState<{[key: string]: Candidate[]}>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient()
        const {
            data: { session },
            error
        } = await supabase.auth.getSession()
        const token = session?.access_token

        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch job postings for the company
        const jobResponse = await fetch(`${env.NEXT_PUBLIC_API_URL}/job-postings/company/${companyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!jobResponse.ok) {
          throw new Error(`Failed to fetch job postings: ${jobResponse.status}`);
        }

        const jobData = await jobResponse.json();
        setJobPostings(jobData);

        // Fetch candidates for the company
        const candidatesResponse = await fetch(`${env.NEXT_PUBLIC_API_URL}/company/${companyId}/candidates`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!candidatesResponse.ok) {
          throw new Error(`Failed to fetch candidates: ${candidatesResponse.status}`);
        }

        const candidatesData = await candidatesResponse.json();
        
        // Group candidates by job posting
        const groupedCandidates: {[key: string]: Candidate[]} = {};
        candidatesData.forEach((candidate: Candidate) => {
          if (!groupedCandidates[candidate.job_posting_id]) {
            groupedCandidates[candidate.job_posting_id] = [];
          }
          groupedCandidates[candidate.job_posting_id].push(candidate);
        });

        setCandidatesByJobPosting(groupedCandidates);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  function handleDragEnd(jobPostingId: string) {
    return (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setCandidatesByJobPosting(prev => {
          const candidates = prev[jobPostingId];
          const oldIndex = candidates.findIndex((candidate) => candidate.student_id === active.id);
          const newIndex = candidates.findIndex((candidate) => candidate.student_id === over.id);

          return {
            ...prev,
            [jobPostingId]: arrayMove(candidates, oldIndex, newIndex)
          };
        });
      }
    };
  }

  async function handleSubmit(jobPostingId: string, jobTitle: string) {
    setSubmitting(true);
    try {
      const candidates = candidatesByJobPosting[jobPostingId];
      const rankings = candidates.map((candidate, index) => ({
        student_id: candidate.student_id,
        job_posting_id: jobPostingId,
        rank: index + 1,
        type: 'partner' //The partner is ranking the students in this case
      }));

      console.log(`Submitting rankings for ${jobTitle}:`, rankings);

      const supabase = createClient()
      const {
          data: { session },
          error
      } = await supabase.auth.getSession()        
      const token = session?.access_token

      const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/post-interview-rankings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rankings }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit rankings: ${response.status}`);
      }

      alert(`Rankings for ${jobTitle} submitted successfully!`);
    } catch (error) {
      console.error('Error submitting rankings:', error);
      alert(`Failed to submit rankings for ${jobTitle}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="pt-24 px-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <span>Loading...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pt-24 px-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-600 font-semibold mb-4">Error Loading Data</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 px-6 max-w-4xl mx-auto pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Rank Candidates</h1>
        <p className="text-black dark:text-white mb-4">
          Drag and drop to rank candidates in order of your preference for each job posting.
        </p>
      </div>

      {jobPostings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            No job postings found for this company.
          </p>
        </div>
      ) : (
        jobPostings.map(jobPosting => {
          const candidates = candidatesByJobPosting[jobPosting.id] || [];
          
          return (
            <div key={jobPosting.id} className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-2">
                  {jobPosting.job_title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>€{jobPosting.salary?.toLocaleString()}</span>
                  <span>⚲ {jobPosting.location}</span>
                  <span># {jobPosting.position_count} position{jobPosting.position_count !== 1 ? 's' : ''}</span>
                  <span>Residency {jobPosting.residency}</span>
                  {jobPosting.accommodation_support && <span>🏠 Housing</span>}
                </div>
                <div className="border-b border-gray-300 dark:border-gray-600 mb-4"></div>
              </div>

              {candidates.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 mb-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    No candidates found for this job posting.
                  </p>
                </div>
              ) : (
                <>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd(jobPosting.id)}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext 
                      items={candidates.map(candidate => candidate.student_id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-0 mb-6">
                        {candidates.map((candidate, index) => (
                          <SortableCandidateItem
                            key={candidate.student_id}
                            candidate={candidate}
                            rank={index + 1}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  <div className="flex gap-4 justify-center mb-8">
                    <button
                      onClick={() => handleSubmit(jobPosting.id, jobPosting.job_title)}
                      disabled={submitting}
                      className="bg-green-600 text-white px-6 py-2 font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : `Submit Rankings for ${jobPosting.job_title}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })
      )}

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