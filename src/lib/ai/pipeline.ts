import { db } from '@/lib/db'
import { generateJSON, generateWithRetry } from './gemini'
import {
  ProductBrief,
  GenerationConfig,
  buildHooksPrompt,
  buildScriptsPrompt,
  buildShotlistPrompt,
  buildVoiceoverPrompt,
  buildCaptionsPrompt,
  buildCTAsPrompt,
  buildObjectionHandlingPrompt,
  buildAdCopyPrompt,
  HOOKS_SCHEMA,
  SCRIPTS_SCHEMA,
  SHOTLIST_SCHEMA,
  VOICEOVER_SCHEMA,
  CAPTIONS_SCHEMA,
  CTAS_SCHEMA,
  OBJECTION_HANDLING_SCHEMA,
  AD_COPY_SCHEMA,
} from './prompts'
import { Hook, Script, ShotlistItem, CTA, AdCopy } from '@/lib/validations/generation'
import { hashProductBrief } from '@/lib/utils'
import { getCache, setCache } from '@/lib/redis'

const CACHE_TTL = 60 * 60 * 24 // 24 hours

interface GenerationResult {
  hooks: Hook[]
  scripts: Script[]
  shotlist: ShotlistItem[]
  voiceover: unknown
  captions: unknown
  ctas: CTA[]
  objectionHandling: unknown
  adCopy: AdCopy[]
}

export async function runGenerationPipeline(
  generationId: string,
  brief: ProductBrief,
  config: GenerationConfig,
  onProgress?: (step: string, progress: number) => void
): Promise<GenerationResult> {
  const briefHash = hashProductBrief({ ...brief, ...config })
  const cacheKey = `generation:${briefHash}`

  // Check cache first
  const cached = await getCache<GenerationResult>(cacheKey)
  if (cached) {
    await updateGenerationStatus(generationId, cached)
    return cached
  }

  const result: Partial<GenerationResult> = {}

  try {
    // Step 1: Generate Hooks (10 variants)
    onProgress?.('Generiere Hooks...', 10)
    result.hooks = await generateWithRetry(async () => {
      const prompt = buildHooksPrompt(brief, config)
      return generateJSON<Hook[]>(prompt, HOOKS_SCHEMA)
    })
    await savePartialResult(generationId, { hooks: result.hooks })

    // Step 2: Generate Scripts (3 variants A/B/C)
    onProgress?.('Erstelle Skripte...', 30)
    result.scripts = await generateWithRetry(async () => {
      const hookTexts = result.hooks!.map((h) => h.text)
      const prompt = buildScriptsPrompt(brief, config, hookTexts)
      return generateJSON<Script[]>(prompt, SCRIPTS_SCHEMA)
    })
    await savePartialResult(generationId, { scripts: result.scripts })

    // Step 3: Generate Shotlist
    onProgress?.('Erstelle Shotlist...', 45)
    result.shotlist = await generateWithRetry(async () => {
      const prompt = buildShotlistPrompt(brief, config, result.scripts!)
      return generateJSON<ShotlistItem[]>(prompt, SHOTLIST_SCHEMA)
    })
    await savePartialResult(generationId, { shotlist: result.shotlist })

    // Step 4: Generate Voiceover
    onProgress?.('Generiere Voiceover...', 55)
    result.voiceover = await generateWithRetry(async () => {
      const prompt = buildVoiceoverPrompt(brief, result.scripts!)
      return generateJSON(prompt, VOICEOVER_SCHEMA)
    })
    await savePartialResult(generationId, { voiceover: result.voiceover })

    // Step 5: Generate Captions
    onProgress?.('Erstelle Untertitel...', 65)
    result.captions = await generateWithRetry(async () => {
      const prompt = buildCaptionsPrompt(result.voiceover, config)
      return generateJSON(prompt, CAPTIONS_SCHEMA)
    })
    await savePartialResult(generationId, { captions: result.captions })

    // Step 6: Generate CTAs
    onProgress?.('Generiere CTAs...', 75)
    result.ctas = await generateWithRetry(async () => {
      const prompt = buildCTAsPrompt(brief, config)
      return generateJSON<CTA[]>(prompt, CTAS_SCHEMA)
    })
    await savePartialResult(generationId, { ctas: result.ctas })

    // Step 7: Generate Objection Handling
    onProgress?.('Erstelle Einwandbehandlung...', 85)
    result.objectionHandling = await generateWithRetry(async () => {
      const prompt = buildObjectionHandlingPrompt(brief)
      return generateJSON(prompt, OBJECTION_HANDLING_SCHEMA)
    })
    await savePartialResult(generationId, { objectionHandling: result.objectionHandling })

    // Step 8: Generate Ad Copy
    onProgress?.('Generiere Ad Copy...', 95)
    result.adCopy = await generateWithRetry(async () => {
      const hookTexts = result.hooks!.slice(0, 3).map((h) => h.text)
      const prompt = buildAdCopyPrompt(brief, config, hookTexts, result.ctas!)
      return generateJSON<AdCopy[]>(prompt, AD_COPY_SCHEMA)
    })

    // Complete!
    onProgress?.('Fertig!', 100)

    const finalResult = result as GenerationResult

    // Cache the result
    await setCache(cacheKey, finalResult, CACHE_TTL)

    // Update generation with all results
    await db.generation.update({
      where: { id: generationId },
      data: {
        status: 'COMPLETED',
        hooks: finalResult.hooks as object,
        scripts: finalResult.scripts as object,
        shotlist: finalResult.shotlist as object,
        voiceover: finalResult.voiceover as object,
        captions: finalResult.captions as object,
        ctas: finalResult.ctas as object,
        objectionHandling: finalResult.objectionHandling as object,
        adCopy: finalResult.adCopy as object,
        completedAt: new Date(),
      },
    })

    return finalResult
  } catch (error) {
    console.error('Generation pipeline error:', error)

    await db.generation.update({
      where: { id: generationId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
    })

    throw error
  }
}

async function savePartialResult(generationId: string, data: Partial<GenerationResult>) {
  const updateData: Record<string, object> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value) {
      updateData[key] = value as object
    }
  }

  await db.generation.update({
    where: { id: generationId },
    data: updateData,
  })
}

