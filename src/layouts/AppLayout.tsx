import type { CSSProperties, ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { DashboardRuntimeProvider } from "@/contexts/DashboardRuntimeProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

const sidebarVariables = {
  "--sidebar-width": "17rem",
  "--sidebar-width-icon": "4.25rem",
} as CSSProperties;

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider open={false} style={sidebarVariables}>
      <div className="flex min-h-svh w-full overflow-x-hidden">
        <AppSidebar />
        <SidebarInset className="min-w-0 bg-transparent">
          <DashboardRuntimeProvider>
            <TopBar />
            <main className="flex-1 px-4 py-4 sm:px-5 lg:px-6 lg:py-5">{children}</main>
          </DashboardRuntimeProvider>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
