<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-on-surface">Messages</h2>
        <p class="text-sm text-on-surface-variant">From the contact form (newest first).</p>
      </div>
      <div class="flex gap-1.5" role="group" aria-label="Filter messages">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-btn"
          :class="filter === f.value ? 'filter-btn-active' : 'filter-btn-idle'"
          @click="filter = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <p v-if="error" class="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-700 dark:text-rose-300">{{ error }}</p>

    <div v-if="loading" class="mt-6 text-sm text-on-surface-variant">Loading…</div>
    <div v-else-if="!visible.length" class="card mt-6 px-6 py-12 text-center text-sm text-on-surface-variant">
      No {{ filter === 'all' ? '' : filter }} messages.
    </div>

    <ul v-else class="mt-6 grid gap-3">
      <li v-for="m in visible" :key="m.id" class="card p-5" :class="{ '!border-primary/40': m.status === 'unread' }">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span v-if="m.status === 'unread'" class="h-2 w-2 rounded-full bg-primary" aria-label="Unread"></span>
              <h3 class="font-semibold text-on-surface">{{ m.name }}</h3>
              <span class="chip">{{ m.type }}</span>
            </div>
            <a :href="`mailto:${m.email}`" class="text-sm text-primary hover:underline">{{ m.email }}</a>
          </div>
          <time class="text-xs text-on-surface-variant" :datetime="m.created_at">{{ formatDate(m.created_at) }}</time>
        </div>

        <p class="mt-3 whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">{{ m.message }}</p>

        <div class="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
          <a :href="replyLink(m)" class="btn-primary !px-3 !py-2" @click="setStatus(m, 'read')">
            <span class="material-symbols-outlined text-[18px]">reply</span>Reply
          </a>
          <button class="btn-secondary !px-3 !py-2" @click="setStatus(m, m.status === 'unread' ? 'read' : 'unread')">
            <span class="material-symbols-outlined text-[18px]">{{ m.status === 'unread' ? 'mark_email_read' : 'mark_email_unread' }}</span>
            {{ m.status === 'unread' ? 'Mark read' : 'Mark unread' }}
          </button>
          <button class="btn-secondary !px-3 !py-2 hover:!border-rose-400 hover:!text-rose-600" @click="removeRow(m)">
            <span class="material-symbols-outlined text-[18px]">delete</span>Delete
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdmin } from '~/composables/useAdmin'
import type { ContactSubmission } from '~/composables/useSupabase'

const emit = defineEmits<{ changed: [] }>()
const { list, update, remove } = useAdmin()

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Read', value: 'read' }
] as const

const rows = ref<ContactSubmission[]>([])
const filter = ref<'all' | 'unread' | 'read'>('all')
const loading = ref(true)
const error = ref('')

const visible = computed(() => filter.value === 'all' ? rows.value : rows.value.filter(m => m.status === filter.value))

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

const replyLink = (m: ContactSubmission) =>
  `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.type || 'Your message'}`)}&body=${encodeURIComponent(`Hi ${m.name},\n\n\n\n---\n${m.message}`)}`

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    rows.value = await list<ContactSubmission>('contact_submissions')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const setStatus = async (m: ContactSubmission, status: string) => {
  if (!m.id || m.status === status) return
  try {
    await update('contact_submissions', m.id, { status })
    m.status = status
    emit('changed')
  } catch (e: any) {
    error.value = e.message
  }
}

const removeRow = async (m: ContactSubmission) => {
  if (!m.id || !confirm(`Delete the message from ${m.name}?`)) return
  try {
    await remove('contact_submissions', m.id)
    rows.value = rows.value.filter(r => r.id !== m.id)
    emit('changed')
  } catch (e: any) {
    error.value = e.message
  }
}

onMounted(load)
</script>
