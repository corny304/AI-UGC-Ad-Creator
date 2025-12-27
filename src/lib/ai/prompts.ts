import { Platform, AdGoal, AdStyle } from '@prisma/client'

export interface ProductBrief {
  productName: string
  productDescription: string
  productPrice?: string
  benefits: string[]
  objections: string[]
  reviews: string[]
  brandName: string
  targetAudience: string
  tonality: string[]
  usps: string[]
  noGos: string[]
  industry: string
}

export interface GenerationConfig {
  platform: Platform
  goal: AdGoal
  style: AdStyle
  duration: number
  language: string
}

const platformNames: Record<Platform, string> = {
  TIKTOK: 'TikTok',
  INSTAGRAM_REELS: 'Instagram Reels',
  YOUTUBE_SHORTS: 'YouTube Shorts',
}

const goalDescriptions: Record<AdGoal, string> = {
  SALES: 'Direktverkauf und Conversions',
  LEADS: 'Lead-Generierung und Kontaktanfragen',
  APP_INSTALL: 'App-Downloads und Installationen',
  AWARENESS: 'Markenbekanntheit und Reichweite',
  ENGAGEMENT: 'Interaktion und Community-Aufbau',
}

const styleDescriptions: Record<AdStyle, string> = {
  CASUAL: 'locker, authentisch, wie ein Freund der empfiehlt',
  PROFESSIONAL: 'seriös, vertrauenswürdig, Expertenstatus',
  GENZ: 'trendy, meme-würdig, Slang, sehr schnell',
  HUMOROUS: 'witzig, unterhaltsam, selbstironisch',
  EMOTIONAL: 'berührend, Story-driven, Problem-Lösung',
  EDUCATIONAL: 'informativ, Mehrwert-fokussiert, Tutorial-artig',
}

export function buildHooksPrompt(brief: ProductBrief, config: GenerationConfig): string {
  return `Erstelle 10 verschiedene Hook-Varianten für eine ${platformNames[config.platform]} Ad.

PRODUKT/SERVICE:
- Name: ${brief.productName}
- Beschreibung: ${brief.productDescription}
- Preis: ${brief.productPrice || 'nicht angegeben'}
- Vorteile: ${brief.benefits.join(', ') || 'nicht angegeben'}

BRAND:
- Name: ${brief.brandName}
- Zielgruppe: ${brief.targetAudience}
- Tonalität: ${brief.tonality.join(', ')}
- USPs: ${brief.usps.join(', ')}

KONFIGURATION:
- Plattform: ${platformNames[config.platform]}
- Ziel: ${goalDescriptions[config.goal]}
- Stil: ${styleDescriptions[config.style]}
- Sprache: ${config.language === 'de' ? 'Deutsch' : 'Englisch'}

HOOK-KATEGORIEN (verwende verschiedene):
1. question - Frage die Neugier weckt
2. statistic - Überraschende Zahl/Statistik
3. controversy - Kontroverse/unerwartete Aussage
4. story - Mini-Story Anfang ("Als ich...")
5. pain_point - Direktes Ansprechen eines Problems
6. benefit - Sofortiger Nutzen
7. curiosity - Curiosity Gap
8. social_proof - Soziale Beweise
9. urgency - Dringlichkeit
10. comparison - Vergleich (vorher/nachher)

WICHTIG:
- Jeder Hook muss in 2-3 Sekunden gesprochen werden können
- Authentisch und nicht werblich klingen
- ${brief.noGos.length > 0 ? `VERMEIDE: ${brief.noGos.join(', ')}` : ''}

Antworte als JSON Array.`
}

