<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-on-surface">Chat conversations</h2>
        <p class="text-sm text-on-surface-variant">See what visitors ask the AI assistant and reply to them personally.</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="hidden items-center gap-1.5 text-xs text-on-surface-variant sm:inline-flex">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>Auto-refreshing
        </span>
        <button class="btn-secondary !px-3 !py-2" :disabled="loading" aria-label="Refresh" @click="load(true)">
          <span class="material-symbols-outlined text-[18px]" :class="{ 'animate-spin': loading }">refresh</span>
        </button>
      </div>
    </div>

    <p v-if="error" class="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-700 dark:text-rose-300">{{ error }}</p>

    <div v-if="firstLoad" class="mt-6 text-sm text-on-surface-variant">Loading…</div>
    <div v-else-if="!conversations.length" class="card mt-6 px-6 py-14 text-center text-sm text-on-surface-variant">
      <span class="material-symbols-outlined text-4xl opacity-50">forum</span>
      <p class="mt-2">No conversations yet. When visitors use the chatbot, they'll show up here.</p>
    </div>

    <div v-else class="card mt-6 grid overflow-hidden lg:h-[38rem] lg:grid-cols-[20rem_1fr]">
      <!-- Conversation list -->
      <aside class="flex min-h-0 flex-col border-line lg:border-r" :class="{ 'hidden lg:flex': selected }">
        <div class="border-b border-line p-3">
          <label class="relative block">
            <span class="sr-only">Search conversations</span>
            <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
            <input v-model="query" type="search" placeholder="Search messages" class="input !py-2 !pl-10" />
          </label>
        </div>
        <ul class="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
          <li v-for="c in filtered" :key="c.key">
            <button
              class="flex w-full gap-3 px-4 py-3 text-left transition-colors"
              :class="selectedKey === c.key ? 'bg-primary/10' : 'hover:bg-surface'"
              @click="select(c.key)"
            >
              <span class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-on-surface-variant ring-1 ring-line">
                <span class="material-symbols-outlined text-[20px]">person</span>
                <span v-if="c.needsReply" class="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" aria-label="Awaiting reply"></span>
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-2">
                  <span class="truncate text-sm font-medium text-on-surface">Visitor {{ c.label }}</span>
                  <span class="ml-auto shrink-0 text-[11px] text-on-surface-variant">{{ timeAgo(c.lastAt) }}</span>
                </span>
                <span class="mt-0.5 block truncate text-xs text-on-surface-variant">{{ c.preview }}</span>
                <span class="mt-1 flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                  <span>{{ c.questionCount }} question{{ c.questionCount === 1 ? '' : 's' }}</span>
                  <span v-if="c.replyCount" class="rounded-full bg-emerald-500/15 px-1.5 font-medium text-emerald-700 dark:text-emerald-400">Replied</span>
                  <span v-if="!c.sessionId" class="rounded-full bg-surface px-1.5 ring-1 ring-line">Older chat</span>
                </span>
              </span>
            </button>
          </li>
          <li v-if="!filtered.length" class="px-4 py-8 text-center text-sm text-on-surface-variant">No matches.</li>
        </ul>
      </aside>

      <!-- Thread -->
      <div class="flex min-h-[28rem] min-w-0 flex-col" :class="{ 'hidden lg:flex': !selected }">
        <template v-if="selected">
          <header class="flex items-center gap-3 border-b border-line px-4 py-3">
            <button class="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface lg:hidden" aria-label="Back to conversations" @click="selectedKey = ''">
              <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-on-surface">Visitor {{ selected.label }}</p>
              <p class="text-xs text-on-surface-variant">Started {{ formatDate(selected.firstAt) }} · {{ selected.questionCount }} question{{ selected.questionCount === 1 ? '' : 's' }}</p>
            </div>
            <button class="btn-secondary !px-2.5 !py-1.5 hover:!border-rose-400 hover:!text-rose-600" aria-label="Delete conversation" @click="removeConversation(selected)">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </header>

          <div ref="threadEl" class="min-h-0 flex-1 space-y-3 overflow-y-auto bg-surface/50 px-4 py-5">
            <div v-for="item in selected.items" :key="item.id" class="flex flex-col" :class="item.from === 'visitor' ? 'items-start' : 'items-end'">
              <span class="mb-1 px-1 text-[11px] font-medium text-on-surface-variant">
                {{ item.from === 'visitor' ? 'Visitor' : item.from === 'bot' ? 'AI assistant' : 'You' }} · {{ formatTime(item.at) }}
              </span>
              <div
                class="max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                :class="{
                  'rounded-tl-md border border-line bg-background text-on-surface': item.from === 'visitor',
                  'rounded-tr-md bg-zinc-200/70 text-on-surface dark:bg-zinc-800': item.from === 'bot',
                  'rounded-tr-md bg-emerald-600 text-white': item.from === 'admin'
                }"
              >{{ item.text }}</div>
            </div>
          </div>

          <!-- Composer -->
          <form v-if="selected.sessionId" class="border-t border-line p-3" @submit.prevent="sendReply">
            <div class="flex items-end gap-2">
              <textarea
                v-model="reply"
                rows="2"
                maxlength="2000"
                placeholder="Write a reply… (Enter to send, Shift+Enter for a new line)"
                class="input min-h-[2.75rem] resize-none"
                @keydown.enter.exact.prevent="sendReply"
              ></textarea>
              <button type="submit" class="btn-primary h-11 shrink-0" :disabled="!reply.trim() || sending">
                <Icon v-if="sending" name="mdi:loading" class="animate-spin" />
                <span v-else class="material-symbols-outlined text-[18px]">send</span>
                <span class="hidden sm:inline">Reply</span>
              </button>
            </div>
            <p class="mt-1.5 text-[11px] text-on-surface-variant">
              The visitor sees your reply in their chat window (within a few seconds if it's open) as long as they use the same browser.
            </p>
          </form>
          <p v-else class="border-t border-line px-4 py-3 text-xs text-on-surface-variant">
            This conversation happened before live replies were added, so the visitor can't receive a reply.
          </p>
        </template>

        <div v-else class="flex flex-1 flex-col items-center justify-center p-8 text-center text-sm text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl opacity-50">chat</span>
          <p class="mt-2">Select a conversation to read it and reply.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useAdmin } from '~/composables/useAdmin'

