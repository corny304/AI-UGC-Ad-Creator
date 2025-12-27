import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/nav'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen flex">
      <DashboardNav />
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={session.user} />
        <main className="flex-1 p-6 bg-muted/30">{children}</main>
      </div>
    </div>
  )
}
