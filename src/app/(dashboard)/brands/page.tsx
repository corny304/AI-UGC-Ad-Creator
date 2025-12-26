import Link from 'next/link'
import { getCurrentTeam } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Building2, Plus, ArrowRight, Globe } from 'lucide-react'

const industryLabels: Record<string, string> = {
  BEAUTY: 'Beauty',
  FITNESS: 'Fitness',
  SAAS: 'SaaS',
  FOOD: 'Food & Beverage',
  LOCAL_SERVICE: 'Lokale Dienstleistung',
  EVENTS: 'Events',
  ECOMMERCE: 'E-Commerce',
  FASHION: 'Mode',
  HEALTH: 'Gesundheit',
  FINANCE: 'Finanzen',
  EDUCATION: 'Bildung',
  TRAVEL: 'Reisen',
  OTHER: 'Sonstige',
}

export default async function BrandsPage() {
  const team = await getCurrentTeam()

  if (!team) {
    return <div>Team nicht gefunden</div>
  }

  const brands = await db.brand.findMany({
    where: { teamId: team.id },
    include: {
      _count: {
        select: { products: true, generations: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brands</h1>
          <p className="text-muted-foreground">Verwalte deine Brands und Produkte</p>
        </div>
        <Link href="/brands/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Neue Brand
          </Button>
        </Link>
      </div>

      {brands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Brands vorhanden</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-sm">
              Erstelle deine erste Brand, um Creative Packs zu generieren.
            </p>
            <Link href="/brands/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Brand erstellen
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/brands/${brand.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{brand.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {industryLabels[brand.industry] || brand.industry}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  {brand.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {brand.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{brand._count.products} Produkte</span>
                    <span>{brand._count.generations} Generierungen</span>
                  </div>
                  {brand.websiteUrl && (
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span className="truncate">{brand.websiteUrl}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
