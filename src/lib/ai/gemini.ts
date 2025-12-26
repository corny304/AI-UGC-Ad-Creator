import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const MODEL = 'gemini-1.5-pro'
export const FAST_MODEL = 'gemini-1.5-flash'

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

export function getModel(fast: boolean = false) {
  return genAI.getGenerativeModel({
    model: fast ? FAST_MODEL : MODEL,
    safetySettings,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  })
}

export async function generateJSON<T>(
  prompt: string,
  schema: string,
  fast: boolean = false
): Promise<T> {
  const model = getModel(fast)

  const systemPrompt = `Du bist ein erfahrener UGC Ad Creator und Copywriter.
Antworte AUSSCHLIESSLICH mit validem JSON gemäß dem folgenden Schema.
Keine Erklärungen, keine Markdown-Codeblöcke, nur pures JSON.

Schema:
${schema}

WICHTIG:
- Keine medizinischen Behauptungen
- Keine illegalen oder irreführenden Aussagen
- Keine Hassrede oder diskriminierende Inhalte
- Alle Texte auf Deutsch (sofern nicht anders angegeben)`

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: prompt },
  ])

  const response = result.response
  const text = response.text()

  // Clean up response - remove markdown code blocks if present
  let cleanedText = text.trim()
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.slice(7)
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.slice(3)
  }
  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.slice(0, -3)
  }
  cleanedText = cleanedText.trim()

  try {
    return JSON.parse(cleanedText) as T
  } catch (error) {
    console.error('Failed to parse JSON:', cleanedText)
    throw new Error(`Invalid JSON response: ${error}`)
  }
}

export async function generateText(prompt: string, fast: boolean = true): Promise<string> {
  const model = getModel(fast)
  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function generateWithRetry<T>(
  generateFn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateFn()
    } catch (error) {
      lastError = error as Error
      console.error(`Attempt ${attempt + 1} failed:`, error)

      // Don't retry on certain errors
      if (error instanceof Error) {
        if (error.message.includes('SAFETY')) {
          throw new Error('Inhalt wurde aus Sicherheitsgründen blockiert')
        }
        if (error.message.includes('quota')) {
          throw new Error('API-Kontingent erschöpft')
        }
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  throw lastError
}

export function estimateTokens(text: string): number {
  // Rough estimation for Gemini
  return Math.ceil(text.length / 4)
}
