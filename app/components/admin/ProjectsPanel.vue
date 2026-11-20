<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-on-surface">Projects</h2>
        <p class="text-sm text-on-surface-variant">Shown in the "Selected work" section of your site.</p>
      </div>
      <button class="btn-primary" @click="openEditor()">
        <span class="material-symbols-outlined text-[18px]">add</span>
        New project
      </button>
    </div>

    <p v-if="notice" class="mt-4 rounded-lg border px-4 py-2.5 text-sm" :class="noticeClass">{{ notice.text }}</p>

    <div v-if="loading" class="mt-6 text-sm text-on-surface-variant">Loading…</div>
    <div v-else-if="!rows.length" class="card mt-6 px-6 py-12 text-center text-sm text-on-surface-variant">
      No projects yet. Click "New project" to add one.
    </div>

    <ul v-else class="mt-6 grid gap-3">
      <li v-for="p in rows" :key="p.id" class="card flex flex-wrap items-center gap-4 p-4">
        <div class="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-line bg-zinc-950">
          <img v-if="p.logo" :src="p.logo" alt="" class="h-full w-full object-cover" />
          <div v-else class="flex h-full w-full items-center justify-center bg-background">
            <Icon :name="p.icon || 'devicon:flutter'" class="text-2xl" />
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="font-semibold text-on-surface">{{ p.title }}</h3>
            <span class="chip">{{ p.category }}</span>
            <span v-if="p.status" class="chip">{{ p.status }}</span>
            <span v-if="!p.featured" class="chip !text-amber-600 dark:!text-amber-400">Hidden</span>
          </div>
          <p class="mt-1 line-clamp-1 text-sm text-on-surface-variant">{{ p.description }}</p>
        </div>
        <div class="flex gap-2">
          <button class="btn-secondary !px-3 !py-2" @click="openEditor(p)">
            <span class="material-symbols-outlined text-[18px]">edit</span>Edit
          </button>
          <button class="btn-secondary !px-3 !py-2 hover:!border-rose-400 hover:!text-rose-600" @click="removeRow(p)">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </li>
    </ul>

    <!-- Editor -->
    <AdminModal :open="!!form" :title="form?.id ? 'Edit project' : 'New project'" @close="form = null">
      <form v-if="form" class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
        <label class="sm:col-span-2">
          <span class="label">Title *</span>
          <input v-model.trim="form.title" required class="input" />
        </label>
        <label>
          <span class="label">Category *</span>
          <input v-model.trim="form.category" required class="input" placeholder="E-Commerce" list="project-categories" />
          <datalist id="project-categories">
            <option v-for="c in categories" :key="c" :value="c" />
          </datalist>
        </label>
        <label>
          <span class="label">Status</span>
          <select v-model="form.status" class="input">
            <option value="">None</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </label>
        <label class="sm:col-span-2">
          <span class="label">Description *</span>
          <textarea v-model.trim="form.description" required rows="3" class="input"></textarea>
        </label>

        <label>
          <span class="label">Logo image (path or URL)</span>
          <div class="flex gap-2">
            <input v-model.trim="form.logo" class="input" placeholder="/image/projects/my-app.png" />
            <div class="h-[42px] w-[42px] shrink-0 overflow-hidden rounded-lg border border-line bg-zinc-950">
              <img v-if="form.logo" :src="form.logo" alt="" class="h-full w-full object-cover" />
            </div>
          </div>
        </label>
        <label>
          <span class="label">Icon (used when no logo)</span>
          <div class="flex gap-2">
            <input v-model.trim="form.icon" class="input" placeholder="devicon:flutter" />
            <div class="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-line">
              <Icon v-if="form.icon" :name="form.icon" class="text-xl" />
            </div>
          </div>
        </label>

        <label>
          <span class="label">Live demo URL</span>
          <input v-model.trim="form.demo_url" type="url" class="input" placeholder="https://" />
        </label>
        <label>
          <span class="label">Source code URL</span>
          <input v-model.trim="form.github_url" class="input" placeholder="https://github.com/…" />
        </label>

        <!-- Tags -->
        <div class="sm:col-span-2">
          <span class="label">Technologies</span>
          <div class="space-y-2">
            <div v-for="(tag, i) in form.tags" :key="i" class="flex gap-2">
              <input v-model.trim="tag.name" class="input" placeholder="Flutter" />
              <input v-model.trim="tag.icon" class="input" placeholder="devicon:flutter" />
              <div class="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-line">
                <Icon v-if="tag.icon" :name="tag.icon" class="text-lg" />
              </div>
              <button type="button" class="btn-secondary !px-2.5" aria-label="Remove technology" @click="form.tags.splice(i, 1)">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
          <button type="button" class="mt-2 text-sm font-medium text-primary hover:underline" @click="form.tags.push({ name: '', icon: '' })">
            + Add technology
          </button>
          <p class="mt-1 text-xs text-on-surface-variant">
            Icon names come from <a href="https://icones.js.org" target="_blank" rel="noopener" class="underline">icones.js.org</a>, e.g. devicon:flutter, logos:dart.
          </p>
        </div>

        <label class="flex items-center gap-2 sm:col-span-2">
          <input v-model="form.featured" type="checkbox" class="h-4 w-4 rounded border-line accent-primary" />
          <span class="text-sm text-on-surface">Show on the website</span>
        </label>

        <p v-if="formError" class="text-sm text-rose-600 dark:text-rose-400 sm:col-span-2">{{ formError }}</p>

        <div class="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2">
          <button type="button" class="btn-secondary" @click="form = null">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save project' }}</button>
        </div>
      </form>
    </AdminModal>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdmin } from '~/composables/useAdmin'

