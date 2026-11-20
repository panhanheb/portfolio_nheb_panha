import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { getPortfolioContext, buildSystemPrompt, builtInAnswer } from '../utils/portfolio'

/**
 * Portfolio chatbot.
 * Knowledge comes live from Supabase (profile, about, skills, experience, projects, blog,
 * chatbot settings) via getPortfolioContext, so edits made in /admin reach the bot.
 * Answer order: OpenAI -> Gemini -> built-in answers (always replies).
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)
  const rawPrompt = body?.prompt
  const history = body?.history

  const ctx = await getPortfolioContext(event)

  if (!rawPrompt || typeof rawPrompt !== 'string' || !rawPrompt.trim()) {
    return { responseText: ctx.content.chatbot.greeting }
  }

  // Keep requests small so a single visitor can't run up the AI bill.
  const prompt = rawPrompt.trim().slice(0, 1000)
  const systemPrompt = buildSystemPrompt(ctx)
  const aiEnabled = ctx.content.chatbot.ai_enabled !== false

  let finalResponse = ''
  let source: 'openai' | 'gemini' | 'built-in' = 'built-in'
  let aiError = aiEnabled ? '' : 'AI replies are turned off in /admin -> Website -> Chatbot'

  // Shared, trimmed conversation history (the client sends Gemini-style { role, parts }).
  const safeHistory = (Array.isArray(history) ? history.slice(-12) : [])
    .filter((m: any) => (m?.role === 'user' || m?.role === 'model') && typeof m?.parts?.[0]?.text === 'string')
    .map((m: any) => ({ role: m.role as 'user' | 'model', text: String(m.parts[0].text).slice(0, 1000) }))

  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...safeHistory.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
    { role: 'user', content: prompt }
  ]

  // 1. OpenAI (preferred when NUXT_OPENAI_API_KEY is set)
  const openaiKey = ((config.openaiApiKey as string) || process.env.OPENAI_API_KEY || '').trim()
  if (aiEnabled && openaiKey) {
    const configured = ((config.openaiModel as string) || '').trim()
    const candidateModels = [...new Set([configured, 'gpt-4.1-mini', 'gpt-4o-mini'].filter(Boolean))]

    for (const model of candidateModels) {
      try {
        const res: any = await $fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${openaiKey}` },
          body: {
            model,
            max_tokens: 300,
            temperature: 0.5,
            messages: chatMessages
          },
          timeout: 20000
        })
        finalResponse = res?.choices?.[0]?.message?.content?.trim() || ''
        if (finalResponse) { source = 'openai'; break }
      } catch (err: any) {
        const status = err?.response?.status || err?.statusCode
        aiError = `OpenAI ${model}: ${status ?? 'network'} ${err?.data?.error?.message || err?.message || ''}`.trim()
        console.warn(aiError)
        // A bad key or no credit won't be fixed by trying another model.
        if (status === 401 || status === 429) break
      }
    }
  }

  // 2. Gemini (backup)
  const geminiKey = ((config.geminiApiKey as string) || process.env.GEMINI_API_KEY || '').trim()
  if (aiEnabled && !finalResponse && geminiKey) {
    const genAI = new GoogleGenerativeAI(geminiKey)
    const geminiHistory = safeHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
    // Gemini requires the history to start with a user turn.
    while (geminiHistory.length && geminiHistory[0]!.role !== 'user') geminiHistory.shift()

    for (const modelName of ['gemini-2.5-flash', 'gemini-flash-latest']) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt })
        const result = await model.startChat({ history: geminiHistory }).sendMessage(prompt)
        finalResponse = result.response.text()?.trim() || ''
        if (finalResponse) { source = 'gemini'; break }
      } catch (err: any) {
        aiError = `Gemini ${modelName}: ${err?.message || err}`
        console.warn(aiError)
      }
    }
  }

  // 3. Built-in answers from the live portfolio (no AI needed)
  if (!finalResponse) finalResponse = builtInAnswer(prompt, ctx)

  if (aiEnabled && !openaiKey && !geminiKey && !aiError) {
    aiError = 'No AI configured. Set NUXT_OPENAI_API_KEY or NUXT_GEMINI_API_KEY, then restart the dev server.'
  }

  // 4. Log the conversation for /admin -> Chat logs (fire and forget)
  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseKey = (config.supabaseServiceRoleKey || config.public.supabaseAnonKey) as string
  if (supabaseUrl?.startsWith('http') && supabaseKey) {
    try {
      createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
        .from('chat_logs')
        .insert([{ user_prompt: prompt, bot_response: finalResponse }])
        .then(({ error }) => { if (error) console.warn('Supabase chat_logs insert:', error.message) })
    } catch {
      /* ignore logging errors */
    }
  }

  // In development only, report which AI answered and why it fell back. Never sent in production.
  return import.meta.dev
    ? { responseText: finalResponse, source, aiError: source === 'built-in' ? aiError : undefined }
    : { responseText: finalResponse }
})
