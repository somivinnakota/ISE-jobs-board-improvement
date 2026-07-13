// /app/components/AuthGuard.tsx
import { getRole } from "@/app/api/user";
import { redirect } from "next/navigation";
import React from "react";

interface AuthGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default async function AuthGuard({ allowedRoles, children }: AuthGuardProps) {

  const role = await getRole();

  if (!role || !allowedRoles.includes(role)) {
    redirect("/access-denied");
  }

  // otherwise render the protected content
  return <>{children}</>;
}
