'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Sparkles, Building2, Plus } from 'lucide-react'
import Link from 'next/link'

interface Brand {
  id: string
  name: string
  industry: string
}

interface Product {
  id: string
  name: string
  description: string
}

const platforms = [
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'INSTAGRAM_REELS', label: 'Instagram Reels' },
  { value: 'YOUTUBE_SHORTS', label: 'YouTube Shorts' },
]

const goals = [
  { value: 'SALES', label: 'Verkauf' },
  { value: 'LEADS', label: 'Lead-Generierung' },
  { value: 'APP_INSTALL', label: 'App-Installation' },
  { value: 'AWARENESS', label: 'Markenbekanntheit' },
  { value: 'ENGAGEMENT', label: 'Engagement' },
]

const styles = [
  { value: 'CASUAL', label: 'Locker & Authentisch' },
  { value: 'PROFESSIONAL', label: 'Professionell' },
  { value: 'GENZ', label: 'Gen Z / Trendy' },
  { value: 'HUMOROUS', label: 'Witzig' },
  { value: 'EMOTIONAL', label: 'Emotional' },
  { value: 'EDUCATIONAL', label: 'Lehrreich' },
]

const durations = [
  { value: 15, label: '15 Sekunden' },
  { value: 30, label: '30 Sekunden' },
  { value: 45, label: '45 Sekunden' },
  { value: 60, label: '60 Sekunden' },
]

export default function GeneratorPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressStep, setProgressStep] = useState('')

  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<string>('')

  // Form state
  const [platform, setPlatform] = useState('TIKTOK')
  const [goal, setGoal] = useState('SALES')
  const [style, setStyle] = useState('CASUAL')
  const [duration, setDuration] = useState(30)

  // Manual product input
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productBenefits, setProductBenefits] = useState('')
  const [productObjections, setProductObjections] = useState('')

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (selectedBrand) {
      fetchProducts(selectedBrand)
    }
  }, [selectedBrand])

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands')
      const data = await res.json()
      setBrands(data)
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const fetchProducts = async (brandId: string) => {
    try {
      const res = await fetch(`/api/brands/${brandId}/products`)
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleGenerate = async () => {
    if (!selectedBrand) {
      toast({
        title: 'Brand erforderlich',
        description: 'Bitte waehle eine Brand aus.',
        variant: 'destructive',
      })
      return
    }

    if (!selectedProduct && !productName) {
      toast({
        title: 'Produkt erforderlich',
        description: 'Bitte waehle ein Produkt aus oder gib Produktdaten ein.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    setProgress(0)

    try {
      const response = await fetch('/api/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: selectedBrand,
          productId: selectedProduct || undefined,
          platform,
          goal,
          style,
          duration,
          productName: selectedProduct ? undefined : productName,
          productDescription: selectedProduct ? undefined : productDescription,
          productPrice: selectedProduct ? undefined : productPrice,
          productBenefits: selectedProduct ? undefined : productBenefits.split('\n').filter(Boolean),
          productObjections: selectedProduct ? undefined : productObjections.split('\n').filter(Boolean),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Generierung fehlgeschlagen')
      }

      // Poll for status
      pollGenerationStatus(result.id)
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Generierung fehlgeschlagen',
        variant: 'destructive',
      })
      setIsGenerating(false)
    }
  }

  const pollGenerationStatus = async (generationId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/generations/${generationId}/status`)
        const data = await res.json()

        if (data.progress) {
          setProgress(data.progress.progress || 0)
          setProgressStep(data.progress.step || '')
        }

        if (data.status === 'COMPLETED') {
          clearInterval(pollInterval)
          setIsGenerating(false)
          toast({
            title: 'Fertig!',
            description: 'Dein Creative Pack wurde erstellt.',
          })
          router.push(`/generator/${generationId}`)
        } else if (data.status === 'FAILED') {
          clearInterval(pollInterval)
          setIsGenerating(false)
          toast({
            title: 'Fehler',
            description: data.error || 'Generierung fehlgeschlagen',
            variant: 'destructive',
          })
        }
      } catch (error) {
        console.error('Error polling status:', error)
      }
    }, 2000)
  }

  const credits = session?.user?.credits || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creative Pack Generator</h1>
          <p className="text-muted-foreground">Erstelle UGC Ads in Sekunden</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Sparkles className="h-4 w-4 mr-2" />
          {credits} Credits
        </Badge>
      </div>

      {brands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Brand vorhanden</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-sm">
              Erstelle zuerst eine Brand, um Creative Packs zu generieren.
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
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Brand & Produkt</CardTitle>
                <CardDescription>Waehle Brand und Produkt aus</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Brand *</Label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="Waehle eine Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBrand && (
                  <Tabs defaultValue="existing" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="existing">Bestehendes Produkt</TabsTrigger>
                      <TabsTrigger value="manual">Manuell eingeben</TabsTrigger>
                    </TabsList>
                    <TabsContent value="existing" className="space-y-4 mt-4">
                      {products.length > 0 ? (
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                          <SelectTrigger>
                            <SelectValue placeholder="Waehle ein Produkt" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Keine Produkte vorhanden. Gib Produktdaten manuell ein.
                        </p>
                      )}
                    </TabsContent>
                    <TabsContent value="manual" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Produktname *</Label>
                        <Input
                          placeholder="z.B. Premium Protein Shake"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea
                          placeholder="Kurze Beschreibung des Produkts..."
                          value={productDescription}
                          onChange={(e) => setProductDescription(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Preis</Label>
                        <Input
                          placeholder="z.B. 29,99 EUR"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Vorteile (eine pro Zeile)</Label>
                        <Textarea
                          placeholder="Schnelle Lieferung&#10;30 Tage Geld-zurueck&#10;100% natuerlich"
                          value={productBenefits}
                          onChange={(e) => setProductBenefits(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Haeufige Einwaende (eine pro Zeile)</Label>
                        <Textarea
                          placeholder="Zu teuer&#10;Schmeckt nicht gut&#10;Hilft nicht"
                          value={productObjections}
                          onChange={(e) => setProductObjections(e.target.value)}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Konfiguration</CardTitle>
                <CardDescription>Passe die Generierung an</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Plattform</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ziel</Label>
                    <Select value={goal} onValueChange={setGoal}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {goals.map((g) => (
                          <SelectItem key={g.value} value={g.value}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Stil</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {styles.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Dauer</Label>
                    <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((d) => (
                          <SelectItem key={d.value} value={d.value.toString()}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generate Section */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Creative Pack generieren</CardTitle>
                <CardDescription>Kosten: 10 Credits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Das bekommst du:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>10 Hook-Varianten mit Kategorisierung</li>
                    <li>3 komplette Skripte (A/B/C)</li>
                    <li>Shotlist mit Recording-Anleitung</li>
                    <li>Voiceover-Text + Untertitel</li>
                    <li>CTA-Varianten</li>
                    <li>Einwandbehandlung</li>
                    <li>Ad Copy fuer Meta & TikTok</li>
                  </ul>
                </div>

                {isGenerating ? (
                  <div className="space-y-4">
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{progressStep || 'Generiere...'}</span>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={handleGenerate}
                    disabled={credits < 10 || !selectedBrand}
                  >
                    <Sparkles className="h-4 w-4" />
                    Generieren (10 Credits)
                  </Button>
                )}

                {credits < 10 && (
                  <p className="text-sm text-destructive text-center">
                    Nicht genuegend Credits.{' '}
                    <Link href="/billing" className="underline">
                      Credits kaufen
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
