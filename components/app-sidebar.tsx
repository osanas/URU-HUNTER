"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconCamera,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconPhone,
  IconReport,
  IconRobot,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react"
import {
  BarChart3,
  Calendar,
  MessageCircleMore,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react"

import { NavDocuments } from '@/components/nav-documents'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    avatar: string
  }
  unreadCount?: number
}

export function AppSidebar({ user, unreadCount = 0, ...props }: AppSidebarProps) {
  const userData = user || data.user
  const pathname = usePathname()

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Pipeline (Soon)",
      url: "/dashboard/coming-soon",
      icon: Workflow,
      isActive: pathname === "/dashboard/pipeline" || pathname.startsWith("/dashboard/pipeline/"),
    },
    {
      title: "Calendar (Soon)",
      url: "/dashboard/coming-soon",
      icon: Calendar,
      isActive: pathname === "/dashboard/calendar" || pathname.startsWith("/dashboard/calendar/"),
    },
    {
      title: "Chat",
      url: "/dashboard/chat",
      icon: MessageCircleMore,
      isActive: pathname === "/dashboard/chat" || pathname.startsWith("/dashboard/chat/"),
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      title: "Leads",
      header: true,
    },
    {
      title: "Customers (Soon)",
      url: "/dashboard/coming-soon",
      icon: Users,
      isActive: pathname === "/dashboard/customers",
    },
    {
      title: "Sales Leads (Soon)",
      url: "/dashboard/coming-soon",
      icon: TrendingUp,
      isActive: pathname === "/dashboard/sales-leads" || pathname.startsWith("/dashboard/sales-leads/"),
    },
    {
      title: "Build",
      header: true,
    },
    {
      title: "AI Agents (Soon)",
      url: "/dashboard/coming-soon",
      icon: IconRobot,
      isActive: pathname === "/dashboard/ai-agents",
    },
    {
      title: "Phone Numbers (Soon)",
      url: "/dashboard/coming-soon",
      icon: IconPhone,
      isActive: pathname === "/dashboard/phone-numbers",
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Uru Hunter</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
