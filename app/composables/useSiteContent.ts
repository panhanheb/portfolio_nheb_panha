import { useSupabase } from '~/composables/useSupabase'

/* ---------------------------------------------------------------------------
 * Editable website content.
 * Each section is one JSON document in the Supabase `site_content` table (key -> value).
 * The defaults below are what the site shows until a section is saved from /admin,
 * so the site always works, even without Supabase.
 * ------------------------------------------------------------------------- */

export interface IconItem { name: string; icon: string }
export interface Fact { label: string; value: string }
export interface ServiceCard { icon: string; title: string; body: string }
export interface SkillItem { name: string; icon: string; note: string }
export interface SkillGroup { title: string; icon: string; items: SkillItem[] }

export interface SiteContent {
  profile: {
    name: string
    role: string
    availability: string
    location: string
    timezone: string
    email: string
    telegram: string
    github_url: string
    linkedin_url: string
    portrait_url: string
  }
  hero: { intro: string; facts: Fact[] }
  about: { title: string; paragraphs: string[]; core_stack: IconItem[]; services: ServiceCard[] }
  skills: { title: string; lead: string; groups: SkillGroup[]; practices: string[] }
  contact: { title: string; lead: string }
  footer: { tagline: string; services: IconItem[]; tech: IconItem[] }
}

export type SiteSection = keyof SiteContent

export interface Experience {
  id?: string
  period: string
  role: string
  company: string
  location: string
  type: string
  summary: string
  highlights: string[]
  tech_stack: string[]
  sort_order: number
}

