<template>
  <div class="min-h-screen bg-surface text-on-surface">
    <!-- Loading -->
    <div v-if="!ready" class="flex min-h-screen items-center justify-center text-sm text-on-surface-variant">
      <Icon name="mdi:loading" class="mr-2 animate-spin text-lg" /> Loading…
    </div>

    <!-- Supabase not set up -->
    <div v-else-if="!isConfigured" class="flex min-h-screen items-center justify-center p-4">
      <div class="card max-w-md p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-amber-500">database_off</span>
        <h1 class="mt-3 text-lg font-semibold">Supabase isn't connected</h1>
        <p class="mt-2 text-sm text-on-surface-variant">
          Set <code class="font-mono">NUXT_PUBLIC_SUPABASE_URL</code> and <code class="font-mono">NUXT_PUBLIC_SUPABASE_ANON_KEY</code>, then reload.
        </p>
      </div>
    </div>

    <!-- ============================== SIGN IN ============================== -->
    <div v-else-if="!session" class="grid min-h-screen lg:grid-cols-2">
      <!-- Brand panel -->
      <aside class="brand-panel relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden="true" class="brand-grid pointer-events-none absolute inset-0"></div>
        <div aria-hidden="true" class="pointer-events-none absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl"></div>

        <div class="relative flex items-center gap-3">
          <img src="/logo_test.png" alt="" class="h-9 w-9 rounded-lg bg-zinc-900 object-contain p-1 ring-1 ring-white/15" />
          <span class="text-[15px] font-semibold text-white">Portfolio Admin</span>
        </div>

        <div class="relative max-w-md">
          <div class="mb-8 h-36 w-36"><ChatBotAvatar /></div>
          <h2 class="text-3xl font-semibold leading-tight tracking-tight text-white">Manage your whole portfolio from one place.</h2>
          <ul class="mt-8 space-y-4">
            <li v-for="f in features" :key="f.title" class="flex gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-indigo-200 ring-1 ring-white/10">
                <span class="material-symbols-outlined text-[20px]">{{ f.icon }}</span>
              </span>
              <span>
                <span class="block text-sm font-medium text-white">{{ f.title }}</span>
                <span class="block text-sm text-zinc-400">{{ f.body }}</span>
              </span>
            </li>
          </ul>
        </div>

        <p class="relative text-xs text-zinc-500">&copy; {{ year }} Nheb Panha · Secured by Supabase Auth</p>
      </aside>

      <!-- Form -->
      <main class="flex items-center justify-center bg-background px-6 py-12 sm:px-10">
        <form class="w-full max-w-sm" @submit.prevent="handleSignIn">
          <div class="flex items-center gap-4">
            <div class="relative shrink-0">
              <div class="h-14 w-14 overflow-hidden rounded-full ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                <img src="/image/panha_avatar.jpg" alt="Nheb Panha" width="56" height="56" class="h-full w-full object-cover" />
              </div>
              <span class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500" aria-hidden="true"></span>
            </div>
            <div>
              <h1 class="text-2xl font-semibold tracking-tight">Welcome back</h1>
              <p class="text-sm text-on-surface-variant">Sign in to your admin dashboard</p>
            </div>
          </div>

          <!-- Method switch -->
          <div class="mt-8 grid grid-cols-2 rounded-lg border border-line bg-surface p-1 text-sm" role="tablist" aria-label="Sign-in method">
            <button
              v-for="m in methods"
              :key="m.value"
              type="button"
              role="tab"
              :aria-selected="mode === m.value"
              class="flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors"
              :class="mode === m.value ? 'bg-background text-on-surface shadow-sm ring-1 ring-line' : 'text-on-surface-variant hover:text-on-surface'"
              @click="setMode(m.value)"
            >
              <span class="material-symbols-outlined text-[17px]">{{ m.icon }}</span>{{ m.label }}
            </button>
          </div>

          <!-- Email -->
          <div v-if="step === 'email' || mode === 'password'" class="mt-6">
            <label for="admin-email" class="label">Email address</label>
            <div class="relative">
              <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-variant">mail</span>
              <input id="admin-email" v-model.trim="email" type="email" required autocomplete="username" class="input !pl-10" placeholder="you@example.com" />
            </div>
          </div>

          <!-- Code -->
          <div v-if="mode === 'code' && step === 'code'" class="mt-6">
            <div class="flex items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm">
              <span class="material-symbols-outlined text-[20px] text-primary">mark_email_read</span>
              <p class="text-on-surface-variant">
                Email sent to <strong class="font-medium text-on-surface">{{ email }}</strong>.
                Enter the code from it below, <span class="text-on-surface">or just click the sign-in link</span> in the email.
                Check spam if you don't see it.
              </p>
            </div>
            <label for="admin-code" class="label mt-5">Verification code</label>
            <input
              id="admin-code"
              ref="codeInput"
              v-model="code"
              inputmode="numeric"
              autocomplete="one-time-code"
              pattern="[0-9]{6,10}"
              maxlength="10"
              required
              placeholder="000000"
              class="input text-center font-mono !text-2xl !tracking-[0.45em]"
              @input="code = code.replace(/\D/g, '')"
            />
            <div class="mt-3 flex items-center justify-between text-sm">
              <button type="button" class="inline-flex items-center gap-1 text-on-surface-variant hover:text-on-surface" @click="changeEmail">
                <span class="material-symbols-outlined text-[16px]">arrow_back</span>Change email
              </button>
              <button type="button" class="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-on-surface-variant disabled:no-underline" :disabled="resendIn > 0 || signingIn" @click="requestCode">
                {{ resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code' }}
              </button>
            </div>
          </div>

          <!-- Password -->
          <div v-if="mode === 'password'" class="mt-4">
            <label for="admin-password" class="label">Password</label>
            <div class="relative">
              <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-on-surface-variant">lock</span>
              <input
                id="admin-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                class="input !pl-10 !pr-11"
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

          <div v-if="authError" class="mt-4 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-300" role="alert">
            <span class="material-symbols-outlined text-[18px]">error</span>{{ authError }}
          </div>

          <button type="submit" class="btn-primary mt-6 h-11 w-full" :disabled="signingIn">
            <Icon v-if="signingIn" name="mdi:loading" class="animate-spin" />
            {{ submitLabel }}
          </button>

          <p class="mt-6 text-center text-xs text-on-surface-variant">
            {{ mode === 'code' ? "We'll email you a one-time code. No password needed." : 'Forgot it? Switch to Email code to sign in.' }}
          </p>

          <div class="mt-8 border-t border-line pt-6 text-center">
            <NuxtLink to="/" class="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary">
              <span class="material-symbols-outlined text-[16px]">arrow_back</span>Back to website
            </NuxtLink>
          </div>
        </form>
      </main>
    </div>

    <!-- Signed in but not an admin -->
    <div v-else-if="!isAdmin" class="flex min-h-screen items-center justify-center p-4">
      <div class="card max-w-md p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-rose-500">lock</span>
        <h1 class="mt-3 text-lg font-semibold">No admin access</h1>
        <p class="mt-2 text-sm text-on-surface-variant">
          <strong class="text-on-surface">{{ session.user.email }}</strong> isn't in the <code class="font-mono">admin_users</code> table.
          Add it in Supabase, then sign in again.
        </p>
        <button class="btn-secondary mt-6" @click="signOut">Sign out</button>
      </div>
    </div>

    <!-- ============================== DASHBOARD ============================== -->
    <div v-else class="min-h-screen">
      <!-- Mobile overlay -->
      <Transition name="fade">
        <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" @click="sidebarOpen = false"></div>
      </Transition>

      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-background transition-transform duration-300 lg:translate-x-0"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
        aria-label="Admin navigation"
      >
        <div class="flex h-16 shrink-0 items-center gap-3 border-b border-line px-5">
          <img src="/logo_test.png" alt="" class="h-8 w-8 rounded-lg bg-zinc-900 object-contain p-1 ring-1 ring-line" />
          <div class="leading-tight">
            <p class="text-sm font-semibold">Portfolio Admin</p>
            <p class="text-[11px] text-on-surface-variant">Content manager</p>
          </div>
        </div>

        <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          <div v-for="group in navGroups" :key="group.title">
            <p class="px-3 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/70">{{ group.title }}</p>
            <ul class="mt-2 space-y-0.5">
              <li v-for="item in group.items" :key="item.key">
                <button
                  class="nav-item"
                  :class="tab === item.key ? 'nav-item-active' : 'nav-item-idle'"
                  :aria-current="tab === item.key ? 'page' : undefined"
                  @click="go(item.key)"
                >
                  <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
                  <span class="flex-1 text-left">{{ item.label }}</span>
                  <span v-if="item.key === 'messages' && unread" class="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white dark:text-zinc-950">{{ unread }}</span>
                  <span v-else-if="typeof counts[item.key] === 'number'" class="text-xs tabular-nums text-on-surface-variant">{{ counts[item.key] }}</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Account -->
        <div class="shrink-0 border-t border-line p-3">
          <div class="flex items-center gap-3 rounded-lg px-2 py-2">
            <img src="/image/panha_avatar.jpg" alt="" class="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-line" />
            <div class="min-w-0 flex-1 leading-tight">
              <p class="truncate text-sm font-medium">Nheb Panha</p>
              <p class="truncate text-xs text-on-surface-variant">{{ session.user.email }}</p>
            </div>
          </div>
          <div class="mt-1 grid grid-cols-2 gap-1">
            <button class="nav-item nav-item-idle !justify-center !text-xs" @click="openPasswordDialog">
              <span class="material-symbols-outlined text-[18px]">key</span>Password
            </button>
            <button class="nav-item nav-item-idle !justify-center !text-xs hover:!text-rose-600" @click="signOut">
              <span class="material-symbols-outlined text-[18px]">logout</span>Sign out
            </button>
          </div>
        </div>
      </aside>

      <!-- Main column -->
      <div class="lg:pl-64">
        <header class="sticky top-0 z-30 border-b border-line bg-background/80 backdrop-blur-md">
          <div class="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-on-surface-variant hover:text-on-surface lg:hidden"
              aria-label="Open navigation"
              @click="sidebarOpen = true"
            >
              <span class="material-symbols-outlined text-[20px]">menu</span>
            </button>

            <nav aria-label="Breadcrumb" class="flex min-w-0 items-center gap-1.5 text-sm">
              <button class="text-on-surface-variant hover:text-on-surface" @click="go('dashboard')">Admin</button>
              <span class="material-symbols-outlined text-[16px] text-on-surface-variant/60">chevron_right</span>
              <span class="truncate font-medium">{{ currentItem.label }}</span>
            </nav>

            <div class="ml-auto flex items-center gap-2">
              <button
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-on-surface-variant hover:text-on-surface"
                :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
                @click="toggleDark"
              >
                <span class="material-symbols-outlined text-[20px]">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
              </button>
              <a href="/" target="_blank" rel="noopener" class="btn-secondary !px-3 !py-2">
                <span class="material-symbols-outlined text-[18px]">open_in_new</span>
                <span class="hidden sm:inline">View site</span>
              </a>
            </div>
          </div>
        </header>

        <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <!-- Dashboard home -->
          <section v-if="tab === 'dashboard'">
            <div class="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 class="text-2xl font-semibold tracking-tight">{{ greeting }}, Panha</h1>
                <p class="mt-1 text-sm text-on-surface-variant">{{ today }} · Here's what's happening with your portfolio.</p>
              </div>
              <button class="btn-secondary !py-2" :disabled="refreshing" @click="refreshCounts">
                <span class="material-symbols-outlined text-[18px]" :class="{ 'animate-spin': refreshing }">refresh</span>Refresh
              </button>
            </div>

            <!-- Stats -->
            <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <button v-for="s in stats" :key="s.key" class="card card-hover group p-5 text-left" @click="go(s.key)">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-on-surface-variant">{{ s.label }}</span>
                  <span class="flex h-9 w-9 items-center justify-center rounded-lg" :class="s.tone">
                    <span class="material-symbols-outlined text-[20px]">{{ s.icon }}</span>
                  </span>
                </div>
                <p class="mt-3 text-3xl font-semibold tabular-nums tracking-tight">{{ counts[s.key] ?? '–' }}</p>
                <p class="mt-1 flex items-center gap-1 text-xs text-on-surface-variant">
                  <template v-if="s.key === 'messages'">
                    <span v-if="unread" class="font-medium text-primary">{{ unread }} unread</span>
                    <span v-else>All caught up</span>
                  </template>
                  <template v-else>{{ s.hint }}</template>
                  <span class="material-symbols-outlined ml-auto text-[16px] opacity-0 transition-opacity group-hover:opacity-100">arrow_forward</span>
                </p>
              </button>
            </div>

            <div class="mt-6 grid gap-6 lg:grid-cols-3">
              <!-- Recent messages -->
              <div class="card lg:col-span-2">
                <div class="flex items-center justify-between border-b border-line px-5 py-4">
                  <h2 class="font-semibold">Recent messages</h2>
                  <button class="text-sm font-medium text-primary hover:underline" @click="go('messages')">View all</button>
                </div>
                <ul v-if="recentMessages.length" class="divide-y divide-line">
                  <li v-for="m in recentMessages" :key="m.id">
                    <button class="flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-surface" @click="go('messages')">
                      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">{{ m.name?.charAt(0) || '?' }}</span>
                      <span class="min-w-0 flex-1">
                        <span class="flex items-center gap-2">
                          <span class="truncate text-sm font-medium">{{ m.name }}</span>
                          <span v-if="m.status === 'unread'" class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread"></span>
                          <span class="ml-auto shrink-0 text-xs text-on-surface-variant">{{ timeAgo(m.created_at) }}</span>
                        </span>
                        <span class="block truncate text-xs text-on-surface-variant">{{ m.type }} · {{ m.message }}</span>
                      </span>
                    </button>
                  </li>
                </ul>
                <div v-else class="px-5 py-12 text-center text-sm text-on-surface-variant">
                  <span class="material-symbols-outlined text-3xl opacity-50">inbox</span>
                  <p class="mt-2">No messages yet.</p>
                </div>
              </div>

              <!-- Quick actions -->
              <div class="card">
                <div class="border-b border-line px-5 py-4">
                  <h2 class="font-semibold">Quick actions</h2>
                </div>
                <ul class="p-2">
                  <li v-for="a in quickActions" :key="a.label">
                    <component
                      :is="a.href ? 'a' : 'button'"
                      :href="a.href"
                      :target="a.href ? '_blank' : undefined"
                      class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface"
                      @click="a.to && go(a.to)"
                    >
                      <span class="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-on-surface-variant">
                        <span class="material-symbols-outlined text-[18px]">{{ a.icon }}</span>
                      </span>
                      <span class="flex-1">
                        <span class="block font-medium">{{ a.label }}</span>
                        <span class="block text-xs text-on-surface-variant">{{ a.hint }}</span>
                      </span>
                      <span class="material-symbols-outlined text-[18px] text-on-surface-variant">chevron_right</span>
                    </component>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <AdminContentPanel v-else-if="tab === 'website'" />
          <AdminExperiencePanel v-else-if="tab === 'experience'" @changed="refreshCounts" />
          <AdminProjectsPanel v-else-if="tab === 'projects'" @changed="refreshCounts" />
          <AdminBlogPanel v-else-if="tab === 'blog'" @changed="refreshCounts" />
          <AdminMessagesPanel v-else-if="tab === 'messages'" @changed="refreshCounts" />
          <AdminChatLogsPanel v-else-if="tab === 'chats'" />
        </main>
      </div>

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
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useAdmin, type AdminTable } from '~/composables/useAdmin'
import type { ContactSubmission } from '~/composables/useSupabase'

definePageMeta({ layout: false })
useHead({
  title: 'Admin · Nheb Panha',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const { isConfigured, session, isAdmin, ready, init, signIn, sendCode, verifyCode, signOut, changePassword, count, list } = useAdmin()

const year = new Date().getFullYear()

/* ------------------------------- Navigation ------------------------------- */
type TabKey = 'dashboard' | 'website' | 'experience' | 'projects' | 'blog' | 'messages' | 'chats'
interface NavItem { key: TabKey; label: string; icon: string; table?: AdminTable }

const navGroups: { title: string; items: NavItem[] }[] = [
  { title: 'Overview', items: [{ key: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' }] },
  {
    title: 'Content',
    items: [
      { key: 'website', label: 'Website', icon: 'web' },
      { key: 'experience', label: 'Experience', icon: 'timeline', table: 'experiences' },
      { key: 'projects', label: 'Projects', icon: 'work', table: 'projects' },
      { key: 'blog', label: 'Blog posts', icon: 'article', table: 'blog_posts' }
    ]
  },
  {
    title: 'Inbox',
    items: [
      { key: 'messages', label: 'Messages', icon: 'mail', table: 'contact_submissions' },
      { key: 'chats', label: 'Chat logs', icon: 'forum', table: 'chat_logs' }
    ]
  }
]
const allItems = navGroups.flatMap(g => g.items)
const validTabs = allItems.map(i => i.key)

const tab = ref<TabKey>('dashboard')
const sidebarOpen = ref(false)
const currentItem = computed(() => allItems.find(i => i.key === tab.value)!)

// Keep the current section in the URL (#projects) so refresh/back works.
const go = (key: TabKey) => {
  tab.value = key
  sidebarOpen.value = false
  if (location.hash !== `#${key}`) history.replaceState(null, '', key === 'dashboard' ? location.pathname : `#${key}`)
  window.scrollTo({ top: 0 })
}
const readHash = () => {
  const h = location.hash.slice(1) as TabKey
  tab.value = validTabs.includes(h) ? h : 'dashboard'
}

/* -------------------------------- Dashboard ------------------------------- */
const counts = reactive<Partial<Record<TabKey, number>>>({})
const unread = ref(0)
const recentMessages = ref<ContactSubmission[]>([])
const refreshing = ref(false)

const stats: { key: TabKey; label: string; icon: string; tone: string; hint: string }[] = [
  { key: 'projects', label: 'Projects', icon: 'work', tone: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', hint: 'In "Selected work"' },
  { key: 'blog', label: 'Blog posts', icon: 'article', tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', hint: 'Published articles' },
  { key: 'messages', label: 'Messages', icon: 'mail', tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', hint: '' },
  { key: 'chats', label: 'AI chats', icon: 'forum', tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', hint: 'Visitor conversations' }
]

const quickActions: { label: string; hint: string; icon: string; to?: TabKey; href?: string }[] = [
  { label: 'Edit profile & hero', hint: 'Name, intro, contact links', icon: 'person', to: 'website' },
  { label: 'Add a project', hint: 'Show new work', icon: 'add_box', to: 'projects' },
  { label: 'Write a blog post', hint: 'Share an article', icon: 'edit_note', to: 'blog' },
  { label: 'Update experience', hint: 'Work history timeline', icon: 'timeline', to: 'experience' },
  { label: 'Open live website', hint: 'See your changes', icon: 'open_in_new', href: '/' }
]

const refreshCounts = async () => {
  refreshing.value = true
  await Promise.all(allItems.map(async t => {
    if (!t.table) return
    try { counts[t.key] = await count(t.table) } catch { /* table may not exist yet */ }
  }))
  try { unread.value = await count('contact_submissions', { column: 'status', value: 'unread' }) } catch { /* ignore */ }
  try { recentMessages.value = (await list<ContactSubmission>('contact_submissions')).slice(0, 5) } catch { /* ignore */ }
  refreshing.value = false
}

const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
})
const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

const timeAgo = (iso?: string) => {
  if (!iso) return ''
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return d < 7 ? `${d}d ago` : new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/* --------------------------------- Sign in -------------------------------- */
const features = [
  { icon: 'web', title: 'Website content', body: 'Edit your profile, hero, about, skills and footer.' },
  { icon: 'work', title: 'Projects, blog & experience', body: 'Create, update and reorder everything you show.' },
  { icon: 'mail', title: 'Inbox', body: 'Read and reply to messages and AI chat logs.' }
]
const methods = [
  { value: 'code', label: 'Email code', icon: 'pin' },
  { value: 'password', label: 'Password', icon: 'password' }
] as const

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const authError = ref('')
const signingIn = ref(false)

// Sign-in method: an emailed one-time code (default) or email + password.
const mode = ref<'code' | 'password'>('code')
const step = ref<'email' | 'code'>('email')
const code = ref('')
const codeInput = ref<HTMLInputElement | null>(null)
const resendIn = ref(0)
let resendTimer: ReturnType<typeof setInterval> | undefined

const submitLabel = computed(() => {
  if (signingIn.value) return mode.value === 'code' && step.value === 'email' ? 'Sending code…' : 'Signing in…'
  if (mode.value === 'password') return 'Sign in'
  return step.value === 'email' ? 'Send sign-in code' : 'Verify & sign in'
})

const friendlyAuthError = (e: any): string => {
  const msg: string = e?.message || 'Something went wrong. Please try again.'
  if (msg === 'Invalid login credentials') return 'Wrong email or password.'
  if (/signups not allowed|user not found/i.test(msg)) return "There's no admin account for this email."
  if (/expired|invalid/i.test(msg) && mode.value === 'code') return 'That code is wrong or has expired. Request a new one.'
  if (/rate limit|security purposes|seconds/i.test(msg)) return 'Too many requests. Please wait a minute and try again.'
  if (/failed to fetch/i.test(msg)) return "Can't reach Supabase. Check the URL and key in .env, then restart the dev server."
  return msg
}

const startResendTimer = () => {
  resendIn.value = 60
  clearInterval(resendTimer)
  resendTimer = setInterval(() => {
    resendIn.value -= 1
    if (resendIn.value <= 0) clearInterval(resendTimer)
  }, 1000)
}

const requestCode = async () => {
  authError.value = ''
  signingIn.value = true
  try {
    await sendCode(email.value)
    step.value = 'code'
    code.value = ''
    startResendTimer()
    await nextTick()
    codeInput.value?.focus()
  } catch (e: any) {
    authError.value = friendlyAuthError(e)
  } finally {
    signingIn.value = false
  }
}

const handleSignIn = async () => {
  if (mode.value === 'code' && step.value === 'email') return requestCode()

  authError.value = ''
  signingIn.value = true
  try {
    if (mode.value === 'code') {
      await verifyCode(email.value, code.value)
      code.value = ''
      step.value = 'email'
    } else {
      await signIn(email.value, password.value)
      password.value = ''
      showPassword.value = false
    }
  } catch (e: any) {
    authError.value = friendlyAuthError(e)
  } finally {
    signingIn.value = false
  }
}

const changeEmail = () => {
  step.value = 'email'
  code.value = ''
  authError.value = ''
}

const setMode = (m: 'code' | 'password') => {
  mode.value = m
  step.value = 'email'
  authError.value = ''
}

/* ----------------------------- Change password ---------------------------- */
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
  sidebarOpen.value = false
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

/* ---------------------------------- Theme --------------------------------- */
const isDark = ref(false)
const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  try { localStorage.setItem('theme', isDark.value ? 'dark' : 'light') } catch { /* ignore */ }
}

/* -------------------------------- Lifecycle ------------------------------- */
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') sidebarOpen.value = false }

watch(isAdmin, (ok) => { if (ok) refreshCounts() })

onMounted(async () => {
  isDark.value = document.documentElement.classList.contains('dark')
  readHash()
  window.addEventListener('hashchange', readHash)
  window.addEventListener('keydown', onKey)
  await init()
  if (isAdmin.value) refreshCounts()
})

onBeforeUnmount(() => {
  clearInterval(resendTimer)
  window.removeEventListener('hashchange', readHash)
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.brand-panel {
  background:
    radial-gradient(120% 80% at 0% 0%, rgb(79 70 229 / 0.35), transparent 55%),
    linear-gradient(160deg, #09090b 0%, #111127 60%, #0b0b1a 100%);
}
.brand-grid {
  background-image:
    linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 30% 40%, #000 30%, transparent 80%);
  mask-image: radial-gradient(ellipse 80% 70% at 30% 40%, #000 30%, transparent 80%);
}

.nav-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.15s, color 0.15s;
}
.nav-item-idle {
  color: rgb(var(--muted-rgb));
}
.nav-item-idle:hover {
  background: rgb(var(--surface-rgb));
  color: rgb(var(--text-rgb));
}
.nav-item-active {
  background: rgb(var(--accent-rgb) / 0.1);
  color: rgb(var(--accent-rgb));
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
