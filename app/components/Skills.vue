<template>
  <section id="skills" class="section">
    <div ref="sectionRef" class="container-page">
      <SectionHeading
        eyebrow="Skills"
        :title="c.skills.title"
        :lead="c.skills.lead"
      />

      <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(group, i) in c.skills.groups"
          :key="group.title"
          class="card reveal p-6"
          :class="{ 'reveal-hidden': !isVisible }"
          :style="{ transitionDelay: `${Math.min(i, 6) * 70}ms` }"
        >
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-[22px] text-primary">{{ group.icon }}</span>
            <h3 class="text-base font-semibold text-on-surface">{{ group.title }}</h3>
          </div>
          <ul class="mt-5 space-y-3">
            <li v-for="skill in group.items" :key="skill.name" class="flex items-center gap-3 text-sm">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface">
                <Icon :name="skill.icon" class="text-base" />
              </span>
              <span class="font-medium text-on-surface">{{ skill.name }}</span>
              <span v-if="skill.note" class="ml-auto text-xs text-on-surface-variant">{{ skill.note }}</span>
            </li>
          </ul>
        </article>

        <!-- Practices -->
        <article class="card reveal p-6 sm:col-span-2 lg:col-span-1" :class="{ 'reveal-hidden': !isVisible }" style="transition-delay: 350ms">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-[22px] text-primary">verified</span>
            <h3 class="text-base font-semibold text-on-surface">How I work</h3>
          </div>
          <ul class="mt-5 space-y-3">
            <li v-for="practice in c.skills.practices" :key="practice" class="flex gap-3 text-sm leading-relaxed text-on-surface-variant">
              <span class="material-symbols-outlined mt-0.5 text-[16px] text-emerald-600 dark:text-emerald-400">check</span>
              <span>{{ practice }}</span>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useScrollAnimate } from '~/composables/useScrollAnimate'
import { useSiteContent } from '~/composables/useSiteContent'

const { sectionRef, isVisible } = useScrollAnimate(0.05)

const { content: c } = useSiteContent()
</script>
