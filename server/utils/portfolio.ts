import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'
import {
  DEFAULT_CONTENT,
  DEFAULT_EXPERIENCES,
  clone,
  mergeSection,
  type SiteContent,
  type SiteSection,
  type Experience
} from '#shared/siteContent'

/**
 * Live portfolio knowledge for the chatbot.
 * Pulled from the same Supabase tables the website and /admin use, so whatever
 * you edit in the dashboard is what the bot knows (cached for a minute).
 */

export interface PortfolioProject { title: string; category: string; description: string; tags: string[]; demo_url?: string }
export interface PortfolioPost { title: string; category: string; summary: string; slug: string }

export interface PortfolioContext {
  content: SiteContent
  experiences: Experience[]
  projects: PortfolioProject[]
  posts: PortfolioPost[]
}

const FALLBACK_PROJECTS: PortfolioProject[] = [
  { title: 'RED ANT Express', category: 'E-Commerce', description: 'Customer shopping app: browse products, cart, checkout and order tracking.', tags: ['Flutter', 'Dart'] },
  { title: 'RED ANT Merchant', category: 'Merchant App', description: 'Seller app to manage products and incoming orders.', tags: ['Flutter', 'Dart'] },
  { title: 'RED ANT Driver', category: 'Delivery App', description: 'Driver app for accepting delivery jobs and updating orders to drop-off.', tags: ['Flutter', 'Dart'] },
  { title: 'E-Shop Native', category: 'E-Commerce', description: 'Native Android/iOS shopping app.', tags: ['Kotlin', 'Swift'] }
]

const CACHE_MS = 60_000
let cache: { at: number; data: PortfolioContext } | null = null

export const getPortfolioContext = async (event: H3Event): Promise<PortfolioContext> => {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data

  const ctx: PortfolioContext = {
    content: clone(DEFAULT_CONTENT),
    experiences: clone(DEFAULT_EXPERIENCES),
    projects: FALLBACK_PROJECTS,
    posts: []
  }

  const config = useRuntimeConfig(event)
  const url = config.public.supabaseUrl as string
  const key = config.public.supabaseAnonKey as string // public read access is enough

  if (url?.startsWith('http') && key) {
    try {
      const supabase = createClient(url, key, { auth: { persistSession: false } })
      const [content, exp, projects, posts] = await Promise.all([
        supabase.from('site_content').select('key, value'),
        supabase.from('experiences').select('*').order('sort_order', { ascending: true }),
        supabase.from('projects').select('title, category, description, tags, demo_url, featured'),
        supabase.from('blog_posts').select('title, category, summary, slug').order('created_at', { ascending: false }).limit(10)
      ])

      for (const row of content.data ?? []) {
        if (row.key in ctx.content) (ctx.content as any)[row.key] = mergeSection(row.key as SiteSection, row.value)
      }
      if (exp.data?.length) {
        ctx.experiences = exp.data.map((e: any) => ({
          ...e,
          highlights: Array.isArray(e.highlights) ? e.highlights : [],
          tech_stack: Array.isArray(e.tech_stack) ? e.tech_stack : []
        }))
      }
      if (projects.data?.length) {
        ctx.projects = projects.data
          .filter((p: any) => p.featured !== false)
          .map((p: any) => ({
            title: p.title,
            category: p.category,
            description: p.description,
            demo_url: p.demo_url || undefined,
            tags: (Array.isArray(p.tags) ? p.tags : []).map((t: any) => (typeof t === 'string' ? t : t?.name)).filter(Boolean)
          }))
      }
      if (posts.data?.length) ctx.posts = posts.data as PortfolioPost[]
    } catch (err: any) {
      console.warn('Chatbot: could not load portfolio from Supabase, using defaults:', err?.message || err)
    }
  }

  cache = { at: Date.now(), data: ctx }
  return ctx
}

