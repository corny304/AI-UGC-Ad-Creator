'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  Copy,
  Download,
  RefreshCw,
  Check,
  Sparkles,
  FileText,
  Video,
  Mic,
  Type,
  Target,
  MessageSquare,
  Megaphone,
} from 'lucide-react'

interface Generation {
  id: string
  status: string
  platform: string
  goal: string
  style: string
  duration: number
  hooks: unknown
  scripts: unknown
  shotlist: unknown
  voiceover: unknown
  captions: unknown
  ctas: unknown
  objectionHandling: unknown
  adCopy: unknown
  brand: {
    name: string
  }
  product: {
    name: string
  } | null
}

interface Props {
  generation: Generation
}

const hookPatternLabels: Record<string, string> = {
  question: 'Frage',
  statistic: 'Statistik',
  controversy: 'Kontroverse',
  story: 'Story',
  pain_point: 'Pain Point',
  benefit: 'Nutzen',
  curiosity: 'Neugier',
  social_proof: 'Social Proof',
  urgency: 'Dringlichkeit',
  comparison: 'Vergleich',
}

export function GenerationResult({ generation }: Props) {
  const { toast } = useToast()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState<string | null>(null)

  const hooks = (generation.hooks as Array<{ id: string; text: string; pattern: string; reasoning: string }>) || []
  const scripts = (generation.scripts as Array<{ id: string; variant: string; hook: string; scenes: unknown[]; cta: string }>) || []
  const shotlist = (generation.shotlist as Array<{ shotNumber: number; type: string; description: string; duration: number; notes?: string }>) || []
  const voiceover = generation.voiceover as { variants?: Array<{ variant: string; fullText: string }> } | null
  const captions = generation.captions as { variants?: Array<{ variant: string; srt: string; plain: string }> } | null
  const ctas = (generation.ctas as Array<{ id: string; text: string; type: string }>) || []
  const objectionHandling = (generation.objectionHandling as Array<{ objection: string; response: string }>) || []
  const adCopy = (generation.adCopy as Array<{ platform: string; primaryText: string; headline: string }>) || []

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast({
      title: 'Kopiert',
      description: 'In die Zwischenablage kopiert.',
    })
  }

  const exportAsJSON = () => {
    const data = {
      hooks,
      scripts,
      shotlist,
      voiceover,
      captions,
      ctas,
      objectionHandling,
      adCopy,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `creative-pack-${generation.id}.json`
    a.click()
  }

  const exportAsMarkdown = () => {
    let md = `# Creative Pack\n\n`
    md += `**Brand:** ${generation.brand.name}\n`
    md += `**Produkt:** ${generation.product?.name || 'N/A'}\n`
    md += `**Plattform:** ${generation.platform}\n\n`

    md += `## Hooks\n\n`
    hooks.forEach((hook, i) => {
      md += `${i + 1}. **[${hookPatternLabels[hook.pattern] || hook.pattern}]** ${hook.text}\n`
    })

    md += `\n## Skripte\n\n`
    scripts.forEach((script) => {
      md += `### Variante ${script.variant}\n\n`
      md += `**Hook:** ${script.hook}\n\n`
      md += `**CTA:** ${script.cta}\n\n`
    })

    md += `\n## CTAs\n\n`
    ctas.forEach((cta) => {
      md += `- ${cta.text}\n`
    })

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `creative-pack-${generation.id}.md`
    a.click()
  }

  const regenerateSection = async (section: string) => {
    setRegenerating(section)
    try {
      const res = await fetch(`/api/generations/${generation.id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section }),
      })

      if (!res.ok) {
        throw new Error('Regenerierung fehlgeschlagen')
      }

      toast({
        title: 'Regeneriert',
        description: 'Abschnitt wird neu generiert. Seite wird neu geladen.',
      })

      window.location.reload()
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Regenerierung fehlgeschlagen',
        variant: 'destructive',
      })
    } finally {
      setRegenerating(null)
    }
  }

  if (generation.status === 'PENDING' || generation.status === 'PROCESSING') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold mb-2">Generierung laeuft...</h2>
          <p className="text-muted-foreground">Dies kann einige Sekunden dauern.</p>
        </div>
      </div>
    )
  }

  if (generation.status === 'FAILED') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-destructive">Generierung fehlgeschlagen</h2>
          <p className="text-muted-foreground mb-4">Es ist ein Fehler aufgetreten.</p>
          <Button onClick={() => window.location.href = '/generator'}>Neu versuchen</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Creative Pack</h1>
          <p className="text-muted-foreground">
            {generation.brand.name} {generation.product && `- ${generation.product.name}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAsMarkdown}>
            <Download className="h-4 w-4 mr-2" />
            Markdown
          </Button>
          <Button variant="outline" onClick={exportAsJSON}>
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hooks" className="space-y-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 h-auto">
          <TabsTrigger value="hooks" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Hooks</span>
          </TabsTrigger>
          <TabsTrigger value="scripts" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Skripte</span>
          </TabsTrigger>
          <TabsTrigger value="shotlist" className="gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Shotlist</span>
          </TabsTrigger>
          <TabsTrigger value="voiceover" className="gap-2">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Voiceover</span>
          </TabsTrigger>
          <TabsTrigger value="captions" className="gap-2">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Untertitel</span>
          </TabsTrigger>
          <TabsTrigger value="ctas" className="gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">CTAs</span>
          </TabsTrigger>
          <TabsTrigger value="objections" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Einwaende</span>
          </TabsTrigger>
          <TabsTrigger value="adcopy" className="gap-2">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Ad Copy</span>
          </TabsTrigger>
        </TabsList>

        {/* Hooks */}
        <TabsContent value="hooks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hook-Varianten</CardTitle>
                <CardDescription>10 verschiedene Einstiegsmuster</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => regenerateSection('hooks')}
                disabled={regenerating === 'hooks'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === 'hooks' ? 'animate-spin' : ''}`} />
                Neu generieren
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hooks.map((hook, i) => (
                  <div
                    key={hook.id || i}
                    className="flex items-start justify-between p-4 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">
                          {hookPatternLabels[hook.pattern] || hook.pattern}
                        </Badge>
                        <span className="text-sm text-muted-foreground">#{i + 1}</span>
                      </div>
                      <p className="font-medium">{hook.text}</p>
                      {hook.reasoning && (
                        <p className="text-sm text-muted-foreground mt-1">{hook.reasoning}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(hook.text, `hook-${i}`)}
                    >
                      {copiedId === `hook-${i}` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scripts */}
        <TabsContent value="scripts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Skript-Varianten</CardTitle>
                <CardDescription>3 komplette A/B/C Varianten</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => regenerateSection('scripts')}
                disabled={regenerating === 'scripts'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === 'scripts' ? 'animate-spin' : ''}`} />
                Neu generieren
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="A">
                <TabsList>
                  {scripts.map((script) => (
                    <TabsTrigger key={script.variant} value={script.variant}>
                      Variante {script.variant}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {scripts.map((script) => (
                  <TabsContent key={script.variant} value={script.variant} className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 border">
                      <p className="font-medium text-primary">{script.hook}</p>
                    </div>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {(script.scenes as Array<{ sceneNumber: number; visual: string; audio: string; duration: number }>)?.map((scene) => (
                          <div key={scene.sceneNumber} className="p-4 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Szene {scene.sceneNumber}</Badge>
                              <span className="text-sm text-muted-foreground">{scene.duration}s</span>
                            </div>
                            <div className="grid gap-2 md:grid-cols-2">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase mb-1">Visual</p>
                                <p className="text-sm">{scene.visual}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase mb-1">Audio</p>
                                <p className="text-sm">{scene.audio}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="font-medium text-green-700">{script.cta}</p>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shotlist */}
        <TabsContent value="shotlist">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Shotlist & Aufnahmeanleitung</CardTitle>
                <CardDescription>Detaillierte Anweisungen fuer UGC</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => regenerateSection('shotlist')}
                disabled={regenerating === 'shotlist'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === 'shotlist' ? 'animate-spin' : ''}`} />
                Neu generieren
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shotlist.map((shot) => (
                  <div key={shot.shotNumber} className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>Shot {shot.shotNumber}</Badge>
                      <Badge variant="secondary">{shot.type}</Badge>
                      <span className="text-sm text-muted-foreground">{shot.duration}s</span>
                    </div>
                    <p className="font-medium">{shot.description}</p>
                    {shot.notes && (
                      <p className="text-sm text-muted-foreground mt-2">Tipp: {shot.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voiceover */}
        <TabsContent value="voiceover">
          <Card>
            <CardHeader>
              <CardTitle>Voiceover-Text</CardTitle>
              <CardDescription>Sprechfertige Texte</CardDescription>
            </CardHeader>
            <CardContent>
              {voiceover?.variants?.map((v) => (
                <div key={v.variant} className="mb-6 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <Badge>Variante {v.variant}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(v.fullText, `vo-${v.variant}`)}
                    >
                      {copiedId === `vo-${v.variant}` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      Kopieren
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="whitespace-pre-wrap">{v.fullText}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Captions */}
        <TabsContent value="captions">
          <Card>
            <CardHeader>
              <CardTitle>Untertitel</CardTitle>
              <CardDescription>SRT-Format und Plain Text</CardDescription>
            </CardHeader>
            <CardContent>
              {captions?.variants?.map((c) => (
                <div key={c.variant} className="mb-6 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <Badge>Variante {c.variant}</Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const blob = new Blob([c.srt], { type: 'text/srt' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `subtitles-${c.variant}.srt`
                          a.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        SRT
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(c.plain, `cap-${c.variant}`)}
                      >
                        {copiedId === `cap-${c.variant}` ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        Kopieren
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <pre className="text-sm whitespace-pre-wrap">{c.srt}</pre>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTAs */}
        <TabsContent value="ctas">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Call-to-Actions</CardTitle>
                <CardDescription>Verschiedene CTA-Varianten</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => regenerateSection('ctas')}
                disabled={regenerating === 'ctas'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === 'ctas' ? 'animate-spin' : ''}`} />
                Neu generieren
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ctas.map((cta, i) => (
                  <div
                    key={cta.id || i}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {cta.type}
                      </Badge>
                      <p className="font-medium">{cta.text}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(cta.text, `cta-${i}`)}
                    >
                      {copiedId === `cta-${i}` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Objection Handling */}
        <TabsContent value="objections">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Einwandbehandlung</CardTitle>
                <CardDescription>Antworten auf haeufige Bedenken</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => regenerateSection('objectionHandling')}
                disabled={regenerating === 'objectionHandling'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === 'objectionHandling' ? 'animate-spin' : ''}`} />
                Neu generieren
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {objectionHandling.map((obj, i) => (
                  <div key={i} className="p-4 rounded-lg border">
                    <p className="font-medium text-destructive mb-2">{obj.objection}</p>
                    <p className="text-muted-foreground">{obj.response}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ad Copy */}
        <TabsContent value="adcopy">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ad Copy</CardTitle>
                <CardDescription>Texte fuer Meta & TikTok Ads</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => regenerateSection('adCopy')}
                disabled={regenerating === 'adCopy'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${regenerating === 'adCopy' ? 'animate-spin' : ''}`} />
                Neu generieren
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {adCopy.map((copy, i) => (
                  <div key={i} className="p-4 rounded-lg border">
                    <Badge className="mb-4">{copy.platform}</Badge>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Primary Text</p>
                        <p className="text-sm">{copy.primaryText}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase mb-1">Headline</p>
                        <p className="font-medium">{copy.headline}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4"
                      onClick={() => copyToClipboard(`${copy.headline}\n\n${copy.primaryText}`, `adcopy-${i}`)}
                    >
                      {copiedId === `adcopy-${i}` ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Kopieren
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
