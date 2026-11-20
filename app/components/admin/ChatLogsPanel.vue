<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-on-surface">Chat logs</h2>
        <p class="text-sm text-on-surface-variant">What visitors asked the AI assistant, and its answers.</p>
      </div>
      <label class="relative block w-full sm:w-64">
        <span class="sr-only">Search chat logs</span>
        <span class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
        <input v-model="query" type="search" placeholder="Search questions or answers" class="input !pl-10" />
      </label>
    </div>

    <p v-if="error" class="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-700 dark:text-rose-300">{{ error }}</p>

    <div v-if="loading" class="mt-6 text-sm text-on-surface-variant">Loading…</div>
    <div v-else-if="!visible.length" class="card mt-6 px-6 py-12 text-center text-sm text-on-surface-variant">
      {{ query ? 'No conversations match your search.' : 'No conversations yet.' }}
    </div>

    <ul v-else class="mt-6 grid gap-3">
      <li v-for="log in visible" :key="log.id" class="card p-5">
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm font-medium text-on-surface">
            <span class="material-symbols-outlined mr-1 align-[-4px] text-[18px] text-primary">person</span>{{ log.user_prompt }}
          </p>
          <div class="flex shrink-0 items-center gap-2">
            <time class="text-xs text-on-surface-variant" :datetime="log.created_at">{{ formatDate(log.created_at) }}</time>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface hover:text-rose-600"
              aria-label="Delete conversation"
              @click="removeRow(log)"
            >
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
        <p class="mt-3 whitespace-pre-line rounded-lg bg-surface px-4 py-3 text-sm leading-relaxed text-on-surface-variant">{{ log.bot_response }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdmin } from '~/composables/useAdmin'

interface ChatLog { id: string; user_prompt: string; bot_response: string; created_at: string }

const { list, remove } = useAdmin()

const rows = ref<ChatLog[]>([])
const query = ref('')
const loading = ref(true)
const error = ref('')

const visible = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return rows.value
  return rows.value.filter(l => l.user_prompt.toLowerCase().includes(q) || l.bot_response.toLowerCase().includes(q))
})

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

const load = async () => {
  loading.value = true
  try {
    rows.value = await list<ChatLog>('chat_logs')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const removeRow = async (log: ChatLog) => {
  if (!confirm('Delete this conversation?')) return
  try {
    await remove('chat_logs', log.id)
    rows.value = rows.value.filter(r => r.id !== log.id)
  } catch (e: any) {
    error.value = e.message
  }
}

onMounted(load)
</script>