/** System prompt for the AI, written from the live portfolio. */
export const buildSystemPrompt = (ctx: PortfolioContext) => {
  const { profile, hero, about, skills, chatbot } = ctx.content
  const skillLines = skills.groups
    .map(g => `- ${g.title}: ${g.items.map(i => (i.note ? `${i.name} (${i.note})` : i.name)).join(', ')}`)
    .join('\n')
  const expLines = ctx.experiences
    .map(e => `- ${e.period}: ${e.role} at ${e.company}${e.location ? ` (${e.location})` : ''}. ${e.summary}${e.highlights.length ? ` Highlights: ${e.highlights.join(' ')}` : ''}`)
    .join('\n')
  const projectLines = ctx.projects
    .map(p => `- ${p.title} [${p.category}]: ${p.description}${p.tags.length ? ` Built with ${p.tags.join(', ')}.` : ''}${p.demo_url ? ` Demo: ${p.demo_url}` : ''}`)
    .join('\n')
  const postLines = ctx.posts.map(p => `- "${p.title}" (${p.category}): ${p.summary}`).join('\n')
  const contactLines = [
    profile.email && `Email: ${profile.email}`,
    profile.telegram && `Telegram: @${profile.telegram} (https://t.me/${profile.telegram})`,
    profile.github_url && `GitHub: ${profile.github_url}`,
    profile.linkedin_url && `LinkedIn: ${profile.linkedin_url}`,
    'Or use the contact form on this website.'
  ].filter(Boolean).join('\n')

  return `
You are the AI assistant on ${profile.name}'s portfolio website. You answer visitors' questions about ${profile.name}.

ABOUT ${profile.name.toUpperCase()}
- Role: ${profile.role}
- Location: ${profile.location} (${profile.timezone})
- Availability: ${profile.availability}
- Intro: ${hero.intro}
${about.paragraphs.map(p => `- ${p}`).join('\n')}
- Quick facts: ${hero.facts.map(f => `${f.label}: ${f.value}`).join('; ')}

SERVICES
${about.services.map(s => `- ${s.title}: ${s.body}`).join('\n')}

SKILLS
${skillLines}
Working style: ${skills.practices.join('; ')}

EXPERIENCE (most recent first)
${expLines}

PROJECTS
${projectLines}
${postLines ? `\nBLOG POSTS\n${postLines}\n` : ''}
CONTACT
${contactLines}
${chatbot.instructions?.trim() ? `\nEXTRA INSTRUCTIONS FROM ${profile.name.toUpperCase()}\n${chatbot.instructions.trim()}\n` : ''}
RULES
- Only use the facts above. If something isn't covered, say you don't know and suggest contacting ${profile.name} directly. Never invent clients, numbers, prices or dates.
- Be friendly, professional and concise: usually 2-4 sentences, under 90 words. Use short bullet lists only when listing several items.
- Reply in the same language the visitor writes in (for example Khmer or English).
- When someone wants to hire or collaborate, point them to the contact form or ${profile.email}.
- Stay on topic: ${profile.name}'s work, skills, projects and availability. Politely decline unrelated requests.
`.trim()
}

/** Keyword answers built from the live portfolio, used when no AI is available. */
export const builtInAnswer = (rawPrompt: string, ctx: PortfolioContext): string => {
  const q = rawPrompt.toLowerCase()
  const { profile, about, skills } = ctx.content
  const name = profile.name
  // Khmer order is family name first ("Nheb Panha"), so the given name is the last word.
  const first = name.trim().split(/\s+/).pop() || name
  const has = (...words: string[]) => words.some(w => q.includes(w))
  const list = (items: string[]) => items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`

  if (has('availab', 'hire', 'freelance', 'job', 'work with', 'collaborat')) {
    return `${profile.availability}. The quickest way to reach ${first} is the contact form on this page or email at ${profile.email}.`
  }
  if (has('contact', 'email', 'telegram', 'reach', 'phone')) {
    const ways = [`email at ${profile.email}`, profile.telegram && `Telegram @${profile.telegram}`, 'the contact form on this page'].filter(Boolean) as string[]
    return `You can contact ${first} via ${list(ways)}.`
  }
  if (has('experience', 'career', 'worked', 'company', 'background')) {
    const roles = ctx.experiences.slice(0, 3).map(e => `${e.role} at ${e.company} (${e.period})`)
    return roles.length
      ? `${first}'s experience includes ${roles.join('; ')}. See the Experience section for the full timeline.`
      : `See the Experience section for ${first}'s work history.`
  }
  if (has('project', 'portfolio', 'built', 'app', 'work')) {
    const names = ctx.projects.slice(0, 5).map(p => `${p.title} (${p.category})`)
    return names.length
      ? `${first}'s projects include ${list(names)}. Open the Projects section for details.`
      : `Take a look at the Projects section to see ${first}'s work.`
  }
  if (has('skill', 'stack', 'tech', 'language', 'framework', 'tool')) {
    const groups = skills.groups.slice(0, 4).map(g => `${g.title}: ${g.items.slice(0, 3).map(i => i.name).join(', ')}`)
    return `${first}'s main skills: ${groups.join('; ')}.`
  }
  if (has('service', 'offer', 'help', 'do you do', 'can you')) {
    return `${first} offers ${list(about.services.map(s => s.title.toLowerCase()))}. Tell me what you're building and I'll point you in the right direction.`
  }
  if (has('blog', 'article', 'post', 'writing')) {
    const titles = ctx.posts.slice(0, 3).map(p => `"${p.title}"`)
    return titles.length ? `Recent articles: ${list(titles)}. See the Writing section to read them.` : `Check the Writing section for ${first}'s articles.`
  }
  if (has('who', 'about', 'yourself', 'introduce')) {
    return `${name} is a ${profile.role} based in ${profile.location}. ${about.paragraphs[0] ?? ''}`.trim()
  }
  if (has('hello', 'hi', 'hey', 'សួស្តី')) {
    return ctx.content.chatbot.greeting
  }
  return `I can tell you about ${first}'s skills, projects, experience or availability. What would you like to know?`
}
