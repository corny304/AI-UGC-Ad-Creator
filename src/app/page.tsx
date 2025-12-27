import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Target, Video, Users, Shield, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: '10 Hook-Varianten',
    description: 'Verschiedene Einstiegsmuster für maximale Aufmerksamkeit',
  },
  {
    icon: Video,
    title: '3 Skript-Varianten',
    description: 'A/B/C Testing mit kompletten Szenen und B-Roll',
  },
  {
    icon: Target,
    title: 'Shotlist & Anleitung',
    description: 'Detaillierte Aufnahmeanleitung für UGC Content',
  },
  {
    icon: Users,
    title: 'Team-Zugang',
    description: 'Mehrere Brands und Team-Mitglieder verwalten',
  },
]

const plans = [
  {
    name: 'Starter',
    price: '29',
    credits: 100,
    features: ['100 Credits/Monat', '1 Brand', 'Alle Vorlagen', 'E-Mail Support'],
  },
  {
    name: 'Professional',
    price: '79',
    credits: 500,
    popular: true,
    features: ['500 Credits/Monat', '5 Brands', 'Team-Zugang (3)', 'Priority Support'],
  },
  {
    name: 'Agency',
    price: '199',
    credits: 2000,
    features: ['2000 Credits/Monat', 'Unbegrenzte Brands', 'Webhook-Integration', 'Whitelabel'],
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AdSpark AI</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Preise
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:text-primary">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Anmelden</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Kostenlos starten</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Neu: Gemini AI Integration
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              UGC Ads erstellen in <span className="text-primary">Sekunden</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Verwandle deine Produktinfos in professionelle TikTok, Reels und Shorts Ads.
              Hooks, Skripte, Shotlist und mehr - alles automatisch generiert.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2">
                  Jetzt starten <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline">
                  Demo ansehen
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              50 kostenlose Credits bei Registrierung
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-24 bg-muted/50">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Alles was du brauchst
            </h2>
            <p className="mt-4 text-muted-foreground">
              Ein Creative Pack enthält alle Assets für deine Video-Ads
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mx-auto mt-16 max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle>Was du bekommst (pro Creative Pack)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-3 md:grid-cols-2">
                  {[
                    '10 Hook-Varianten mit Pattern-Kategorisierung',
                    '3 komplette Skripte (A/B/C) mit Szenen',
                    'Shotlist mit Recording-Anleitung',
                    'Voiceover-Text + Untertitel (SRT)',
                    'CTA & Offer Varianten',
                    'Einwandbehandlung (Preis, Vertrauen, etc.)',
                    'Ad Copy für Meta & TikTok',
                    'Export als JSON, Markdown, SRT',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Einfache, transparente Preise
            </h2>
            <p className="mt-4 text-muted-foreground">
              1 Creative Pack = 10 Credits. Wähle den passenden Plan.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={plan.popular ? 'border-primary shadow-lg' : ''}
              >
                <CardHeader>
                  {plan.popular && (
                    <Badge className="w-fit mb-2">Beliebt</Badge>
                  )}
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/Monat</span>
                  </div>
                  <CardDescription>{plan.credits} Credits/Monat</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register" className="block mt-6">
                    <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                      Jetzt starten
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="container py-24 bg-muted/50">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Haeufig gestellte Fragen
            </h2>
          </div>
          <div className="mx-auto mt-16 max-w-3xl space-y-4">
            {[
              {
                q: 'Was ist ein Creative Pack?',
                a: 'Ein Creative Pack enthält alle generierten Assets für eine Ad: 10 Hooks, 3 Skripte, Shotlist, Voiceover, CTAs und mehr. Perfekt für A/B Testing.',
              },
              {
                q: 'Wie funktioniert das Credit-System?',
                a: 'Ein komplettes Creative Pack kostet 10 Credits. Einzelne Abschnitte können für 1-3 Credits regeneriert werden. Credits verfallen nicht.',
              },
              {
                q: 'Welche Plattformen werden unterstuetzt?',
                a: 'TikTok, Instagram Reels und YouTube Shorts. Die Skripte und Formate sind optimal auf diese Plattformen abgestimmt.',
              },
              {
                q: 'Kann ich die generierten Inhalte exportieren?',
                a: 'Ja! Export als JSON, Markdown, SRT (Untertitel) oder TXT. Plus Copy-to-Clipboard fuer schnelles Einfuegen.',
              },
              {
                q: 'Wie steht es um den Datenschutz?',
                a: 'Wir speichern nur das Noetigste. Keine invasiven Tracking-Tools, DSGVO-konform, Daten auf EU-Servern.',
              },
            ].map((faq) => (
              <Card key={faq.q}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Bereit durchzustarten?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Erstelle noch heute deine ersten UGC Ads mit KI-Unterstuetzung.
            </p>
            <div className="mt-8">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2">
                  Kostenlos registrieren <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-semibold">AdSpark AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/impressum" className="hover:text-foreground">
                Impressum
              </Link>
              <Link href="/datenschutz" className="hover:text-foreground">
                Datenschutz
              </Link>
              <Link href="/agb" className="hover:text-foreground">
                AGB
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              DSGVO-konform
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
