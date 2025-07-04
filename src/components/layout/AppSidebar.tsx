import { Home, Leaf, Wifi, Shield, FileText, MessageSquare, BarChart3, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
const navigationItems = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: Home
}, {
  title: "Farm Management",
  url: "/farms",
  icon: Leaf
}, {
  title: "IoT Monitoring",
  url: "/iot",
  icon: Wifi
}, {
  title: "Compliance Center",
  url: "/compliance",
  icon: Shield
}, {
  title: "Export Documents",
  url: "/export",
  icon: FileText
}, {
  title: "AI Assistant",
  url: "/assistant",
  icon: MessageSquare
}, {
  title: "Analytics",
  url: "/analytics",
  icon: BarChart3
}, {
  title: "Settings",
  url: "/settings",
  icon: Settings
}];
export function AppSidebar() {
  return <Sidebar collapsible="icon">
      <SidebarContent className="bg-gray-50">
        <SidebarGroup>
          <SidebarGroupLabel>Agricultural Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={({
                  isActive
                }) => isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"}>
                      <item.icon className="h-4 w-4 bg-slate-950" />
                      <span className="text-slate-950">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}