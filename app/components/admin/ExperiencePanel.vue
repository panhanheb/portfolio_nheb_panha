<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-on-surface">Experience</h2>
        <p class="text-sm text-on-surface-variant">The "Where I've worked" timeline. Top of the list shows first.</p>
      </div>
      <button class="btn-primary" @click="openEditor()">
        <span class="material-symbols-outlined text-[18px]">add</span>
        New role
      </button>
    </div>

    <p v-if="notice" class="mt-4 rounded-lg border px-4 py-2.5 text-sm" :class="noticeClass">{{ notice.text }}</p>

    <div v-if="loading" class="mt-6 text-sm text-on-surface-variant">Loading…</div>
    <div v-else-if="!rows.length" class="card mt-6 px-6 py-12 text-center text-sm text-on-surface-variant">
      No roles yet. Click "New role" to add your first one.
    </div>

    <ol v-else class="mt-6 grid gap-3">
      <li v-for="(r, i) in rows" :key="r.id" class="card flex flex-wrap items-center gap-4 p-4">
        <div class="flex flex-col">
          <button class="order-btn" :disabled="i === 0 || reordering" aria-label="Move up" @click="move(i, -1)">
            <span class="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
          </button>
          <button class="order-btn" :disabled="i === rows.length - 1 || reordering" aria-label="Move down" @click="move(i, 1)">
            <span class="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
          </button>
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-mono text-xs text-on-surface-variant">{{ r.period }}</p>
          <div class="mt-0.5 flex flex-wrap items-center gap-2">
            <h3 class="font-semibold text-on-surface">{{ r.role }}</h3>
            <span class="chip">{{ r.type }}</span>
          </div>
          <p class="text-sm text-on-surface-variant">{{ r.company }}<span v-if="r.location"> · {{ r.location }}</span></p>
        </div>
        <div class="flex gap-2">
          <button class="btn-secondary !px-3 !py-2" @click="openEditor(r)">
            <span class="material-symbols-outlined text-[18px]">edit</span>Edit
          </button>
          <button class="btn-secondary !px-3 !py-2 hover:!border-rose-400 hover:!text-rose-600" aria-label="Delete" @click="removeRow(r)">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </li>
    </ol>

    <!-- Editor -->
    <AdminModal :open="!!form" :title="form?.id ? 'Edit role' : 'New role'" @close="form = null">
      <form v-if="form" class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
        <label class="sm:col-span-2"><span class="label">Role / job title *</span><input v-model.trim="form.role" required class="input" /></label>
        <label><span class="label">Company *</span><input v-model.trim="form.company" required class="input" /></label>
        <label><span class="label">Period *</span><input v-model.trim="form.period" required class="input" placeholder="2024 — Present" /></label>
        <label><span class="label">Location</span><input v-model.trim="form.location" class="input" placeholder="Phnom Penh / Remote" /></label>
        <label>
          <span class="label">Type</span>
          <input v-model.trim="form.type" class="input" list="exp-types" />
          <datalist id="exp-types">
            <option v-for="t in types" :key="t" :value="t" />
          </datalist>
        </label>
        <label class="sm:col-span-2"><span class="label">Summary</span><textarea v-model.trim="form.summary" rows="3" class="input"></textarea></label>
        <div class="sm:col-span-2">
          <span class="label">Highlights</span>
          <AdminListEditor v-model="form.highlights" multiline add-label="Add highlight" />
        </div>
        <label class="sm:col-span-2">
          <span class="label">Technologies <span class="font-normal text-on-surface-variant">(comma separated)</span></span>
          <input v-model="techText" class="input" placeholder="Flutter, Dart, Supabase" />
        </label>

        <p v-if="formError" class="text-sm text-rose-600 dark:text-rose-400 sm:col-span-2">{{ formError }}</p>

        <div class="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2">
          <button type="button" class="btn-secondary" @click="form = null">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save role' }}</button>
        </div>
      </form>
    </AdminModal>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdmin } from '~/composables/useAdmin'
