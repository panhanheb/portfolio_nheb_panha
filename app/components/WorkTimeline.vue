<template>
  <section id="timeline" class="section">
    <div ref="sectionRef" class="container-page">
      <SectionHeading
        eyebrow="Experience"
        title="Where I've worked"
        lead="Roles across mobile, web and backend development, most recent first."
      />

      <ol class="relative mt-14 border-l border-line md:ml-[11rem]">
        <li
          v-for="(item, index) in experiences"
          :key="item.id || index"
          class="reveal relative pb-12 pl-8 last:pb-0 md:pl-10"
          :class="{ 'reveal-hidden': !isVisible }"
          :style="{ transitionDelay: `${Math.min(index, 6) * 90}ms` }"
        >
          <!-- Marker -->
          <span
            aria-hidden="true"
            class="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background"
            :class="index === 0 ? 'bg-primary' : 'bg-line'"
          ></span>

          <!-- Period (sits left of the line on desktop) -->
          <p class="mb-2 font-mono text-xs text-on-surface-variant md:absolute md:-left-[11rem] md:top-1 md:mb-0 md:w-36 md:text-right">
            {{ item.period }}
          </p>

          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 class="text-lg font-semibold text-on-surface">{{ item.role }}</h3>
            <span class="chip !py-0.5">{{ item.type }}</span>
          </div>
          <p class="mt-1 text-sm text-on-surface-variant">
            <span class="font-medium text-on-surface">{{ item.company }}</span>
            <span class="mx-1.5">·</span>{{ item.location }}
          </p>

          <p class="mt-4 max-w-3xl text-[15px] leading-relaxed text-on-surface-variant">{{ item.summary }}</p>

          <ul class="mt-4 max-w-3xl space-y-2">
            <li v-for="(highlight, hIdx) in item.highlights" :key="hIdx" class="flex gap-3 text-sm leading-relaxed text-on-surface-variant">
              <span aria-hidden="true" class="mt-2 h-1 w-1 shrink-0 rounded-full bg-on-surface-variant"></span>
              <span>{{ highlight }}</span>
            </li>
          </ul>

          <div class="mt-5 flex flex-wrap gap-1.5">
            <span v-for="t in item.tech_stack" :key="t" class="chip">{{ t }}</span>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useScrollAnimate } from '~/composables/useScrollAnimate'
import { useSiteContent } from '~/composables/useSiteContent'

const { sectionRef, isVisible } = useScrollAnimate(0.05)

const { experiences } = useSiteContent()
</script>
