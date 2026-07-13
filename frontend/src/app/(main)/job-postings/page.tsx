import ServerJobPosting from "@/components/job-posting/server-job-postings"
import React, { Suspense } from "react"

const FallbackPage = () => (
  <div className="flex w-screen flex-col px-8 pt-16 md:pt-20">
    <div className="pt-28">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
        <div className="h-64 bg-neutral-200 animate-pulse" />
      </div>
    </div>
  </div>
)

export default async function JobsBoard() {
  return (
    <Suspense fallback={<FallbackPage />}>
      <ServerJobPosting />
    </Suspense>
  )
}