interface Tag { name: string; icon: string }
interface ProjectRow {
  id?: string
  title: string
  category: string
  description: string
  icon: string
  logo: string
  link: string
  github_url: string
  demo_url: string
  status: string
  featured: boolean
  tags: Tag[]
}

const emit = defineEmits<{ changed: [] }>()
const { list, save, remove } = useAdmin()

const statuses = ['Released', 'Production', 'Featured', 'Beta']
const rows = ref<ProjectRow[]>([])
const loading = ref(true)
const form = ref<ProjectRow | null>(null)
const saving = ref(false)
const formError = ref('')
const notice = ref<{ ok: boolean; text: string } | null>(null)

const categories = computed(() => [...new Set(rows.value.map(r => r.category).filter(Boolean))])
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
    const data = await list<any>('projects')
    rows.value = data.map(r => ({
      ...r,
      icon: r.icon || '',
      logo: r.logo || '',
      link: r.link || '#',
      github_url: r.github_url && r.github_url !== '#' ? r.github_url : '',
      demo_url: r.demo_url || '',
      status: r.status || '',
      featured: r.featured ?? true,
      tags: Array.isArray(r.tags) ? r.tags : []
    }))
  } catch (e: any) {
    flash(false, e.message)
  } finally {
    loading.value = false
  }
}

const blank = (): ProjectRow => ({
  title: '', category: '', description: '', icon: 'devicon:flutter', logo: '', link: '#',
  github_url: '', demo_url: '', status: '', featured: true, tags: [{ name: 'Flutter', icon: 'devicon:flutter' }]
})

const openEditor = (row?: ProjectRow) => {
  formError.value = ''
  form.value = row ? JSON.parse(JSON.stringify(row)) : blank()
}

const submit = async () => {
  if (!form.value) return
  saving.value = true
  formError.value = ''
  const f = form.value
  try {
    await save('projects', {
      id: f.id,
      title: f.title,
      category: f.category,
      description: f.description,
      icon: f.icon || 'devicon:flutter',
      logo: f.logo || null,
      link: f.link || '#',
      github_url: f.github_url || '#',
      demo_url: f.demo_url || null,
      status: f.status || null,
      featured: f.featured,
      tags: f.tags.filter(t => t.name)
    })
    form.value = null
    flash(true, `Saved "${f.title}".`)
    await load()
    emit('changed')
  } catch (e: any) {
    formError.value = e.code === '23505' ? 'A project with this title already exists.' : e.message
  } finally {
    saving.value = false
  }
}

const removeRow = async (row: ProjectRow) => {
  if (!row.id || !confirm(`Delete "${row.title}"? This cannot be undone.`)) return
  try {
    await remove('projects', row.id)
    flash(true, `Deleted "${row.title}".`)
    await load()
    emit('changed')
  } catch (e: any) {
    flash(false, e.message)
  }
}

onMounted(load)
</script>
