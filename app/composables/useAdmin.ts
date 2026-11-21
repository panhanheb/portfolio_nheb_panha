import type { Session } from '@supabase/supabase-js'
import { useSupabase } from '~/composables/useSupabase'

export type AdminTable = 'projects' | 'blog_posts' | 'contact_submissions' | 'chat_logs' | 'chat_replies' | 'experiences'

/**
 * Admin dashboard helpers: Supabase Auth sign-in plus simple CRUD.
 * Writes are only allowed by the database when the signed-in email is listed in
 * public.admin_users (see supabase_schema.sql), so hiding the page is not the security.
 */
export const useAdmin = () => {
  const { getClient, isConfigured } = useSupabase()

  const session = useState<Session | null>('admin-session', () => null)
  const isAdmin = useState<boolean>('admin-is-admin', () => false)
  const ready = useState<boolean>('admin-ready', () => false)

  const client = () => {
    const c = getClient()
    if (!c) throw new Error('Supabase is not configured. Set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY.')
    return c
  }

  const checkAdmin = async () => {
    const { data, error } = await client().rpc('is_admin')
    isAdmin.value = !error && data === true
  }

  let listening = false
  const init = async () => {
    if (!isConfigured) {
      ready.value = true
      return
    }
    const { data } = await client().auth.getSession()
    session.value = data.session
    if (data.session) await checkAdmin()
    ready.value = true

    if (!listening) {
      listening = true
      client().auth.onAuthStateChange(async (_event, s) => {
        session.value = s
        if (s) await checkAdmin()
        else isAdmin.value = false
      })
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await client().auth.signInWithPassword({ email, password })
    if (error) throw error
    session.value = data.session
    await checkAdmin()
  }

  /**
   * Passwordless sign-in, step 1: email a one-time code.
   * shouldCreateUser: false -> only existing users (added in Supabase -> Authentication) get a code,
   * so nobody can create an account from the login page.
   */
  const sendCode = async (email: string) => {
    const { error } = await client().auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        // If the email contains a link instead of a code, clicking it signs in and lands on /admin.
        emailRedirectTo: `${window.location.origin}/admin`
      }
    })
    if (error) throw error
  }

  /** Passwordless sign-in, step 2: check the code from the email. */
  const verifyCode = async (email: string, token: string) => {
    const { data, error } = await client().auth.verifyOtp({ email, token, type: 'email' })
    if (error) throw error
    session.value = data.session
    await checkAdmin()
  }

  /** Replace the signed-in user's password (the old one is never readable, only replaceable). */
  const changePassword = async (newPassword: string) => {
    if (newPassword.length < 8) throw new Error('Use at least 8 characters.')
    const { error } = await client().auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  const signOut = async () => {
    await client().auth.signOut()
    session.value = null
    isAdmin.value = false
  }

  /* ---------------------------------- CRUD --------------------------------- */

  const list = async <T>(table: AdminTable, orderBy = 'created_at'): Promise<T[]> => {
    const { data, error } = await client().from(table).select('*').order(orderBy, { ascending: false })
    if (error) throw error
    return (data ?? []) as T[]
  }

  /** Insert when there is no id, otherwise update that row. */
  const save = async (table: AdminTable, row: Record<string, any>) => {
    const { id, created_at, ...fields } = row
    const query = id
      ? client().from(table).update(fields).eq('id', id)
      : client().from(table).insert([fields])
    const { error } = await query
    if (error) throw error
  }

  const update = async (table: AdminTable, id: string, patch: Record<string, any>) => {
    const { error } = await client().from(table).update(patch).eq('id', id)
    if (error) throw error
  }

  const remove = async (table: AdminTable, id: string) => {
    const { error } = await client().from(table).delete().eq('id', id)
    if (error) throw error
  }

  /** Delete every row where column = value (e.g. a whole chat conversation). */
  const removeWhere = async (table: AdminTable, column: string, value: string) => {
    const { error } = await client().from(table).delete().eq(column, value)
    if (error) throw error
  }

  /**
   * Upload an image to the public "media" bucket and return its public URL.
   * folder: e.g. 'blog', 'blog/content', 'projects'.
   */
  const uploadImage = async (file: File, folder = 'uploads'): Promise<string> => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']
    if (!allowed.includes(file.type)) throw new Error('Please choose a PNG, JPG, WebP, GIF or AVIF image.')
    if (file.size > 5 * 1024 * 1024) throw new Error(`That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.`)

    const ext = (file.name.split('.').pop() || file.type.split('/')[1] || 'jpg').toLowerCase()
    const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image'
    const path = `${folder}/${Date.now()}-${base}.${ext}`

    const storage = client().storage.from('media')
    const { error } = await storage.upload(path, file, { cacheControl: '31536000', contentType: file.type, upsert: false })
    if (error) {
      if (/bucket not found/i.test(error.message)) throw new Error('The "media" storage bucket is missing. Run the latest supabase_schema.sql in Supabase.')
      if (/row-level security|unauthorized|not allowed/i.test(error.message)) throw new Error('Upload blocked: only admins can upload. Run the latest supabase_schema.sql and sign in again.')
      throw error
    }
    return storage.getPublicUrl(path).data.publicUrl
  }

  /** Website sections (site_content table): read all saved sections, or save one. */
  const getContent = async () => {
    const { data, error } = await client().from('site_content').select('key, value, updated_at')
    if (error) throw error
    return data ?? []
  }
  const saveContent = async (key: string, value: unknown) => {
    const { error } = await client()
      .from('site_content')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) throw error
  }

  const count = async (table: AdminTable, filter?: { column: string; value: string }) => {
    let q = client().from(table).select('id', { count: 'exact', head: true })
    if (filter) q = q.eq(filter.column, filter.value)
    const { count: n, error } = await q
    if (error) throw error
    return n ?? 0
  }

  return { isConfigured, session, isAdmin, ready, init, signIn, sendCode, verifyCode, signOut, changePassword, getContent, saveContent, uploadImage, list, save, update, remove, removeWhere, count }
}
