import React from "react";
import AuthGuard from "@/components/auth/auth-guard";


export default async function RpDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["student", "admin"]}>
        {children}
    </AuthGuard>
  );
}
