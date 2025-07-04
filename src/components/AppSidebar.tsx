
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  FileText, 
  BarChart3, 
  ChevronRight,
  FileSearch
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    description: "Visão geral do sistema"
  },
  {
    title: "Análise de Contratos",
    url: "/analise",
    icon: FileSearch,
    description: "Analisar novos contratos"
  },
  {
    title: "Contratos Base",
    url: "/contratos-base",
    icon: FileText,
    description: "Biblioteca de contratos"
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BarChart3,
    description: "Estatísticas e relatórios"
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavClassName = (path: string) => {
    const baseClasses = "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]";
    
    if (isActive(path)) {
      return `${baseClasses} bg-gradient-to-r from-primary to-primary text-white shadow-colored`;
    }
    
    return `${baseClasses} text-sidebar-foreground hover:bg-primary/10 hover:text-slate-900`;
  };

  return (
    <Sidebar className="border-r border-sidebar-border shadow-sm">
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-colored">
            <FileSearch className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-sidebar-foreground">
                CIABRASNET
              </h2>
              <p className="text-xs text-muted-foreground">
                Análise de Contratos
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
            {!isCollapsed && "Navegação Principal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClassName(item.url)}
                      title={isCollapsed ? item.title : item.description}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {isActive(item.url) && (
                            <ChevronRight className="h-4 w-4 opacity-60" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {!isCollapsed && (
            <>
              <div className="h-2 w-2 rounded-full bg-whatsapp animate-pulse" />
              <span>Sistema Online</span>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