interface ChatLog { id: string; user_prompt: string; bot_response: string; created_at: string; session_id: string | null }
interface ChatReply { id: string; session_id: string; message: string; created_at: string }
interface ThreadItem { id: string; from: 'visitor' | 'bot' | 'admin'; text: string; at: string }
interface Conversation {
  key: string
  sessionId: string | null
  label: string
  items: ThreadItem[]
  firstAt: string
  lastAt: string
  preview: string
  questionCount: number
  replyCount: number
  needsReply: boolean
}

const { list, save, remove, removeWhere } = useAdmin()

const logs = ref<ChatLog[]>([])
const replies = ref<ChatReply[]>([])
const loading = ref(false)
const firstLoad = ref(true)
const error = ref('')
const query = ref('')
const selectedKey = ref('')
const reply = ref('')
const sending = ref(false)
const threadEl = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setInterval> | undefined

/** Group logs + replies into conversations (one per visitor session). */
const conversations = computed<Conversation[]>(() => {
  const map = new Map<string, Conversation>()
  const get = (key: string, sessionId: string | null) => {
    let c = map.get(key)
    if (!c) {
      c = { key, sessionId, label: (sessionId || key).replace(/^log-/, '').slice(0, 6).toUpperCase(), items: [], firstAt: '', lastAt: '', preview: '', questionCount: 0, replyCount: 0, needsReply: false }
      map.set(key, c)
    }
    return c
  }

  for (const l of logs.value) {
    const c = get(l.session_id || `log-${l.id}`, l.session_id)
    c.items.push({ id: `${l.id}-q`, from: 'visitor', text: l.user_prompt, at: l.created_at })
    c.items.push({ id: `${l.id}-a`, from: 'bot', text: l.bot_response, at: l.created_at })
    c.questionCount++
  }
  for (const r of replies.value) {
    const c = get(r.session_id, r.session_id)
    c.items.push({ id: r.id, from: 'admin', text: r.message, at: r.created_at })
    c.replyCount++
  }

  for (const c of map.values()) {
    // Keep visitor question before the bot's answer when they share a timestamp.
    const order = { visitor: 0, bot: 1, admin: 2 }
    c.items.sort((a, b) => a.at.localeCompare(b.at) || order[a.from] - order[b.from])
    c.firstAt = c.items[0]?.at ?? ''
    c.lastAt = c.items[c.items.length - 1]?.at ?? ''
    const lastVisitor = [...c.items].reverse().find(i => i.from === 'visitor')
    const lastAdmin = [...c.items].reverse().find(i => i.from === 'admin')
    c.preview = lastVisitor?.text ?? c.items[c.items.length - 1]?.text ?? ''
    c.needsReply = !!c.sessionId && !!lastVisitor && (!lastAdmin || lastAdmin.at < lastVisitor.at)
  }
  return [...map.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt))
})

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return conversations.value
  return conversations.value.filter(c => c.items.some(i => i.text.toLowerCase().includes(q)))
})

const selected = computed(() => conversations.value.find(c => c.key === selectedKey.value) || null)

const scrollThread = async () => {
  await nextTick()
  if (threadEl.value) threadEl.value.scrollTop = threadEl.value.scrollHeight
}

const select = (key: string) => {
  selectedKey.value = key
  reply.value = ''
  scrollThread()
}

const load = async (manual = false) => {
  if (loading.value) return
  loading.value = true
  if (manual) error.value = ''
  try {
    const before = selected.value?.items.length ?? 0
    const [l, r] = await Promise.all([
      list<ChatLog>('chat_logs'),
      list<ChatReply>('chat_replies').catch(() => [] as ChatReply[]) // table may not exist yet
    ])
    logs.value = l
    replies.value = r
    if ((selected.value?.items.length ?? 0) !== before) scrollThread()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
    firstLoad.value = false
  }
}

const sendReply = async () => {
  const c = selected.value
  const text = reply.value.trim()
  if (!c?.sessionId || !text || sending.value) return
  sending.value = true
  error.value = ''
  try {
    await save('chat_replies', { session_id: c.sessionId, message: text })
    reply.value = ''
    await load()
    scrollThread()
  } catch (e: any) {
    error.value = /chat_replies/.test(e.message)
      ? 'Replies need the chat_replies table. Run the latest supabase_schema.sql in Supabase.'
      : e.message
  } finally {
    sending.value = false
  }
}

const removeConversation = async (c: Conversation) => {
  if (!confirm('Delete this whole conversation, including your replies?')) return
  try {
    if (c.sessionId) {
      await removeWhere('chat_logs', 'session_id', c.sessionId)
      await removeWhere('chat_replies', 'session_id', c.sessionId).catch(() => {})
    } else {
      await remove('chat_logs', c.key.replace(/^log-/, ''))
    }
    selectedKey.value = ''
    await load()
  } catch (e: any) {
    error.value = e.message
  }
}

const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const timeAgo = (iso: string) => {
  if (!iso) return ''
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.round(h / 24)
  return d < 7 ? `${d}d` : new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

onMounted(() => {
  load()
  timer = setInterval(() => { if (document.visibilityState === 'visible') load() }, 10000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>
