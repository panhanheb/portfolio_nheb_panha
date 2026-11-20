<template>
  <section>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-on-surface">Blog posts</h2>
        <p class="text-sm text-on-surface-variant">Shown in the "Writing" section of your site.</p>
      </div>
      <button class="btn-primary" @click="openEditor()">
        <span class="material-symbols-outlined text-[18px]">add</span>
        New post
      </button>
    </div>

    <p v-if="notice" class="mt-4 rounded-lg border px-4 py-2.5 text-sm" :class="noticeClass">{{ notice.text }}</p>

    <div v-if="loading" class="mt-6 text-sm text-on-surface-variant">Loading…</div>
    <div v-else-if="!rows.length" class="card mt-6 px-6 py-12 text-center text-sm text-on-surface-variant">
      No posts yet. Click "New post" to write one.
    </div>

    <ul v-else class="mt-6 grid gap-3">
      <li v-for="p in rows" :key="p.id" class="card flex flex-wrap items-center gap-4 p-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line bg-background">
          <Icon :name="p.icon || 'logos:flutter'" class="text-2xl" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="font-semibold text-on-surface">{{ p.title }}</h3>
            <span class="chip">{{ p.category }}</span>
          </div>
          <p class="mt-1 text-xs text-on-surface-variant">{{ p.published_at }} · {{ p.read_time }} · /{{ p.slug }}</p>
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
    <AdminModal :open="!!form" :title="form?.id ? 'Edit post' : 'New post'" @close="form = null">
      <form v-if="form" class="grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
        <label class="sm:col-span-2">
          <span class="label">Title *</span>
          <input v-model.trim="form.title" required class="input" @input="autoSlug" />
        </label>
        <label>
          <span class="label">Slug *</span>
          <input v-model.trim="form.slug" required pattern="[a-z0-9-]+" class="input font-mono" @input="slugTouched = true" />
        </label>
        <label>
          <span class="label">Category *</span>
          <input v-model.trim="form.category" required class="input" placeholder="Mobile Architecture" />
        </label>
        <label class="sm:col-span-2">
          <span class="label">Summary *</span>
          <textarea v-model.trim="form.summary" required rows="2" class="input"></textarea>
        </label>
        <label class="sm:col-span-2">
          <span class="label">Content * <span class="font-normal text-on-surface-variant">(use ### for headings)</span></span>
          <textarea v-model="form.content" required rows="10" class="input font-mono !text-[13px]"></textarea>
        </label>
        <label>
          <span class="label">Published</span>
          <input v-model.trim="form.published_at" class="input" placeholder="Jul 2025" />
        </label>
        <label>
          <span class="label">Read time</span>
          <input v-model.trim="form.read_time" class="input" placeholder="5 min read" />
        </label>
        <label>
          <span class="label">Author</span>
          <input v-model.trim="form.author" class="input" />
        </label>
        <label>
          <span class="label">Icon</span>
          <div class="flex gap-2">
            <input v-model.trim="form.icon" class="input" placeholder="logos:flutter" />
            <div class="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-line">
              <Icon v-if="form.icon" :name="form.icon" class="text-xl" />
            </div>
          </div>
        </label>
        <label class="sm:col-span-2">
          <span class="label">Tags <span class="font-normal text-on-surface-variant">(comma separated)</span></span>
          <input v-model="tagsText" class="input" placeholder="Flutter, Supabase, BLoC" />
        </label>

        <p v-if="formError" class="text-sm text-rose-600 dark:text-rose-400 sm:col-span-2">{{ formError }}</p>

        <div class="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2">
          <button type="button" class="btn-secondary" @click="form = null">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save post' }}</button>
        </div>
      </form>
    </AdminModal>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdmin } from '~/composables/useAdmin'

interface PostRow {
  id?: string
  title: string
  slug: string
  category: string
  summary: string
  content: string
  read_time: string
  published_at: string
  author: string
  tags: string[]
  icon: string
}

const emit = defineEmits<{ changed: [] }>()
const { list, save, remove } = useAdmin()

const rows = ref<PostRow[]>([])
const loading = ref(true)
const form = ref<PostRow | null>(null)
const tagsText = ref('')
const slugTouched = ref(false)
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

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80)

const autoSlug = () => {
  if (form.value && !form.value.id && !slugTouched.value) form.value.slug = slugify(form.value.title)
}

const load = async () => {
  loading.value = true
  try {
    const data = await list<any>('blog_posts')
    rows.value = data.map(r => ({ ...r, tags: Array.isArray(r.tags) ? r.tags : [] }))
  } catch (e: any) {
    flash(false, e.message)
  } finally {
    loading.value = false
  }
}

const today = () => new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

const openEditor = (row?: PostRow) => {
  formError.value = ''
  slugTouched.value = !!row
  form.value = row
    ? JSON.parse(JSON.stringify(row))
    : { title: '', slug: '', category: '', summary: '', content: '', read_time: '5 min read', published_at: today(), author: 'Nheb Panha', tags: [], icon: 'logos:flutter' }
  tagsText.value = form.value!.tags.join(', ')
}

const submit = async () => {
  if (!form.value) return
  saving.value = true
  formError.value = ''
  const f = form.value
  try {
    await save('blog_posts', {
      id: f.id,
      title: f.title,
      slug: f.slug,
      category: f.category,
      summary: f.summary,
      content: f.content,
      read_time: f.read_time || '5 min read',
      published_at: f.published_at || today(),
      author: f.author || 'Nheb Panha',
      icon: f.icon || 'logos:flutter',
      tags: tagsText.value.split(',').map(t => t.trim()).filter(Boolean)
    })
    form.value = null
    flash(true, `Saved "${f.title}".`)
    await load()
    emit('changed')
  } catch (e: any) {
    formError.value = e.code === '23505' ? 'Another post already uses this slug.' : e.message
  } finally {
    saving.value = false
  }
}

const removeRow = async (row: PostRow) => {
  if (!row.id || !confirm(`Delete "${row.title}"? This cannot be undone.`)) return
  try {
    await remove('blog_posts', row.id)
    flash(true, `Deleted "${row.title}".`)
    await load()
    emit('changed')
  } catch (e: any) {
    flash(false, e.message)
  }
}

onMounted(load)
</script>