export function buildScriptsPrompt(
  brief: ProductBrief,
  config: GenerationConfig,
  hooks: string[]
): string {
  return `Erstelle 3 komplette Video-Skripte (A, B, C) für eine ${platformNames[config.platform]} Ad.

PRODUKT/SERVICE:
- Name: ${brief.productName}
- Beschreibung: ${brief.productDescription}
- Preis: ${brief.productPrice || 'nicht angegeben'}
- Vorteile: ${brief.benefits.join(', ') || 'nicht angegeben'}
- Häufige Einwände: ${brief.objections.join(', ') || 'nicht angegeben'}
- Kundenrezensionen: ${brief.reviews.slice(0, 3).join(' | ') || 'nicht angegeben'}

BRAND:
- Name: ${brief.brandName}
- Zielgruppe: ${brief.targetAudience}
- Tonalität: ${brief.tonality.join(', ')}

KONFIGURATION:
- Plattform: ${platformNames[config.platform]}
- Ziel: ${goalDescriptions[config.goal]}
- Stil: ${styleDescriptions[config.style]}
- Dauer: ${config.duration} Sekunden
- Sprache: ${config.language === 'de' ? 'Deutsch' : 'Englisch'}

VERFÜGBARE HOOKS (wähle die besten):
${hooks.map((h, i) => `${i + 1}. ${h}`).join('\n')}

STRUKTUR FÜR JEDES SKRIPT:
1. Hook (2-3 Sek) - Aufmerksamkeit
2. Problem (3-5 Sek) - Pain Point verstärken
3. Lösung (5-8 Sek) - Produkt als Antwort
4. Beweis (5-8 Sek) - Social Proof/Ergebnis
5. CTA (3-5 Sek) - Klare Handlungsaufforderung

Jede Szene braucht:
- sceneNumber: Nummer
- duration: Sekunden
- visual: Was zu sehen ist
- audio: Was gesagt wird
- text: On-Screen Text (optional)
- bRoll: B-Roll Vorschläge (optional)

WICHTIG:
- Gesamtdauer muss ${config.duration} Sekunden sein
- ${brief.noGos.length > 0 ? `VERMEIDE: ${brief.noGos.join(', ')}` : ''}
- Authentisch, nicht werblich

Antworte als JSON Array.`
}

export function buildShotlistPrompt(
  brief: ProductBrief,
  config: GenerationConfig,
  scripts: unknown[]
): string {
  return `Erstelle eine detaillierte Shotlist/Aufnahmeanleitung für UGC Content.

PRODUKT: ${brief.productName}
BRAND: ${brief.brandName}
PLATTFORM: ${platformNames[config.platform]}
STIL: ${styleDescriptions[config.style]}
DAUER: ${config.duration} Sekunden

SKRIPTE:
${JSON.stringify(scripts, null, 2)}

Erstelle für jeden benötigten Shot:
- shotNumber: Nummer
- type: talking_head | product_shot | b_roll | screen_recording | lifestyle
- description: Was genau gefilmt werden soll
- duration: Sekunden
- notes: Tipps für Aufnahme
- equipment: Benötigtes Equipment

TIPPS einbauen für:
- Beleuchtung (natürlich vs. Ring Light)
- Kamerawinkel
- Audio-Qualität
- Authentizität

Antworte als JSON Array.`
}

export function buildVoiceoverPrompt(brief: ProductBrief, scripts: unknown[]): string {
  return `Erstelle sprechfertige Voiceover-Texte basierend auf den Skripten.

PRODUKT: ${brief.productName}
BRAND: ${brief.brandName}
TONALITÄT: ${brief.tonality.join(', ')}

SKRIPTE:
${JSON.stringify(scripts, null, 2)}

Für jeden Skript-Variant erstelle:
- variant: A, B oder C
- fullText: Kompletter Voiceover-Text am Stück
- segments: Array mit { timestamp, text } für jeden Abschnitt
- speakingNotes: Tipps für Betonung, Pausen, Tempo

Der Text muss:
- Natürlich klingen wenn gesprochen
- Zum Timing passen
- Emotionale Akzente haben

Antworte als JSON.`
}

export function buildCaptionsPrompt(voiceover: unknown, config: GenerationConfig): string {
  return `Erstelle Untertitel im SRT-Format basierend auf dem Voiceover.

VOICEOVER:
${JSON.stringify(voiceover, null, 2)}

PLATTFORM: ${platformNames[config.platform]}
DAUER: ${config.duration} Sekunden

Erstelle:
- srt: Vollständiger SRT-Format Text
- plain: Nur der Text ohne Timestamps
- highlighted: Array mit { start, end, text, emphasis } für Highlight-Wörter

REGELN:
- Max 2 Zeilen pro Untertitel
- Max 42 Zeichen pro Zeile
- Wichtige Wörter als emphasis markieren
- Timing präzise an gesprochene Wörter anpassen

Antworte als JSON.`
}

export function buildCTAsPrompt(brief: ProductBrief, config: GenerationConfig): string {
  return `Erstelle 8 CTA (Call-to-Action) Varianten.

PRODUKT: ${brief.productName}
BRAND: ${brief.brandName}
PREIS: ${brief.productPrice || 'nicht angegeben'}
ZIEL: ${goalDescriptions[config.goal]}

Erstelle CTAs in verschiedenen Kategorien:
1. primary - Direkter, klarer CTA
2. soft - Sanfter, niedrigschwelliger CTA
3. urgency - Mit Dringlichkeit
4. benefit - Nutzen-fokussiert
5. social_proof - Mit sozialen Beweisen

Jeder CTA braucht:
- id: Eindeutige ID
- text: Der CTA-Text
- type: Kategorie

${brief.noGos.length > 0 ? `VERMEIDE: ${brief.noGos.join(', ')}` : ''}

Antworte als JSON Array.`
}

