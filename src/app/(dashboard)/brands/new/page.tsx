'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { brandSchema, BrandInput } from '@/lib/validations/brand'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const industries = [
  { value: 'BEAUTY', label: 'Beauty & Kosmetik' },
  { value: 'FITNESS', label: 'Fitness & Sport' },
  { value: 'SAAS', label: 'SaaS & Software' },
  { value: 'FOOD', label: 'Food & Beverage' },
  { value: 'LOCAL_SERVICE', label: 'Lokale Dienstleistung' },
  { value: 'EVENTS', label: 'Events & Veranstaltungen' },
  { value: 'ECOMMERCE', label: 'E-Commerce' },
  { value: 'FASHION', label: 'Mode & Bekleidung' },
  { value: 'HEALTH', label: 'Gesundheit & Wellness' },
  { value: 'FINANCE', label: 'Finanzen & Versicherung' },
  { value: 'EDUCATION', label: 'Bildung & Kurse' },
  { value: 'TRAVEL', label: 'Reisen & Tourismus' },
  { value: 'OTHER', label: 'Sonstige' },
]

const tonalities = [
  'locker',
  'professionell',
  'witzig',
  'emotional',
  'serioes',
  'trendy',
  'vertrauenswuerdig',
  'energetisch',
]

export default function NewBrandPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTonality, setSelectedTonality] = useState<string[]>([])
  const [uspInput, setUspInput] = useState('')
  const [usps, setUsps] = useState<string[]>([])
  const [noGoInput, setNoGoInput] = useState('')
  const [noGos, setNoGos] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BrandInput>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      language: 'de',
      region: 'DE',
      industry: 'OTHER',
      tonality: [],
      usps: [],
      noGos: [],
    },
  })

  const toggleTonality = (tone: string) => {
    const newTonality = selectedTonality.includes(tone)
      ? selectedTonality.filter((t) => t !== tone)
      : [...selectedTonality, tone]
    setSelectedTonality(newTonality)
    setValue('tonality', newTonality)
  }

  const addUsp = () => {
    if (uspInput.trim() && !usps.includes(uspInput.trim())) {
      const newUsps = [...usps, uspInput.trim()]
      setUsps(newUsps)
      setValue('usps', newUsps)
      setUspInput('')
    }
  }

  const removeUsp = (usp: string) => {
    const newUsps = usps.filter((u) => u !== usp)
    setUsps(newUsps)
    setValue('usps', newUsps)
  }

  const addNoGo = () => {
    if (noGoInput.trim() && !noGos.includes(noGoInput.trim())) {
      const newNoGos = [...noGos, noGoInput.trim()]
      setNoGos(newNoGos)
      setValue('noGos', newNoGos)
      setNoGoInput('')
    }
  }

  const removeNoGo = (noGo: string) => {
    const newNoGos = noGos.filter((n) => n !== noGo)
    setNoGos(newNoGos)
    setValue('noGos', newNoGos)
  }

  const onSubmit = async (data: BrandInput) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Erstellen')
      }

      toast({
        title: 'Brand erstellt',
        description: 'Deine Brand wurde erfolgreich erstellt.',
      })

      router.push(`/brands/${result.id}`)
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Fehler beim Erstellen',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/brands">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Neue Brand</h1>
          <p className="text-muted-foreground">Erstelle eine neue Brand fuer deine Produkte</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Brand-Details</CardTitle>
            <CardDescription>Grundlegende Informationen zu deiner Brand</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="z.B. Acme GmbH"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                placeholder="Kurze Beschreibung deiner Brand..."
                {...register('description')}
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">Branche</Label>
                <Select
                  onValueChange={(value) => setValue('industry', value as BrandInput['industry'])}
                  defaultValue="OTHER"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Waehle eine Branche" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  placeholder="https://example.com"
                  {...register('websiteUrl')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Zielgruppe</Label>
              <Textarea
                id="targetAudience"
                placeholder="Beschreibe deine Zielgruppe (Alter, Interessen, Probleme...)"
                {...register('targetAudience')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Tonalitaet</Label>
              <div className="flex flex-wrap gap-2">
                {tonalities.map((tone) => (
                  <Button
                    key={tone}
                    type="button"
                    variant={selectedTonality.includes(tone) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTonality(tone)}
                  >
                    {tone}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>USPs (Alleinstellungsmerkmale)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="z.B. Kostenloser Versand"
                  value={uspInput}
                  onChange={(e) => setUspInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUsp())}
                />
                <Button type="button" variant="outline" onClick={addUsp}>
                  Hinzufuegen
                </Button>
              </div>
              {usps.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {usps.map((usp) => (
                    <span
                      key={usp}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {usp}
                      <button
                        type="button"
                        onClick={() => removeUsp(usp)}
                        className="hover:text-destructive"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>No-Gos (Was vermieden werden soll)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="z.B. Aggressive Verkaufssprache"
                  value={noGoInput}
                  onChange={(e) => setNoGoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNoGo())}
                />
                <Button type="button" variant="outline" onClick={addNoGo}>
                  Hinzufuegen
                </Button>
              </div>
              {noGos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {noGos.map((noGo) => (
                    <span
                      key={noGo}
                      className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {noGo}
                      <button
                        type="button"
                        onClick={() => removeNoGo(noGo)}
                        className="hover:text-foreground"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/brands">
                <Button type="button" variant="outline">
                  Abbrechen
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Brand erstellen
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