import { useSiteContent, type Experience } from '~/composables/useSiteContent'

const emit = defineEmits<{ changed: [] }>()
const { save, update, remove, list } = useAdmin()
const { load: reloadSite } = useSiteContent()

const types = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
const rows = ref<Experience[]>([])
const loading = ref(true)
const reordering = ref(false)
const form = ref<Experience | null>(null)
const techText = ref('')
const saving = ref(false)
const formError = ref('')
const notice = ref<{ ok: boolean; text: string } | null>(null)

const noticeClass = computed(() => notice.value?.ok
  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
  : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300')

const flash = (ok: boolean, text: string) => {
  notice.value = { ok, text }
  setTimeout(() => { if (notice.value?.text === text) notice.value = null }, 4000)
}

const load = async () => {
  loading.value = true
  try {
    const data = await list<any>('experiences', 'sort_order')
    rows.value = data
      .map(r => ({ ...r, highlights: Array.isArray(r.highlights) ? r.highlights : [], tech_stack: Array.isArray(r.tech_stack) ? r.tech_stack : [] }))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  } catch (e: any) {
    flash(false, e.message)
  } finally {
    loading.value = false
  }
}

const afterChange = async () => {
  await load()
  reloadSite(true) // refresh the public site's copy
  emit('changed')
}

const openEditor = (row?: Experience) => {
  formError.value = ''
  form.value = row
    ? JSON.parse(JSON.stringify(row))
    : { period: '', role: '', company: '', location: '', type: 'Full-time', summary: '', highlights: [], tech_stack: [], sort_order: 0 }
  techText.value = form.value!.tech_stack.join(', ')
}

const submit = async () => {
  if (!form.value) return
  saving.value = true
  formError.value = ''
  const f = form.value
  try {
    await save('experiences', {
      id: f.id,
      period: f.period,
      role: f.role,
      company: f.company,
      location: f.location,
      type: f.type || 'Full-time',
      summary: f.summary,
      highlights: f.highlights.map(h => h.trim()).filter(Boolean),
      tech_stack: techText.value.split(',').map(t => t.trim()).filter(Boolean),
      // New roles go to the top of the timeline.
      sort_order: f.id ? f.sort_order : Math.min(0, ...rows.value.map(r => r.sort_order ?? 0)) - 1
    })
    form.value = null
    flash(true, `Saved "${f.role}".`)
    await afterChange()
  } catch (e: any) {
    formError.value = e.message
  } finally {
    saving.value = false
  }
}

const move = async (i: number, dir: -1 | 1) => {
  const j = i + dir
  if (j < 0 || j >= rows.value.length) return
  const next = [...rows.value]
  const [item] = next.splice(i, 1)
  next.splice(j, 0, item!)
  rows.value = next
  reordering.value = true
  try {
    // Renumber 1..n so the order is stable.
    await Promise.all(next.map((r, idx) => (r.sort_order !== idx + 1 && r.id ? update('experiences', r.id, { sort_order: idx + 1 }) : null)))
    next.forEach((r, idx) => { r.sort_order = idx + 1 })
    reloadSite(true)
  } catch (e: any) {
    flash(false, e.message)
    await load()
  } finally {
    reordering.value = false
  }
}

const removeRow = async (r: Experience) => {
  if (!r.id || !confirm(`Delete "${r.role}" at ${r.company}?`)) return
  try {
    await remove('experiences', r.id)
    flash(true, `Deleted "${r.role}".`)
    await afterChange()
  } catch (e: any) {
    flash(false, e.message)
  }
}

onMounted(load)
</script>

<style scoped>
.order-btn {
  display: flex;
  height: 1.6rem;
  width: 1.6rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  color: rgb(var(--muted-rgb));
}
.order-btn:hover:not(:disabled) {
  background: rgb(var(--border-rgb) / 0.6);
  color: rgb(var(--text-rgb));
}
.order-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
