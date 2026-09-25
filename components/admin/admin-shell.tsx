"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
        <div className="sticky top-0 h-screen">
          <AdminSidebar />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader title="Админ панел" />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}