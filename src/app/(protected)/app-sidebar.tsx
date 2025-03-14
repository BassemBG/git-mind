'use client'
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react"

import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Presentation,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
]

const projects = [
    {
      name: "Project 1",
      url: "/project/",
      icon: LayoutDashboard,
    },
    {
      name: "Project 2",
      url: "/qa",
      icon: Bot,
    },
    {
      name: "Project 3",
      url: "/meetings",
      icon: Presentation,
    },
    {
      name: "Project 4",
      url: "/billing",
      icon: CreditCard,
    },
  ]

export function AppSidebar() {
    const pathname = usePathname();
    const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="floating">
        <SidebarHeader>
            <div className="flex items-center gap-2">
                <Image src='/logo.webp' alt="Logo" width={40} height={40}/>
                { open && (
                    <h1 className="text-xl font-bold text-primary/80">
                        GitMind
                    </h1>
                )}
            </div>
        </SidebarHeader>
        <SidebarContent>
            {/* Application Section */}
            <SidebarGroup>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                            <Link href={item.url} className={cn({
                                '!bg-primary !text-white': pathname === item.url,
                            })}>
                                <item.icon />
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            {/* Projects Section */}
            <SidebarGroup>
                <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                    {projects.map((project) => (
                        <SidebarMenuItem key={project.name}>
                        <SidebarMenuButton asChild>
                            {/* Project menu item */}
                            <div>
                                {/* Project Icon */}
                                <div className={cn(
                                    'rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary p-1',
                                    {
                                        'bg-primary text-white': true
                                        // 'bg-primary text-white': projects.id === projects.id
                                    }
                                )}>
                                    {project.name[0]}
                                </div>
                                {/* Project Name */}
                                <span>{project.name}</span>
                            </div>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    <div className="h-2"></div>
                    {open && (
                        <SidebarMenuItem>
                            <Link href='/create'>
                                <Button size='sm' variant={'outline'} className="w-fit"> 
                                    <Plus/>
                                    Create Project
                                </Button>
                            </Link>
                        </SidebarMenuItem>
                        
                    )}
                    
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>


        </SidebarContent>
    </Sidebar>
  )
}

  