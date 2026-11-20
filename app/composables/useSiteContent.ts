import { useSupabase } from '~/composables/useSupabase'

/* ---------------------------------------------------------------------------
 * Editable website content.
 * Each section is one JSON document in the Supabase `site_content` table (key -> value).
 * The defaults below are what the site shows until a section is saved from /admin,
 * so the site always works, even without Supabase.
 * ------------------------------------------------------------------------- */

import {
  DEFAULT_CONTENT,
  DEFAULT_EXPERIENCES,
  clone,
  mergeSection,
  type SiteContent,
  type SiteSection,
  type Experience
} from '#shared/siteContent'

export * from '#shared/siteContent'

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
