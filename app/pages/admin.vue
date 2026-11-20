<template>
  <div class="min-h-screen bg-surface">
    <!-- Loading -->
    <div v-if="!ready" class="flex min-h-screen items-center justify-center text-sm text-on-surface-variant">
      <Icon name="mdi:loading" class="mr-2 animate-spin text-lg" /> Loading…
    </div>

    <!-- Supabase not set up -->
    <div v-else-if="!isConfigured" class="flex min-h-screen items-center justify-center p-4">
      <div class="card max-w-md p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-amber-500">database_off</span>
        <h1 class="mt-3 text-lg font-semibold text-on-surface">Supabase isn't connected</h1>
        <p class="mt-2 text-sm text-on-surface-variant">
          Set <code class="font-mono">NUXT_PUBLIC_SUPABASE_URL</code> and <code class="font-mono">NUXT_PUBLIC_SUPABASE_ANON_KEY</code>, then reload.
        </p>
      </div>
    </div>

    <!-- Sign in -->
    <div v-else-if="!session" class="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div aria-hidden="true" class="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl"></div>
      <div aria-hidden="true" class="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>

      <form class="card relative w-full max-w-sm p-8 shadow-xl" @submit.prevent="handleSignIn">
        <div class="flex flex-col items-center text-center">
          <div class="relative">
            <div class="h-24 w-24 overflow-hidden rounded-full bg-surface ring-4 ring-primary/25 ring-offset-2 ring-offset-background">
              <img
                src="/image/panha_avatar.jpg"
                alt="Nheb Panha"
                width="96"
                height="96"
                class="h-full w-full object-cover"
              />
            </div>
            <span class="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background bg-emerald-500" aria-hidden="true"></span>
          </div>
          <h1 class="mt-4 text-xl font-semibold text-on-surface">Welcome back, Panha</h1>
          <p class="mt-1 text-sm text-on-surface-variant">Sign in to manage your portfolio.</p>
        </div>

        <label class="mt-7 block">
          <span class="label">Email</span>
          <input v-model.trim="email" type="email" required autocomplete="username" class="input" />
        </label>
        <div class="mt-4">
          <label for="admin-password" class="label">Password</label>
          <div class="relative">
            <input
              id="admin-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              class="input !pr-11"
            />
            <button
              type="button"
              class="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <span class="material-symbols-outlined text-[20px]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>

        <p v-if="authError" class="mt-4 text-sm text-rose-600 dark:text-rose-400">{{ authError }}</p>

        <button type="submit" class="btn-primary mt-6 w-full" :disabled="signingIn">
          <Icon v-if="signingIn" name="mdi:loading" class="animate-spin" />
          {{ signingIn ? 'Signing in…' : 'Sign in' }}
        </button>
        <NuxtLink to="/" class="mt-4 block text-center text-sm text-on-surface-variant hover:text-primary">← Back to site</NuxtLink>
      </form>
    </div>

    <!-- Signed in but not an admin -->
    <div v-else-if="!isAdmin" class="flex min-h-screen items-center justify-center p-4">
      <div class="card max-w-md p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-rose-500">lock</span>
        <h1 class="mt-3 text-lg font-semibold text-on-surface">No admin access</h1>
        <p class="mt-2 text-sm text-on-surface-variant">
          <strong class="text-on-surface">{{ session.user.email }}</strong> isn't in the <code class="font-mono">admin_users</code> table.
          Add it in Supabase, then sign in again.
        </p>
        <button class="btn-secondary mt-6" @click="signOut">Sign out</button>
      </div>
    </div>

    <!-- Dashboard -->
    <div v-else>
      <header class="sticky top-0 z-40 border-b border-line bg-background/85 backdrop-blur-md">
        <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div class="flex items-center gap-2.5">
            <img src="/logo_test.png" alt="" class="h-8 w-8 rounded-lg bg-zinc-900 object-contain p-1 ring-1 ring-line" />
            <span class="text-[15px] font-semibold text-on-surface">Admin</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="hidden items-center gap-2 text-sm text-on-surface-variant md:inline-flex">
              <span class="h-8 w-8 overflow-hidden rounded-full ring-2 ring-primary/30">
                <img src="/image/panha_avatar.jpg" alt="" class="h-full w-full object-cover" />
              </span>
              {{ session.user.email }}
            </span>
            <button
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-on-surface-variant hover:text-on-surface"
              :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
              @click="toggleDark"
            >
              <span class="material-symbols-outlined text-[20px]">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
            </button>
            <NuxtLink to="/" class="btn-secondary !px-3 !py-2">
              <span class="material-symbols-outlined text-[18px]">open_in_new</span>
              <span class="hidden sm:inline">View site</span>
            </NuxtLink>
            <button class="btn-secondary !px-3 !py-2" @click="openPasswordDialog">
              <span class="material-symbols-outlined text-[18px]">key</span>
              <span class="hidden sm:inline">Password</span>
            </button>
            <button class="btn-secondary !px-3 !py-2" @click="signOut">
              <span class="material-symbols-outlined text-[18px]">logout</span>
              <span class="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <!-- Overview -->
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button
            v-for="t in tabs"
            :key="t.key"
            class="card flex items-center gap-3 p-4 text-left transition-colors"
            :class="tab === t.key ? '!border-primary' : 'hover:border-primary/40'"
            @click="tab = t.key"
          >
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <span class="material-symbols-outlined text-[22px]">{{ t.icon }}</span>
            </span>
            <span>
              <span class="block text-2xl font-semibold leading-none text-on-surface">{{ counts[t.key] ?? '–' }}</span>
              <span class="mt-1 block text-xs text-on-surface-variant">
                {{ t.label }}
                <span v-if="t.key === 'messages' && unread" class="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white dark:text-zinc-950">{{ unread }} new</span>
              </span>
            </span>
          </button>
        </div>

        <div class="mt-8">
          <AdminProjectsPanel v-if="tab === 'projects'" @changed="refreshCounts" />
          <AdminBlogPanel v-else-if="tab === 'blog'" @changed="refreshCounts" />
          <AdminMessagesPanel v-else-if="tab === 'messages'" @changed="refreshCounts" />
          <AdminChatLogsPanel v-else />
        </div>
      </main>

      <!-- Change password -->
      <AdminModal :open="passwordDialog" title="Change password" @close="passwordDialog = false">
        <form class="space-y-4" @submit.prevent="handleChangePassword">
          <p class="rounded-lg bg-surface px-4 py-3 text-sm text-on-surface-variant">
            For security, Supabase never stores your current password in a readable form, so it can't be shown.
            Set a new one here; it takes effect immediately.
          </p>

          <div v-for="field in passwordFields" :key="field.key">
            <label :for="`pw-${field.key}`" class="label">{{ field.label }}</label>
            <div class="relative">
              <input
                :id="`pw-${field.key}`"
                v-model="pw[field.key]"
                :type="pwVisible[field.key] ? 'text' : 'password'"
                required
                minlength="8"
                autocomplete="new-password"
                class="input !pr-11"
              />
              <button
                type="button"
                class="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface hover:text-on-surface"
                :aria-label="pwVisible[field.key] ? 'Hide password' : 'Show password'"
                :aria-pressed="pwVisible[field.key]"
                @click="pwVisible[field.key] = !pwVisible[field.key]"
              >
                <span class="material-symbols-outlined text-[20px]">{{ pwVisible[field.key] ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>
          <p class="text-xs text-on-surface-variant">At least 8 characters.</p>

          <p v-if="pwMessage" class="text-sm" :class="pwMessage.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
            {{ pwMessage.text }}
          </p>

          <div class="flex justify-end gap-2 border-t border-line pt-4">
            <button type="button" class="btn-secondary" @click="passwordDialog = false">Close</button>
            <button type="submit" class="btn-primary" :disabled="pwSaving">{{ pwSaving ? 'Saving…' : 'Update password' }}</button>
          </div>
        </form>
      </AdminModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useAdmin, type AdminTable } from '~/composables/useAdmin'

definePageMeta({ layout: false })
useHead({
  title: 'Admin · Nheb Panha',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const { isConfigured, session, isAdmin, ready, init, signIn, signOut, changePassword, count } = useAdmin()

type TabKey = 'projects' | 'blog' | 'messages' | 'chats'
const tabs: { key: TabKey; label: string; icon: string; table: AdminTable }[] = [
  { key: 'projects', label: 'Projects', icon: 'work', table: 'projects' },
  { key: 'blog', label: 'Blog posts', icon: 'article', table: 'blog_posts' },
  { key: 'messages', label: 'Messages', icon: 'mail', table: 'contact_submissions' },
  { key: 'chats', label: 'Chat logs', icon: 'forum', table: 'chat_logs' }
]
const tab = ref<TabKey>('projects')
const counts = reactive<Partial<Record<TabKey, number>>>({})
const unread = ref(0)

const refreshCounts = async () => {
  await Promise.all(tabs.map(async t => {
    try { counts[t.key] = await count(t.table) } catch { /* table may not exist yet */ }
  }))
  try { unread.value = await count('contact_submissions', { column: 'status', value: 'unread' }) } catch { /* ignore */ }
}

// Sign in
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const authError = ref('')
const signingIn = ref(false)

const handleSignIn = async () => {
  authError.value = ''
  signingIn.value = true
  try {
    await signIn(email.value, password.value)
    password.value = ''
    showPassword.value = false
  } catch (e: any) {
    authError.value = e.message === 'Invalid login credentials' ? 'Wrong email or password.' : e.message
  } finally {
    signingIn.value = false
  }
}

// Change password (Supabase Auth). The current password can't be read back, only replaced.
const passwordDialog = ref(false)
const passwordFields = [
  { key: 'next', label: 'New password' },
  { key: 'confirm', label: 'Confirm new password' }
] as const
const pw = reactive({ next: '', confirm: '' })
const pwVisible = reactive({ next: false, confirm: false })
const pwSaving = ref(false)
const pwMessage = ref<{ ok: boolean; text: string } | null>(null)

const openPasswordDialog = () => {
  pw.next = ''
  pw.confirm = ''
  pwVisible.next = false
  pwVisible.confirm = false
  pwMessage.value = null
  passwordDialog.value = true
}

const handleChangePassword = async () => {
  pwMessage.value = null
  if (pw.next !== pw.confirm) {
    pwMessage.value = { ok: false, text: "The two passwords don't match." }
    return
  }
  pwSaving.value = true
  try {
    await changePassword(pw.next)
    pw.next = ''
    pw.confirm = ''
    pwVisible.next = false
    pwVisible.confirm = false
    pwMessage.value = { ok: true, text: 'Password updated. Use it next time you sign in.' }
  } catch (e: any) {
    pwMessage.value = { ok: false, text: e.message }
  } finally {
    pwSaving.value = false
  }
}

// Theme toggle (same storage key as the public site)
const isDark = ref(false)
const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  try { localStorage.setItem('theme', isDark.value ? 'dark' : 'light') } catch { /* ignore */ }
}

watch(isAdmin, (ok) => { if (ok) refreshCounts() })

onMounted(async () => {
  isDark.value = document.documentElement.classList.contains('dark')
  await init()
  if (isAdmin.value) refreshCounts()
})
</script>
