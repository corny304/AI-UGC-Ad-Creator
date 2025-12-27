import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'

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

const platformLabels: Record<string, string> = {
  TIKTOK: 'TikTok',
  INSTAGRAM_REELS: 'Instagram Reels',
  YOUTUBE_SHORTS: 'YouTube Shorts',
}

export default async function TemplatesPage() {
  const templates = await db.template.findMany({
    where: { isPublic: true },
    orderBy: { usageCount: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vorlagen</h1>
        <p className="text-muted-foreground">Branchenspezifische Vorlagen fuer deine Ads</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">
                      {industryLabels[template.industry] || template.industry}
                    </Badge>
                    <Badge variant="outline">
                      {platformLabels[template.platform]}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {template.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>
              )}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase">Beispiel-Hooks:</p>
                <ul className="text-sm space-y-1">
                  {template.hookTemplates.slice(0, 3).map((hook, i) => (
                    <li key={i} className="text-muted-foreground">
                      {hook}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                {template.usageCount} mal verwendet
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Vorlagen verfuegbar</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Fuehre den Seed-Befehl aus, um Vorlagen zu laden.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
