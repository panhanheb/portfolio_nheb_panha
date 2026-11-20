<template>
  <section>
    <div>
      <h2 class="text-xl font-semibold text-on-surface">Website content</h2>
      <p class="text-sm text-on-surface-variant">Edit the text, links and lists shown on each part of your site.</p>
    </div>

    <!-- Section switcher -->
    <div class="mt-5 flex flex-wrap gap-1.5" role="tablist" aria-label="Website sections">
      <button
        v-for="s in sections"
        :key="s.key"
        role="tab"
        :aria-selected="active === s.key"
        class="filter-btn inline-flex items-center gap-1.5"
        :class="active === s.key ? 'filter-btn-active' : 'filter-btn-idle'"
        @click="active = s.key"
      >
        <span class="material-symbols-outlined text-[16px]">{{ s.icon }}</span>
        {{ s.label }}
        <span v-if="dirty[s.key]" class="h-1.5 w-1.5 rounded-full bg-amber-500" aria-label="Unsaved changes"></span>
      </button>
    </div>

    <div v-if="loading" class="mt-6 text-sm text-on-surface-variant">Loading…</div>

    <form v-else class="card mt-5 p-5 sm:p-6" @submit.prevent="saveActive">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
        <div>
          <h3 class="font-semibold text-on-surface">{{ current.label }}</h3>
          <p class="text-xs text-on-surface-variant">
            {{ current.where }} ·
            <span v-if="savedAt[active]">Last saved {{ formatDate(savedAt[active]!) }}</span>
            <span v-else>Showing the built-in default text</span>
          </p>
        </div>
        <button type="button" class="text-sm text-on-surface-variant hover:text-primary" @click="resetActive">
          Reset to default
        </button>
      </div>

      <!-- PROFILE -->
      <div v-if="active === 'profile'" class="grid gap-4 sm:grid-cols-2">
        <label><span class="label">Name</span><input v-model="form.profile.name" required class="input" /></label>
        <label><span class="label">Role / title</span><input v-model="form.profile.role" class="input" /></label>
        <label class="sm:col-span-2"><span class="label">Availability badge</span><input v-model="form.profile.availability" class="input" placeholder="Available for freelance and full-time roles" /></label>
        <label><span class="label">Location</span><input v-model="form.profile.location" class="input" /></label>
        <label><span class="label">Time zone</span><input v-model="form.profile.timezone" class="input" placeholder="UTC+7" /></label>
        <label><span class="label">Email</span><input v-model="form.profile.email" type="email" class="input" /></label>
        <label><span class="label">Telegram username <span class="font-normal text-on-surface-variant">(without @)</span></span><input v-model="form.profile.telegram" class="input" /></label>
        <label><span class="label">GitHub URL</span><input v-model="form.profile.github_url" type="url" class="input" /></label>
        <label><span class="label">LinkedIn URL</span><input v-model="form.profile.linkedin_url" type="url" class="input" /></label>
        <label class="sm:col-span-2">
          <span class="label">Portrait photo (path or URL)</span>
          <div class="flex gap-3">
            <input v-model="form.profile.portrait_url" class="input" placeholder="/image/panha_portrait.jpg" />
            <img v-if="form.profile.portrait_url" :src="form.profile.portrait_url" alt="" class="h-[42px] w-[42px] shrink-0 rounded-lg object-cover ring-1 ring-line" />
          </div>
        </label>
      </div>

      <!-- HERO -->
      <div v-else-if="active === 'hero'" class="space-y-5">
        <label class="block"><span class="label">Introduction</span><textarea v-model="form.hero.intro" rows="4" class="input"></textarea></label>
        <div>
          <span class="label">Quick facts <span class="font-normal text-on-surface-variant">(under the intro)</span></span>
          <AdminListEditor v-model="form.hero.facts" :fields="[{ key: 'label', label: 'Label' }, { key: 'value', label: 'Value' }]" add-label="Add fact" />
        </div>
        <p class="text-xs text-on-surface-variant">Name, role, availability and photo are edited under <button type="button" class="text-primary hover:underline" @click="active = 'profile'">Profile</button>.</p>
      </div>

      <!-- ABOUT -->
      <div v-else-if="active === 'about'" class="space-y-5">
        <label class="block"><span class="label">Heading</span><input v-model="form.about.title" class="input" /></label>
        <div>
          <span class="label">Paragraphs</span>
          <AdminListEditor v-model="form.about.paragraphs" multiline add-label="Add paragraph" />
        </div>
        <div>
          <span class="label">Core stack chips</span>
          <AdminListEditor v-model="form.about.core_stack" :fields="iconItemFields" add-label="Add technology" />
        </div>
        <div>
          <span class="label">Service cards</span>
          <AdminListEditor
            v-model="form.about.services"
            :fields="[{ key: 'title', label: 'Title' }, { key: 'icon', label: 'Icon', placeholder: 'smartphone', type: 'symbol' }, { key: 'body', label: 'Description', type: 'textarea' }]"
            add-label="Add service"
          />
          <p class="mt-1 text-xs text-on-surface-variant">Card icons use <a href="https://fonts.google.com/icons" target="_blank" rel="noopener" class="underline">Material Symbols</a> names, e.g. smartphone, web, dns, database.</p>
        </div>
      </div>

      <!-- SKILLS -->
      <div v-else-if="active === 'skills'" class="space-y-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <label><span class="label">Heading</span><input v-model="form.skills.title" class="input" /></label>
          <label><span class="label">Intro line</span><input v-model="form.skills.lead" class="input" /></label>
        </div>

        <div>
          <span class="label">Skill groups</span>
          <div class="space-y-3">
            <div v-for="(group, gi) in form.skills.groups" :key="gi" class="rounded-xl border border-line p-4">
              <div class="flex flex-wrap items-end gap-2">
                <label class="min-w-[10rem] flex-1"><span class="label">Group name</span><input v-model="group.title" class="input" /></label>
                <label class="w-44">
                  <span class="label">Icon</span>
                  <div class="relative">
                    <input v-model="group.icon" class="input !pr-10" placeholder="smartphone" />
                    <span class="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-primary">{{ group.icon }}</span>
                  </div>
                </label>
                <button type="button" class="btn-secondary !px-2.5" :disabled="gi === 0" aria-label="Move group up" @click="moveGroup(gi, -1)">
                  <span class="material-symbols-outlined text-[18px]">arrow_upward</span>
                </button>
                <button type="button" class="btn-secondary !px-2.5" :disabled="gi === form.skills.groups.length - 1" aria-label="Move group down" @click="moveGroup(gi, 1)">
                  <span class="material-symbols-outlined text-[18px]">arrow_downward</span>
                </button>
                <button type="button" class="btn-secondary !px-2.5 hover:!border-rose-400 hover:!text-rose-600" aria-label="Delete group" @click="removeGroup(gi)">
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
              <div class="mt-3">
                <AdminListEditor
                  v-model="group.items"
                  :fields="[{ key: 'name', label: 'Skill' }, { key: 'icon', label: 'Icon', placeholder: 'devicon:flutter', type: 'icon' }, { key: 'note', label: 'Note (optional)' }]"
                  add-label="Add skill"
                />
              </div>
            </div>
          </div>
          <button type="button" class="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline" @click="form.skills.groups.push({ title: '', icon: 'code', items: [] })">
            <span class="material-symbols-outlined text-[18px]">add</span>Add group
          </button>
        </div>

        <div>
          <span class="label">"How I work" points</span>
          <AdminListEditor v-model="form.skills.practices" add-label="Add point" />
        </div>
      </div>

      <!-- CONTACT -->
      <div v-else-if="active === 'contact'" class="space-y-4">
        <label class="block"><span class="label">Heading</span><input v-model="form.contact.title" class="input" /></label>
        <label class="block"><span class="label">Intro text</span><textarea v-model="form.contact.lead" rows="3" class="input"></textarea></label>
        <p class="text-xs text-on-surface-variant">Email, Telegram and location are edited under <button type="button" class="text-primary hover:underline" @click="active = 'profile'">Profile</button>.</p>
      </div>

      <!-- FOOTER -->
      <div v-else-if="active === 'footer'" class="space-y-5">
        <label class="block"><span class="label">Short description</span><textarea v-model="form.footer.tagline" rows="2" class="input"></textarea></label>
        <div>
          <span class="label">Services list</span>
          <AdminListEditor v-model="form.footer.services" :fields="iconItemFields" add-label="Add service" />
        </div>
        <div>
          <span class="label">Technology badges</span>
          <AdminListEditor v-model="form.footer.tech" :fields="iconItemFields" add-label="Add badge" />
        </div>
      </div>

      <!-- CHATBOT -->
      <div v-if="active === 'chatbot'" class="space-y-5">
        <div class="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-on-surface-variant">
          <span class="material-symbols-outlined text-[20px] text-primary">auto_awesome</span>
          <p>
            The bot automatically knows everything on your site: profile, about, skills, experience, projects and blog posts.
            Edit those sections and the bot picks up the changes within a minute. Use the fields below for anything extra.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <label><span class="label">Chat window title</span><input v-model="form.chatbot.title" class="input" /></label>
          <label class="flex items-center gap-3 self-end rounded-lg border border-line px-3.5 py-2.5">
            <input v-model="form.chatbot.ai_enabled" type="checkbox" class="h-4 w-4 rounded border-line accent-primary" />
            <span class="text-sm">
              <span class="font-medium text-on-surface">AI replies</span>
              <span class="block text-xs text-on-surface-variant">Off = built-in answers only (no AI cost)</span>
            </span>
          </label>
        </div>

        <label class="block"><span class="label">Greeting message</span><textarea v-model="form.chatbot.greeting" rows="2" class="input"></textarea></label>

        <div>
          <span class="label">Suggestion buttons</span>
          <AdminListEditor
            v-model="form.chatbot.suggestions"
            :fields="[{ key: 'label', label: 'Button label' }, { key: 'question', label: 'Question it sends' }]"
            add-label="Add suggestion"
          />
        </div>

        <label class="block">
          <span class="label">Extra instructions for the AI <span class="font-normal text-on-surface-variant">(optional)</span></span>
          <textarea
            v-model="form.chatbot.instructions"
            rows="6"
            class="input"
            placeholder="e.g. My hourly rate starts at $25. I reply within 24 hours. Always mention I can work in Khmer and English. Don't discuss pricing for projects over 3 months — ask them to email me."
          ></textarea>
          <span class="mt-1 block text-xs text-on-surface-variant">Facts, prices, policies or tone. The AI follows these and never makes up anything else.</span>
        </label>
      </div>

      <p v-if="active !== 'chatbot'" class="mt-5 text-xs text-on-surface-variant">
        Iconify icon names (e.g. devicon:flutter, logos:dart, mdi:web) can be found at
        <a href="https://icones.js.org" target="_blank" rel="noopener" class="underline">icones.js.org</a>.
      </p>

      <div class="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4">
        <p v-if="notice" class="mr-auto text-sm" :class="notice.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">{{ notice.text }}</p>
        <button type="submit" class="btn-primary" :disabled="saving">
          <Icon v-if="saving" name="mdi:loading" class="animate-spin" />
          {{ saving ? 'Saving…' : `Save ${current.label}` }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAdmin } from '~/composables/useAdmin'
