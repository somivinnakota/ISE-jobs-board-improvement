"use client"

import Image from "next/image";
import { useState } from "react";

export const SuspensedImage = ({ imageURL }: { imageURL: string }) => {
  const [loaded, setLoaded] = useState(false);

  if (imageURL == null) {
    return (
      <div className="relative h-64 w-64">
        {
          !loaded && (
            <div className="absolute inset-0 animate-pulse rounded-full bg-muted" />
          )
        }
        <Image
          className={`${loaded ? "opacity-100" : "opacity-0"} rounded-full border-2 border-black transition-opacity duration-500 dark:border-white`}
          src={"https://skzqkbzsakzybrclflnm.supabase.co/storage/v1/object/sign/avatars/placeholder.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InN0b3JhZ2UtdXJsLXNpZ25pbmcta2V5XzFmMDBmOTRlLWQ1MzMtNDE4MS04ZmVhLTUxMWNkZmY1MjU0NSJ9.eyJ1cmwiOiJhdmF0YXJzL3BsYWNlaG9sZGVyLnBuZyIsImlhdCI6MTc0ODM2NDgzNiwiZXhwIjoxNzc5OTAwODM2fQ.DSdFpnWuy0ha-wlSnkbXbDb1YTSq7lu3-GMCP3EnkJE"}
          alt="Placeholder image"
          fill={true}
          onLoadingComplete={() => setLoaded(true)}
        />
      </div>
    )
  } else {
    return (
      <div className="relative h-64 w-64">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse rounded-full bg-muted" />
        )}
        <Image
          className={`${loaded ? "opacity-100" : "opacity-0"} rounded-full border-2 border-black transition-opacity duration-500 dark:border-white`}
          src={imageURL}
          alt="Image of the student"
          fill={true}
          onLoadingComplete={() => setLoaded(true)}
        />
      </div>
    )
  }
}