export function buildObjectionHandlingPrompt(brief: ProductBrief): string {
  return `Erstelle Einwandbehandlungs-Zeilen für häufige Kundenbedenken.

PRODUKT: ${brief.productName}
PREIS: ${brief.productPrice || 'nicht angegeben'}
BEKANNTE EINWÄNDE: ${brief.objections.join(', ') || 'nicht angegeben'}
KUNDENREZENSIONEN: ${brief.reviews.slice(0, 3).join(' | ') || 'nicht angegeben'}

Behandle diese Standard-Einwände:
1. Preis zu hoch
2. Brauche ich nicht
3. Funktioniert nicht
4. Zu kompliziert
5. Vertrauen/Seriosität
6. Versand/Lieferung
7. Rückgabe/Garantie
8. Vergleich zu Alternativen

Für jeden Einwand erstelle:
- objection: Das Bedenken
- response: Kurze, überzeugende Antwort (max 2 Sätze)
- tone: empathetic | confident | factual

Antworte als JSON Array.`
}

export function buildAdCopyPrompt(
  brief: ProductBrief,
  config: GenerationConfig,
  hooks: string[],
  ctas: unknown[]
): string {
  return `Erstelle Ad Copy für Meta und TikTok Ads.

PRODUKT: ${brief.productName}
BESCHREIBUNG: ${brief.productDescription}
VORTEILE: ${brief.benefits.join(', ')}
PREIS: ${brief.productPrice || 'nicht angegeben'}
ZIELGRUPPE: ${brief.targetAudience}

BESTE HOOKS:
${hooks.slice(0, 3).map((h, i) => `${i + 1}. ${h}`).join('\n')}

CTAS:
${JSON.stringify(ctas, null, 2)}

Erstelle für jede Plattform:
1. Meta (Facebook/Instagram):
   - primaryText: Haupttext (max 125 Zeichen für beste Performance)
   - headline: Headline (max 40 Zeichen)
   - description: Link-Beschreibung (max 30 Zeichen)

2. TikTok:
   - primaryText: Spark Ad Text (max 150 Zeichen)
   - headline: Kurze Headline
   - description: Optional

STIL: ${styleDescriptions[config.style]}
${brief.noGos.length > 0 ? `VERMEIDE: ${brief.noGos.join(', ')}` : ''}

Antworte als JSON Array mit 2 Objekten (Meta, TikTok).`
}

// JSON Schemas for validation
export const HOOKS_SCHEMA = `[{
  "id": "string",
  "text": "string (der Hook-Text)",
  "pattern": "question|statistic|controversy|story|pain_point|benefit|curiosity|social_proof|urgency|comparison",
  "reasoning": "string (warum dieser Hook funktioniert)"
}]`

export const SCRIPTS_SCHEMA = `[{
  "id": "string",
  "variant": "A|B|C",
  "hook": "string",
  "scenes": [{
    "sceneNumber": number,
    "duration": number,
    "visual": "string",
    "audio": "string",
    "text": "string (optional)",
    "bRoll": "string (optional)"
  }],
  "cta": "string",
  "totalDuration": number
}]`

export const SHOTLIST_SCHEMA = `[{
  "shotNumber": number,
  "type": "talking_head|product_shot|b_roll|screen_recording|lifestyle",
  "description": "string",
  "duration": number,
  "notes": "string (optional)",
  "equipment": ["string"] (optional)
}]`

export const VOICEOVER_SCHEMA = `{
  "variants": [{
    "variant": "A|B|C",
    "fullText": "string",
    "segments": [{ "timestamp": "00:00", "text": "string" }],
    "speakingNotes": "string"
  }]
}`

export const CAPTIONS_SCHEMA = `{
  "variants": [{
    "variant": "A|B|C",
    "srt": "string (SRT format)",
    "plain": "string",
    "highlighted": [{ "start": number, "end": number, "text": "string", "emphasis": boolean }]
  }]
}`

export const CTAS_SCHEMA = `[{
  "id": "string",
  "text": "string",
  "type": "primary|soft|urgency|benefit|social_proof"
}]`

export const OBJECTION_HANDLING_SCHEMA = `[{
  "objection": "string",
  "response": "string",
  "tone": "empathetic|confident|factual"
}]`

export const AD_COPY_SCHEMA = `[{
  "platform": "Meta|TikTok",
  "primaryText": "string",
  "headline": "string",
  "description": "string (optional)"
}]`
