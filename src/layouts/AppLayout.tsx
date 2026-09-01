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
      <div className="flex min-h-svh w-full min-w-0 overflow-x-clip">
        <AppSidebar />
        <SidebarInset className="min-w-0 bg-transparent">
          <DashboardRuntimeProvider>
            <TopBar />
            <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 lg:px-5 lg:py-5 2xl:px-6">{children}</main>
          </DashboardRuntimeProvider>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
