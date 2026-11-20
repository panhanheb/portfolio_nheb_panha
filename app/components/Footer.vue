<template>
  <footer class="relative isolate overflow-hidden border-t border-line bg-surface text-on-surface-variant">
    <!-- Soft accent glows (follow the theme accent) -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute -right-32 -top-24 h-80 w-[32rem] rounded-full bg-primary/10 blur-3xl"></div>
      <div class="absolute -bottom-40 left-[10%] h-64 w-[70%] rounded-full bg-primary/10 blur-3xl"></div>
    </div>

    <!-- Main columns -->
    <div class="container-page grid gap-12 pb-14 pt-16 sm:grid-cols-2 md:pt-20 lg:grid-cols-[1.4fr_1fr_1.1fr_1.2fr] lg:gap-10">
      <!-- Brand -->
      <div>
        <a href="#hero" class="flex items-center gap-3">
          <img src="/logo_test.png" alt="" class="h-12 w-12 rounded-xl bg-zinc-900 object-contain p-1.5 ring-1 ring-line" />
          <span>
            <span class="block text-2xl font-bold tracking-tight text-on-surface">{{ firstName }} <span class="text-primary">{{ lastName }}</span></span>
            <span class="block text-sm text-on-surface-variant">{{ c.profile.role }}</span>
          </span>
        </a>
        <p class="mt-5 max-w-xs text-[15px] leading-relaxed text-on-surface-variant">
          {{ c.footer.tagline }}
        </p>
        <ul class="mt-6 flex flex-wrap gap-3">
          <li v-for="social in socialLinks" :key="social.name">
            <a
              :href="social.href"
              :target="social.href.startsWith('http') ? '_blank' : undefined"
              rel="noopener noreferrer"
              :aria-label="social.name"
              class="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-background text-on-surface-variant transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
            >
              <Icon :name="social.icon" class="text-xl" />
            </a>
          </li>
        </ul>
      </div>

      <!-- Quick links -->
      <nav aria-label="Footer">
        <h3 class="footer-heading">Quick Links</h3>
        <ul class="mt-6 space-y-3">
          <li v-for="link in quickLinks" :key="link.href">
            <a :href="link.href" class="group flex items-center justify-between text-[15px] text-on-surface-variant transition-colors hover:text-primary lg:max-w-[13rem]">
              {{ link.name }}
              <Icon name="mdi:chevron-right" class="text-lg text-on-surface-variant/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </a>
          </li>
        </ul>
      </nav>

      <!-- Services -->
      <div>
        <h3 class="footer-heading">Services</h3>
        <ul class="mt-6 space-y-3.5">
          <li v-for="service in c.footer.services" :key="service.name" class="flex items-center gap-3 text-[15px] text-on-surface-variant">
            <Icon :name="service.icon" class="shrink-0 text-xl text-primary" />
            {{ service.name }}
          </li>
        </ul>
      </div>

      <!-- Contact -->
      <div>
        <h3 class="footer-heading">Contact Info</h3>
        <ul class="mt-6 space-y-3.5 text-[15px]">
          <li class="flex items-center gap-3 text-on-surface-variant">
            <Icon name="mdi:map-marker-outline" class="shrink-0 text-xl text-primary" />
            {{ c.profile.location }}
          </li>
          <li>
            <a :href="`mailto:${c.profile.email}`" class="flex items-center gap-3 break-all text-on-surface-variant transition-colors hover:text-primary">
              <Icon name="mdi:email-outline" class="shrink-0 text-xl text-primary" />
              {{ c.profile.email }}
            </a>
          </li>
          <li v-if="c.profile.telegram">
            <a :href="`https://t.me/${c.profile.telegram}`" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 text-on-surface-variant transition-colors hover:text-primary">
              <Icon name="mdi:telegram" class="shrink-0 text-xl text-primary" />
              @{{ c.profile.telegram }}
            </a>
          </li>
        </ul>
        <ul class="mt-6 flex flex-wrap gap-2">
          <li v-for="tech in c.footer.tech" :key="tech.name" class="chip !rounded-full !bg-background !px-3 !py-1.5">
            <Icon :name="tech.icon" class="text-sm" />
            {{ tech.name }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-line">
      <div class="container-page flex flex-col items-center justify-between gap-5 py-6 text-sm text-on-surface-variant sm:flex-row">
        <div class="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
          <p>&copy; {{ year }} {{ c.profile.name }}. All rights reserved.</p>
          <span aria-hidden="true" class="hidden h-5 w-px bg-line sm:block"></span>
          <p class="inline-flex items-center gap-1.5">
            Made with <Icon name="mdi:heart" class="text-rose-500" aria-label="love" /> in Cambodia
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSiteContent } from '~/composables/useSiteContent'

const year = new Date().getFullYear()
const { content: c } = useSiteContent()

// "Nheb Panha" -> "Nheb" + highlighted "Panha"
const firstName = computed(() => c.value.profile.name.split(' ').slice(0, -1).join(' ') || c.value.profile.name)
const lastName = computed(() => {
  const parts = c.value.profile.name.split(' ')
  return parts.length > 1 ? parts[parts.length - 1] : ''
})

const socialLinks = computed(() => {
  const p = c.value.profile
  return [
    { name: 'GitHub', href: p.github_url, icon: 'mdi:github' },
    { name: 'LinkedIn', href: p.linkedin_url, icon: 'mdi:linkedin' },
    { name: 'Telegram', href: p.telegram ? `https://t.me/${p.telegram}` : '', icon: 'mdi:telegram' },
    { name: 'Email', href: p.email ? `mailto:${p.email}` : '', icon: 'mdi:email-outline' }
  ].filter(s => s.href)
})

const quickLinks = [
  { name: 'Home', href: '#hero' },
  { name: 'About Me', href: '#about' },
  { name: 'Projects', href: '#portfolio' },
  { name: 'Blog', href: '#blog' },
  { name: 'Contact', href: '#contact' }
]

</script>

<style scoped>
.footer-heading {
  position: relative;
  padding-bottom: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--text-rgb));
}
.footer-heading::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 2.5rem;
  height: 3px;
  border-radius: 9999px;
  background: rgb(var(--accent-rgb));
}
</style>
