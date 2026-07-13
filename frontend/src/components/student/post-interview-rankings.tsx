"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { GripVertical, Euro, MapPin, Users, Home } from "lucide-react";
import { createClient } from "@/lib/client";
import { env } from "@/env";

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

interface SortableJobItemProps {
    job: JobPosting;
    rank: number;
}

// Drag handle component
function DragHandle() {
    return (
        <div className="flex flex-col gap-1 p-2 cursor-grab active:cursor-grabbing">
            <GripVertical className="text-gray-600" />
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
                isDragging ? "opacity-50 shadow-lg" : ""
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
                            {job.company?.name?.charAt(0) || "C"}
                        </div>
                    )}
                </div>

                <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-gray-800">
                        {job.job_title}
                    </h3>
                    <p className="text-gray-600 mb-2">{job.company?.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Euro className="w-4 h-4" />
                            <span>{job.salary?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>
                                {job.position_count} position
                                {job.position_count !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <span>Residency {job.residency}</span>
                        {job.accommodation_support && (
                            <div className="flex items-center gap-1">
                                <Home className="w-4 h-4" />
                                <span>Housing</span>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    {...attributes}
                    {...listeners}
                    className="flex-shrink-0 ml-4"
                >
                    <DragHandle />
                </div>
            </div>
        </div>
    );
}

interface StudentJobRankingProps {
    studentId: string;
}

export default function StudentJobRanking({
    studentId,
}: StudentJobRankingProps) {
    const router = useRouter();
    const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    useEffect(() => {
        async function fetchInterviewedJobs() {
            try {
                setLoading(true);
                setError(null);

                const supabase = createClient();

                const {
                    data: { session },
                    error: authError,
                } = await supabase.auth.getSession();
                const token = session?.access_token;

                if (!token) {
                    throw new Error("No authentication token found");
                }

                const response = await fetch(
                    `${env.NEXT_PUBLIC_API_URL}/student/${studentId}/interviewed-jobs`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch interviewed jobs: ${response.status}`,
                    );
                }

                const jobData = await response.json();
                setJobPostings(jobData);
            } catch (error) {
                console.error("Error fetching interviewed jobs:", error);
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load data",
                );
            } finally {
                setLoading(false);
            }
        }

        if (studentId) {
            fetchInterviewedJobs();
        }
    }, [studentId]);

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setJobPostings((prev) => {
                const oldIndex = prev.findIndex((job) => job.id === active.id);
                const newIndex = prev.findIndex((job) => job.id === over.id);

                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    }

    async function handleSubmit() {
        setSubmitting(true);
        try {
            const rankings = jobPostings.map((job, index) => ({
                student_id: studentId,
                job_posting_id: job.id,
                rank: index + 1,
                type: "student",
            }));

            console.log("Submitting student job rankings:", rankings);

            const supabase = createClient();
            const {
                data: { session },
                error: authError,
            } = await supabase.auth.getSession();

            if (authError) {
                throw new Error(`Auth error: ${authError.message}`);
            }

            const token = session?.access_token;

            const response = await fetch(
                `${env.NEXT_PUBLIC_API_URL}/post-interview-rankings`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }, 
                    body: JSON.stringify(rankings), 
                },
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Failed to submit rankings: ${response.status} - ${errorText}`,
                );
            }

            alert("Your job preferences have been submitted successfully!");
        } catch (error) {
            console.error("Error submitting rankings:", error);
            alert(
                `Failed to submit your job preferences: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <main className="pt-24 px-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin h-12 w-12 border-b-2 border-black"></div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="pt-24 px-6 max-w-4xl mx-auto">
                <div className="text-center py-12">
                    <div className="text-red-600 font-semibold mb-4">
                        Error Loading Data
                    </div>
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
            <div className="mb-14">
                <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                    Rank Your Interview Preferences
                </h1>
                <p className="text-black dark:text-white mb-4">
                    Drag and drop to rank the job postings you've interviewed
                    for in order of your preference.
                </p>
            </div>

            {jobPostings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800">
                    <p className="text-gray-600 dark:text-gray-400">
                        You haven't interviewed for any job postings yet.
                    </p>
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
                            Jobs You've Interviewed For ({jobPostings.length})
                        </h2>
                        <div className="border-b border-gray-300 dark:border-gray-600 mb-6"></div>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}
                    >
                        <SortableContext
                            items={jobPostings.map((job) => job.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-0 mb-8">
                                {jobPostings.map((job, index) => (
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
                            onClick={handleSubmit}
                            disabled={submitting || jobPostings.length === 0}
                            className="bg-green-600 text-white px-8 py-3 font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting
                                ? "Submitting..."
                                : "Submit My Preferences"}
                        </button>
                    </div>
                </>
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
