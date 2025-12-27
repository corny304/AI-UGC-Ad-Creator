'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Zap,
  LayoutDashboard,
  Sparkles,
  Building2,
  FileText,
  CreditCard,
  Settings,
  Users,
} from 'lucide-react'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Generator',
    href: '/generator',
    icon: Sparkles,
  },
  {
    title: 'Brands',
    href: '/brands',
    icon: Building2,
  },
  {
    title: 'Vorlagen',
    href: '/templates',
    icon: FileText,
  },
  {
    title: 'Team',
    href: '/team',
    icon: Users,
  },
  {
    title: 'Abrechnung',
    href: '/billing',
    icon: CreditCard,
  },
  {
    title: 'Einstellungen',
    href: '/settings',
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-background hidden md:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">AdSpark AI</span>
        </Link>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
