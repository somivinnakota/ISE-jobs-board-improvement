import { getRole } from "@/app/api/user";
import { redirect } from "next/navigation";
import React from "react";

interface AuthGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default async function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const role = await getRole();
  
  console.log("=== AUTH GUARD DEBUG ===");
  console.log("Role returned:", role);
  console.log("Allowed roles:", allowedRoles);
  console.log("Has access:", role ? allowedRoles.includes(role) : false);

  if (!role || !allowedRoles.includes(role)) {
    console.log("REDIRECTING TO ACCESS DENIED");
    redirect("/access-denied");
  }

  return <>{children}</>;
}