async function updateGenerationStatus(generationId: string, result: GenerationResult) {
  await db.generation.update({
    where: { id: generationId },
    data: {
      status: 'COMPLETED',
      hooks: result.hooks as object,
      scripts: result.scripts as object,
      shotlist: result.shotlist as object,
      voiceover: result.voiceover as object,
      captions: result.captions as object,
      ctas: result.ctas as object,
      objectionHandling: result.objectionHandling as object,
      adCopy: result.adCopy as object,
      completedAt: new Date(),
    },
  })
}

// Regenerate single section
export async function regenerateSection(
  generationId: string,
  section: keyof GenerationResult,
  instructions?: string
): Promise<unknown> {
  const generation = await db.generation.findUnique({
    where: { id: generationId },
    include: { brand: true, product: true },
  })

  if (!generation) throw new Error('Generation nicht gefunden')

  const brief: ProductBrief = {
    productName: generation.product?.name || '',
    productDescription: generation.product?.description || '',
    productPrice: generation.product?.price || undefined,
    benefits: generation.product?.benefits || [],
    objections: generation.product?.objections || [],
    reviews: generation.product?.reviews || [],
    brandName: generation.brand.name,
    targetAudience: generation.brand.targetAudience || '',
    tonality: generation.brand.tonality,
    usps: generation.brand.usps,
    noGos: generation.brand.noGos,
    industry: generation.brand.industry,
  }

  const config: GenerationConfig = {
    platform: generation.platform,
    goal: generation.goal,
    style: generation.style,
    duration: generation.duration,
    language: generation.language,
  }

  let result: unknown

  switch (section) {
    case 'hooks':
      const hookPrompt = buildHooksPrompt(brief, config) + (instructions ? `\n\nZusätzliche Anweisungen: ${instructions}` : '')
      result = await generateWithRetry(() => generateJSON(hookPrompt, HOOKS_SCHEMA))
      break

    case 'scripts':
      const hooks = (generation.hooks as Hook[]) || []
      const scriptPrompt = buildScriptsPrompt(brief, config, hooks.map(h => h.text)) + (instructions ? `\n\nZusätzliche Anweisungen: ${instructions}` : '')
      result = await generateWithRetry(() => generateJSON(scriptPrompt, SCRIPTS_SCHEMA))
      break

    case 'shotlist':
      const scripts = (generation.scripts as Script[]) || []
      const shotlistPrompt = buildShotlistPrompt(brief, config, scripts) + (instructions ? `\n\nZusätzliche Anweisungen: ${instructions}` : '')
      result = await generateWithRetry(() => generateJSON(shotlistPrompt, SHOTLIST_SCHEMA))
      break

    case 'ctas':
      const ctaPrompt = buildCTAsPrompt(brief, config) + (instructions ? `\n\nZusätzliche Anweisungen: ${instructions}` : '')
      result = await generateWithRetry(() => generateJSON(ctaPrompt, CTAS_SCHEMA))
      break

    case 'objectionHandling':
      const objPrompt = buildObjectionHandlingPrompt(brief) + (instructions ? `\n\nZusätzliche Anweisungen: ${instructions}` : '')
      result = await generateWithRetry(() => generateJSON(objPrompt, OBJECTION_HANDLING_SCHEMA))
      break

    case 'adCopy':
      const hooksForCopy = (generation.hooks as Hook[])?.slice(0, 3).map(h => h.text) || []
      const ctas = generation.ctas || []
      const adCopyPrompt = buildAdCopyPrompt(brief, config, hooksForCopy, ctas) + (instructions ? `\n\nZusätzliche Anweisungen: ${instructions}` : '')
      result = await generateWithRetry(() => generateJSON(adCopyPrompt, AD_COPY_SCHEMA))
      break

    default:
      throw new Error(`Unbekannter Abschnitt: ${section}`)
  }

  // Update the generation with new section
  await db.generation.update({
    where: { id: generationId },
    data: {
      [section]: result as object,
      updatedAt: new Date(),
    },
  })

  return result
}
