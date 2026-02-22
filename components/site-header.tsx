"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Heart } from 'lucide-react'

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  chat: "Chat",
  pipeline: "Pipeline",
  calendar: "Calendar",
  customers: "Customers",
  "sales-leads": "Sales Leads",
  settings: "Settings",
  "ai-agents": "AI Agents",
  "phone-numbers": "Phone Numbers",
  "coming-soon": "Bientôt disponible",
}

function getSegmentLabel(segment: string) {
  return ROUTE_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
}

export function SiteHeader() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {segments.length === 0 ? (
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              segments.flatMap((segment, index) => {
                const href = "/" + segments.slice(0, index + 1).join("/")
                const label = getSegmentLabel(segment)
                const isLast = index === segments.length - 1

                return [
                  index > 0 ? <BreadcrumbSeparator key={`sep-${href}`} /> : null,
                  <BreadcrumbItem key={href}>
                    {isLast ? (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>,
                ].filter(Boolean)
              })
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
         <Heart className="size-4 text-red-500" />
            <span className="text-sm font-medium">Upgrade to Pro</span>
        </div>
      </div>
    </header>
  )
}
