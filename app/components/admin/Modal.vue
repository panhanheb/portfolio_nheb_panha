<template>
  <Teleport to="body">
    <Transition name="admin-modal">
      <div v-if="open" class="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          class="card relative z-10 my-8 w-full max-w-2xl p-6 shadow-2xl sm:p-7"
        >
          <div class="mb-6 flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold text-on-surface">{{ title }}</h2>
            <button
              class="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface hover:text-on-surface"
              aria-label="Close"
              @click="$emit('close')"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}
watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (isOpen) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
  }
)
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.admin-modal-enter-active,
.admin-modal-leave-active {
  transition: opacity 0.2s ease;
}
.admin-modal-enter-from,
.admin-modal-leave-to {
  opacity: 0;
}
</style>