import { useSiteContent, DEFAULT_CONTENT, type SiteContent, type SiteSection } from '~/composables/useSiteContent'
type ListField = { key: string; label: string; placeholder?: string; type?: 'text' | 'textarea' | 'icon' | 'symbol' }

const { getContent, saveContent } = useAdmin()
const { content: liveContent, mergeSection } = useSiteContent()

const sections: { key: SiteSection; label: string; icon: string; where: string }[] = [
  { key: 'profile', label: 'Profile', icon: 'person', where: 'Used in the hero, contact section and footer' },
  { key: 'hero', label: 'Hero', icon: 'home', where: 'Top of the home page' },
  { key: 'about', label: 'About', icon: 'info', where: 'About section' },
  { key: 'skills', label: 'Skills', icon: 'construction', where: 'Skills section' },
  { key: 'contact', label: 'Contact', icon: 'mail', where: 'Contact section' },
  { key: 'footer', label: 'Footer', icon: 'bottom_navigation', where: 'Footer at the bottom of every page' },
  { key: 'chatbot', label: 'Chatbot', icon: 'smart_toy', where: 'AI assistant in the bottom-right corner' }
]

const iconItemFields: ListField[] = [
  { key: 'name', label: 'Name' },
  { key: 'icon', label: 'Icon', placeholder: 'devicon:flutter', type: 'icon' }
]

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

