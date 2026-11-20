<template>
  <section id="about" class="section section-alt">
    <div ref="sectionRef" class="container-page grid gap-12 lg:grid-cols-12">
      <!-- Story -->
      <div class="reveal lg:col-span-5" :class="{ 'reveal-hidden': !isVisible }">
        <SectionHeading eyebrow="About" :title="c.about.title" />
        <div class="mt-6 space-y-4 text-base leading-relaxed text-on-surface-variant">
          <p v-for="(para, i) in c.about.paragraphs" :key="i">{{ para }}</p>
        </div>

        <div class="mt-8 flex flex-wrap gap-2">
          <span v-for="tech in c.about.core_stack" :key="tech.name" class="chip">
            <Icon :name="tech.icon" class="text-sm" />
            {{ tech.name }}
          </span>
        </div>
      </div>

      <!-- Services -->
      <div class="lg:col-span-7">
        <div class="grid gap-4 sm:grid-cols-2">
          <article
            v-for="(item, i) in c.about.services"
            :key="item.title"
            class="card card-hover reveal p-6"
            :class="{ 'reveal-hidden': !isVisible }"
            :style="{ transitionDelay: `${i * 80}ms` }"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span class="material-symbols-outlined text-[22px]">{{ item.icon }}</span>
            </div>
            <h3 class="mt-4 text-base font-semibold text-on-surface">{{ item.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-on-surface-variant">{{ item.body }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useScrollAnimate } from '~/composables/useScrollAnimate'
import { useSiteContent } from '~/composables/useSiteContent'

const { sectionRef, isVisible } = useScrollAnimate(0.1)

const { content: c } = useSiteContent()
</script>
