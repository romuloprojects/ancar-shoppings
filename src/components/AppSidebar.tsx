import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  CircleHelp,
  FileText,
  Home,
  Leaf,
  LogOut,
  Settings,
  Store,
  Trophy,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Visão Geral", url: "/", icon: Home },
  { title: "Shoppings", url: "/shoppings", icon: Store },
  { title: "Ranking", url: "/ranking", icon: Trophy },
  { title: "Análises", url: "/analises", icon: BarChart3 },
  { title: "ESG", url: "/esg", icon: Leaf },
  { title: "Alertas", url: "/alertas", icon: Bell },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

const navigationButtonClass =
  "mx-auto !h-11 !w-11 justify-center !rounded-xl !p-0 text-sidebar-foreground/65 transition-all duration-200 hover:bg-sidebar-accent/75 hover:text-sidebar-foreground data-[active=true]:bg-primary/15 data-[active=true]:text-primary data-[active=true]:shadow-[inset_0_0_0_1px_oklch(0.78_0.16_190/22%),0_0_24px_-12px_oklch(0.78_0.16_190/80%)] md:[&>span]:hidden";

export function AppSidebar() {
  const { isMobile, state } = useSidebar();
  const compact = state === "collapsed" && !isMobile;
  const pathname = useRouterState({ select: (routerState) => routerState.location.pathname });
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/75">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border/70 px-2 py-0">
        <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[color-mix(in_oklab,var(--accent-cyan)_88%,white)] to-[var(--accent-blue)] shadow-[0_8px_28px_-14px_oklch(0.82_0.16_195/85%)] md:flex">
          <Activity className="h-5 w-5 text-[var(--sidebar)]" strokeWidth={2.4} />
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[color-mix(in_oklab,var(--accent-cyan)_88%,white)] to-[var(--accent-blue)] shadow-[0_8px_28px_-14px_oklch(0.82_0.16_195/85%)] md:hidden">
          <Activity className="h-5 w-5 text-[var(--sidebar)]" strokeWidth={2.4} />
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup className="px-2 py-4 md:py-5">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5 md:items-center md:gap-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.url} className="w-full md:flex md:justify-center">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className={navigationButtonClass}
                  >
                    <Link
                      to={item.url}
                      aria-label={compact ? item.title : undefined}
                      className="flex items-center gap-3 md:justify-center"
                    >
                      <item.icon className="!h-[19px] !w-[19px]" strokeWidth={1.8} />
                      {!compact && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 px-2 py-3">
        <SidebarMenu className="gap-1.5 md:items-center">
          <SidebarMenuItem className="w-full md:flex md:justify-center">
            <SidebarMenuButton tooltip="Ajuda" className={navigationButtonClass}>
              <CircleHelp className="!h-[19px] !w-[19px]" strokeWidth={1.8} />
              {!compact && <span>Ajuda</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="w-full md:flex md:justify-center">
            <SidebarMenuButton tooltip="Sair" className={navigationButtonClass}>
              <LogOut className="!h-[19px] !w-[19px]" strokeWidth={1.8} />
              {!compact && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