export const DEFAULT_CONTENT: SiteContent = {
  profile: {
    name: 'Nheb Panha',
    role: 'Flutter & Full-Stack Developer',
    availability: 'Available for freelance and full-time roles',
    location: 'Phnom Penh, Cambodia',
    timezone: 'UTC+7',
    email: 'nhebpanha78@gmail.com',
    telegram: 'panhanheb',
    github_url: 'https://github.com/panhanheb',
    linkedin_url: 'https://linkedin.com/in/nhebpanha',
    portrait_url: '/image/panha_portrait.jpg'
  },
  hero: {
    intro:
      'I build cross-platform mobile apps and web platforms end to end, from the database and APIs to a polished interface. I work mainly with Flutter, Nuxt, Laravel and Supabase, and I bring an accounting background to products where data accuracy matters.',
    facts: [
      { label: 'Focus', value: 'Mobile & Web' },
      { label: 'Building since', value: '2022' },
      { label: 'Core stack', value: 'Flutter · Nuxt' }
    ]
  },
  about: {
    title: 'Developer with an eye for detail and data',
    paragraphs: [
      "I'm a full-stack developer based in Phnom Penh who specialises in cross-platform mobile apps with Flutter and modern web applications with Nuxt and Vue.",
      'Before software, I trained in accounting. That shapes how I work: careful data modelling, predictable state, and interfaces that make complex information easy to read.',
      'I care about clean architecture, strict typing and shipping things that hold up in production, and I enjoy owning a feature from database schema to final pixel.'
    ],
    core_stack: [
      { name: 'Flutter', icon: 'devicon:flutter' },
      { name: 'Dart', icon: 'logos:dart' },
      { name: 'Nuxt', icon: 'logos:nuxt-icon' },
      { name: 'Vue', icon: 'logos:vue' },
      { name: 'Laravel', icon: 'logos:laravel' },
      { name: 'Supabase', icon: 'logos:supabase-icon' },
      { name: 'PostgreSQL', icon: 'logos:postgresql' },
      { name: 'TypeScript', icon: 'logos:typescript-icon' }
    ],
    services: [
      { icon: 'smartphone', title: 'Mobile apps', body: 'Cross-platform Flutter apps for iOS and Android with clean state management (BLoC, Riverpod) and offline support.' },
      { icon: 'web', title: 'Web applications', body: 'Fast, responsive Nuxt and Vue apps with TypeScript, accessible UI and a maintainable component structure.' },
      { icon: 'dns', title: 'Backends & APIs', body: 'REST APIs in Laravel and Node.js, authentication, background jobs and integrations such as payments and Telegram.' },
      { icon: 'database', title: 'Data & databases', body: 'PostgreSQL and MySQL schema design, Supabase with row-level security, and reporting for finance-style data.' }
    ]
  },
  skills: {
    title: 'Tools and technologies',
    lead: 'The stack I use day to day, grouped by where it fits in a product.',
    groups: [
      {
        title: 'Mobile', icon: 'smartphone', items: [
          { name: 'Flutter', icon: 'devicon:flutter', note: 'Primary' },
          { name: 'Dart', icon: 'logos:dart', note: '' },
          { name: 'BLoC & Riverpod', icon: 'mdi:state-machine', note: '' },
          { name: 'Firebase', icon: 'logos:firebase-icon', note: 'Auth, FCM' }
        ]
      },
      {
        title: 'Frontend', icon: 'web', items: [
          { name: 'Nuxt', icon: 'logos:nuxt-icon', note: 'Primary' },
          { name: 'Vue 3', icon: 'logos:vue', note: '' },
          { name: 'TypeScript', icon: 'logos:typescript-icon', note: '' },
          { name: 'Tailwind CSS', icon: 'logos:tailwindcss-icon', note: '' }
        ]
      },
      {
        title: 'Backend', icon: 'dns', items: [
          { name: 'Laravel', icon: 'logos:laravel', note: 'REST APIs' },
          { name: 'Node.js & Express', icon: 'logos:nodejs-icon', note: '' },
          { name: 'Supabase', icon: 'logos:supabase-icon', note: 'Auth, RLS' },
          { name: 'Telegram Bot API', icon: 'logos:telegram', note: '' }
        ]
      },
      {
        title: 'Data', icon: 'database', items: [
          { name: 'PostgreSQL', icon: 'logos:postgresql', note: '' },
          { name: 'MySQL', icon: 'logos:mysql-icon', note: '' },
          { name: 'Redis', icon: 'logos:redis', note: '' }
        ]
      },
      {
        title: 'Tooling', icon: 'build', items: [
          { name: 'Git & GitHub Actions', icon: 'logos:git-icon', note: 'CI/CD' },
          { name: 'Docker', icon: 'logos:docker-icon', note: '' },
          { name: 'Figma', icon: 'logos:figma', note: 'Design to code' }
        ]
      }
    ],
    practices: [
      'Clean architecture with clear separation between UI, state and data layers',
      'Strict typing in TypeScript and Dart to catch errors before release',
      'Database-level security with row-level policies',
      'Responsive, accessible interfaces that work on every screen size'
    ]
  },
  contact: {
    title: "Let's work together",
    lead: "Have a mobile app, web platform or backend project in mind? Send me a message and I'll get back to you within one or two working days."
  },
  footer: {
    tagline: 'Building scalable mobile and web applications with Flutter, Nuxt, Supabase and modern technologies.',
    services: [
      { name: 'Mobile App Development', icon: 'mdi:cellphone' },
      { name: 'Web Development', icon: 'mdi:web' },
      { name: 'Backend & REST APIs', icon: 'mdi:code-tags' },
      { name: 'Supabase Solutions', icon: 'mdi:cloud-outline' },
      { name: 'Flutter Consulting', icon: 'mdi:lightning-bolt' }
    ],
    tech: [
      { name: 'Flutter', icon: 'devicon:flutter' },
      { name: 'Supabase', icon: 'devicon:supabase' },
      { name: 'Firebase', icon: 'devicon:firebase' }
    ]
  }
}