const active = ref<SiteSection>('profile')
const current = computed(() => sections.find(s => s.key === active.value)!)
const form = reactive<SiteContent>(clone(DEFAULT_CONTENT))
const saved = reactive<Record<string, string>>({}) // JSON snapshot of the last saved/loaded state, per section
const savedAt = reactive<Partial<Record<SiteSection, string>>>({})
const loading = ref(true)
const saving = ref(false)
const notice = ref<{ ok: boolean; text: string } | null>(null)

const dirty = computed(() =>
  Object.fromEntries(sections.map(s => [s.key, JSON.stringify(form[s.key]) !== saved[s.key]])) as Record<SiteSection, boolean>
)

watch(active, () => { notice.value = null })

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const load = async () => {
  loading.value = true
  try {
    const rows = await getContent()
    for (const s of sections) {
      const row = rows.find((r: any) => r.key === s.key)
      ;(form as any)[s.key] = mergeSection(s.key, row?.value)
      saved[s.key] = JSON.stringify(form[s.key])
      if (row?.updated_at) savedAt[s.key] = row.updated_at
    }
  } catch (e: any) {
    notice.value = { ok: false, text: e.message }
  } finally {
    loading.value = false
  }
}

const saveActive = async () => {
  const key = active.value
  saving.value = true
  notice.value = null
  try {
    const value = clone(form[key])
    await saveContent(key, value)
    saved[key] = JSON.stringify(form[key])
    savedAt[key] = new Date().toISOString()
    ;(liveContent.value as any)[key] = value // the public site picks it up without a reload
    notice.value = { ok: true, text: `${current.value.label} saved. It's live on your website now.` }
  } catch (e: any) {
    notice.value = { ok: false, text: e.message }
  } finally {
    saving.value = false
  }
}

const resetActive = () => {
  if (!confirm(`Replace the ${current.value.label} fields with the built-in defaults? Nothing is saved until you click Save.`)) return
  ;(form as any)[active.value] = clone(DEFAULT_CONTENT[active.value])
}

const moveGroup = (i: number, dir: -1 | 1) => {
  const g = form.skills.groups
  const j = i + dir
  if (j < 0 || j >= g.length) return
  const [item] = g.splice(i, 1)
  g.splice(j, 0, item!)
}
const removeGroup = (i: number) => {
  if (confirm(`Delete the "${form.skills.groups[i]?.title || 'untitled'}" group and its skills?`)) form.skills.groups.splice(i, 1)
}

// Warn before leaving with unsaved changes.
const beforeUnload = (e: BeforeUnloadEvent) => {
  if (Object.values(dirty.value).some(Boolean)) e.preventDefault()
}
onMounted(() => {
  load()
  window.addEventListener('beforeunload', beforeUnload)
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
</script>
