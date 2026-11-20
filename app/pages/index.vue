<template>
  <HeroSection />
  <About />
  <WorkTimeline />
  <Portfolio />
  <Skills />
  <Blog />
  <ExperienceContact />
</template>

<script setup lang="ts">
import { useSiteContent } from '~/composables/useSiteContent'

// Pull the latest website content from Supabase (defaults show until it arrives).
useSiteContent().load()
</script>
