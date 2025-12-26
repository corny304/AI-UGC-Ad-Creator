import Link from 'next/link'
import { getSession, getCurrentTeam } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCredits, formatDate } from '@/lib/utils'
import { Sparkles, Building2, FileText, TrendingUp, ArrowRight, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getSession()
  const team = await getCurrentTeam()

  if (!team) {
    return <div>Team nicht gefunden</div>
  }

  // Get stats
  const [generationCount, brandCount, recentGenerations] = await Promise.all([
    db.generation.count({
      where: { teamId: team.id },
    }),
    db.brand.count({
      where: { teamId: team.id },
    }),
    db.generation.findMany({
      where: { teamId: team.id },
      include: { brand: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const stats = [
    {
      title: 'Credits',
      value: formatCredits(team.credits),
      icon: Sparkles,
      href: '/billing',
    },
    {
      title: 'Generierungen',
      value: generationCount.toString(),
      icon: FileText,
      href: '/generator',
    },
    {
      title: 'Brands',
      value: brandCount.toString(),
      icon: Building2,
      href: '/brands',
    },
  ]

  const statusColors = {
    PENDING: 'secondary',
    PROCESSING: 'warning',
    COMPLETED: 'success',
    FAILED: 'destructive',
  } as const

  const statusLabels = {
    PENDING: 'Wartend',
    PROCESSING: 'In Bearbeitung',
    COMPLETED: 'Fertig',
    FAILED: 'Fehlgeschlagen',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Willkommen zurueck, {session?.user.name}</p>
        </div>
        <Link href="/generator">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Neues Creative Pack
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schnellstart</CardTitle>
            <CardDescription>Erstelle dein erstes Creative Pack</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {brandCount === 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Erstelle zuerst eine Brand, um loszulegen.
                </p>
                <Link href="/brands/new">
                  <Button className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Brand erstellen
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Du hast {brandCount} Brand{brandCount > 1 ? 's' : ''}. Starte eine neue Generierung.
                </p>
                <Link href="/generator">
                  <Button className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Zum Generator
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credits auffuellen</CardTitle>
            <CardDescription>Kaufe mehr Credits oder upgrade deinen Plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{formatCredits(team.credits)}</span>
              <span className="text-muted-foreground">Credits verfuegbar</span>
            </div>
            <Link href="/billing">
              <Button variant="outline" className="gap-2">
                Credits kaufen
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Generations */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte Generierungen</CardTitle>
          <CardDescription>Deine neuesten Creative Packs</CardDescription>
        </CardHeader>
        <CardContent>
          {recentGenerations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Noch keine Generierungen vorhanden
            </p>
          ) : (
            <div className="space-y-4">
              {recentGenerations.map((gen) => (
                <Link
                  key={gen.id}
                  href={`/generator/${gen.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{gen.brand.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(gen.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={statusColors[gen.status]}>
                      {statusLabels[gen.status]}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