export const DEFAULT_EXPERIENCES: Experience[] = [
  {
    period: '2025 — Present', role: 'Senior Flutter & Supabase Developer', company: 'Cross-Platform Mobile Ecosystems',
    location: 'Phnom Penh / Remote', type: 'Full-time', sort_order: 1,
    summary: 'Building high-performance Flutter mobile applications with real-time Supabase PostgreSQL synchronisation, biometric security, BLoC state isolation and offline caching.',
    highlights: [
      'Engineered a FinTech mobile wallet handling real-time WebSocket transaction feeds.',
      'Designed row-level security (RLS) policies for Supabase PostgreSQL schemas.',
      'Optimised local Hive/Isar caching, reducing initial launch time by 38%.'
    ],
    tech_stack: ['Flutter', 'Dart', 'Supabase', 'PostgreSQL', 'Firebase', 'BLoC']
  },
  {
    period: '2024 — 2025', role: 'Full-Stack Nuxt & Vue Engineer', company: 'Enterprise SaaS Solutions',
    location: 'Phnom Penh', type: 'Full-time', sort_order: 2,
    summary: 'Developed modular server-rendered web applications in Nuxt 3 and Vue 3, with a custom design system and payment gateway integrations.',
    highlights: [
      'Built responsive web portals serving over 50,000 monthly sessions with sub-second page loads.',
      'Integrated Pinia state management with persisted storage for reliable session retention.',
      'Created reusable design tokens and a dark/light theme system.'
    ],
    tech_stack: ['Nuxt 3', 'Vue 3', 'TypeScript', 'Tailwind CSS', 'Pinia', 'REST API']
  },
  {
    period: '2023 — 2024', role: 'Backend & Database Developer', company: 'Cloud Infrastructure & API Services',
    location: 'Phnom Penh', type: 'Full-time', sort_order: 3,
    summary: 'Built REST APIs in Laravel and Node.js with database indexing, background queue jobs and automated Telegram alerting.',
    highlights: [
      'Built financial accounting API endpoints processing daily transactions within atomic database transactions.',
      'Optimised SQL queries and compound indexes, cutting database response latency by 40%.',
      'Integrated Telegram bot alerts for immediate production error reporting.'
    ],
    tech_stack: ['Laravel', 'Node.js', 'MySQL', 'PostgreSQL', 'Redis', 'Telegram API']
  },
  {
    period: '2022 — 2023', role: 'Junior Mobile & Web Developer', company: 'Digital Product Innovation Lab',
    location: 'Phnom Penh', type: 'Full-time', sort_order: 4,
    summary: 'Created cross-platform UI components from high-fidelity Figma designs and set up continuous integration with GitHub Actions.',
    highlights: [
      'Built 15+ reusable Flutter UI widget packages following a shared design system.',
      'Automated multi-platform builds using GitHub Actions CI/CD pipelines.'
    ],
    tech_stack: ['Flutter', 'JavaScript', 'HTML/CSS', 'Git', 'GitHub Actions', 'Figma']
  }
]

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

/** Saved values win; anything missing falls back to the default for that field. */
const mergeSection = <K extends SiteSection>(key: K, saved: unknown): SiteContent[K] => {
  const base = clone(DEFAULT_CONTENT[key]) as Record<string, any>
  if (!saved || typeof saved !== 'object') return base as SiteContent[K]
  for (const [k, v] of Object.entries(saved as Record<string, any>)) {
    if (k in base && v !== null && v !== undefined) base[k] = v
  }
  return base as SiteContent[K]
}

let loading: Promise<void> | null = null

export const useSiteContent = () => {
  const { getClient } = useSupabase()

  const content = useState<SiteContent>('site-content', () => clone(DEFAULT_CONTENT))
  const experiences = useState<Experience[]>('site-experiences', () => clone(DEFAULT_EXPERIENCES))

  /** Load everything once per page view (all sections share one request). */
  const load = (force = false) => {
    if (loading && !force) return loading
    loading = (async () => {
      const client = getClient()
      if (!client) return
      try {
        const [{ data: rows }, { data: exp }] = await Promise.all([
          client.from('site_content').select('key, value'),
          client.from('experiences').select('*').order('sort_order', { ascending: true })
        ])
        if (rows?.length) {
          const next = clone(DEFAULT_CONTENT)
          for (const row of rows) {
            if (row.key in next) (next as any)[row.key] = mergeSection(row.key as SiteSection, row.value)
          }
          content.value = next
        }
        if (exp?.length) {
          experiences.value = exp.map((e: any) => ({
            ...e,
            highlights: Array.isArray(e.highlights) ? e.highlights : [],
            tech_stack: Array.isArray(e.tech_stack) ? e.tech_stack : []
          }))
        }
      } catch {
        /* keep defaults */
      }
    })()
    return loading
  }

  return { content, experiences, load, mergeSection }
}
