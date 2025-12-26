'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatCredits } from '@/lib/utils'
import { PLANS, CREDIT_PACKS } from '@/lib/stripe'
import { Loader2, Check, Sparkles, CreditCard } from 'lucide-react'

export default function BillingPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [loadingPack, setLoadingPack] = useState<string | null>(null)

  const credits = session?.user?.credits || 0

  const handleSubscribe = async (planId: string, priceId: string) => {
    setLoadingPlan(planId)

    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          mode: 'subscription',
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Checkout URL nicht erhalten')
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Checkout konnte nicht gestartet werden',
        variant: 'destructive',
      })
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleBuyCredits = async (packId: string, priceId: string) => {
    setLoadingPack(packId)

    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          mode: 'payment',
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Checkout URL nicht erhalten')
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Checkout konnte nicht gestartet werden',
        variant: 'destructive',
      })
    } finally {
      setLoadingPack(null)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Portal konnte nicht geoeffnet werden',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Abrechnung</h1>
        <p className="text-muted-foreground">Verwalte dein Abonnement und kaufe Credits</p>
      </div>

      {/* Current Credits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Aktuelle Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold">{formatCredits(credits)}</p>
              <p className="text-muted-foreground">Credits verfuegbar</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              1 Creative Pack = 10 Credits
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Abonnement-Plaene</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.values(PLANS).map((plan) => (
            <Card
              key={plan.id}
              className={(plan as { popular?: boolean }).popular ? 'border-primary shadow-lg' : ''}
            >
              <CardHeader>
                {(plan as { popular?: boolean }).popular && (
                  <Badge className="w-fit mb-2">Beliebt</Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold">{(plan.price / 100).toFixed(0)}</span>
                  <span className="text-muted-foreground">/Monat</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={(plan as { popular?: boolean }).popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan.id, plan.stripePriceId)}
                  disabled={loadingPlan === plan.id}
                >
                  {loadingPlan === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Abonnieren
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Credit Packs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Credit-Pakete</h2>
        <p className="text-muted-foreground mb-4">Einmalige Kaeufe - keine Verpflichtung</p>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.values(CREDIT_PACKS).map((pack) => (
            <Card
              key={pack.id}
              className={(pack as { popular?: boolean }).popular ? 'border-primary shadow-lg' : ''}
            >
              <CardHeader>
                {(pack as { popular?: boolean }).popular && (
                  <Badge className="w-fit mb-2">Bester Wert</Badge>
                )}
                <CardTitle>{pack.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold">{(pack.price / 100).toFixed(2)}</span>
                  <span className="text-muted-foreground">EUR</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  {((pack.price / 100) / pack.credits).toFixed(2)} EUR pro Credit
                </p>
                <Button
                  className="w-full"
                  variant={(pack as { popular?: boolean }).popular ? 'default' : 'outline'}
                  onClick={() => handleBuyCredits(pack.id, pack.stripePriceId)}
                  disabled={loadingPack === pack.id}
                >
                  {loadingPack === pack.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kaufen
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Manage Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Abonnement verwalten
          </CardTitle>
          <CardDescription>
            Zahlungsmethode aendern, Rechnungen einsehen oder kuendigen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleManageSubscription}>
            Kundenportal oeffnen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
