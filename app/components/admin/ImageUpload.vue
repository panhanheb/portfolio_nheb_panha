<template>
  <div>
    <!-- Preview -->
    <div v-if="modelValue" class="group relative overflow-hidden rounded-xl border border-line bg-surface" :class="aspectClass">
      <img :src="modelValue" alt="" class="h-full w-full object-cover" @error="broken = true" @load="broken = false" />
      <div v-if="broken" class="absolute inset-0 flex items-center justify-center bg-surface text-sm text-on-surface-variant">
        <span class="material-symbols-outlined mr-1 text-[18px]">broken_image</span>Image can't be loaded
      </div>
      <div class="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <button type="button" class="img-btn" :disabled="uploading" @click="pick">
          <span class="material-symbols-outlined text-[16px]">sync</span>Replace
        </button>
        <button type="button" class="img-btn hover:!bg-rose-600" @click="$emit('update:modelValue', '')">
          <span class="material-symbols-outlined text-[16px]">delete</span>Remove
        </button>
      </div>
      <div v-if="uploading" class="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white">
        <Icon name="mdi:loading" class="mr-2 animate-spin text-lg" />Uploading…
      </div>
    </div>

    <!-- Drop zone -->
    <button
      v-else
      type="button"
      class="flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors"
      :class="dragging ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/50 hover:bg-surface'"
      :disabled="uploading"
      @click="pick"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <template v-if="uploading">
        <Icon name="mdi:loading" class="animate-spin text-2xl text-primary" />
        <span class="text-sm font-medium">Uploading…</span>
      </template>
      <template v-else>
        <span class="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span class="material-symbols-outlined text-[24px]">add_photo_alternate</span>
        </span>
        <span class="mt-1 text-sm font-medium text-on-surface">Click to upload <span class="font-normal text-on-surface-variant">or drag and drop</span></span>
        <span class="text-xs text-on-surface-variant">PNG, JPG, WebP, GIF or AVIF · up to 5 MB</span>
      </template>
    </button>

    <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" class="hidden" @change="onFile" />

    <!-- Or paste a URL -->
    <div v-if="allowUrl" class="mt-2 flex items-center gap-2">
      <span class="text-xs text-on-surface-variant">or link:</span>
      <input
        :value="modelValue"
        class="input !py-1.5 !text-xs"
        placeholder="https://… or /image/…"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).value.trim())"
      />
    </div>

    <p v-if="error" class="mt-2 text-sm text-rose-600 dark:text-rose-400">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdmin } from '~/composables/useAdmin'

const props = withDefaults(defineProps<{
  modelValue: string
  /** Storage folder, e.g. "blog" */
  folder?: string
  aspect?: 'video' | 'square' | 'wide'
  allowUrl?: boolean
}>(), { folder: 'uploads', aspect: 'video', allowUrl: true })

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const { uploadImage } = useAdmin()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const dragging = ref(false)
const broken = ref(false)
const error = ref('')

const aspectClass = computed(() => ({ video: 'aspect-video', square: 'aspect-square max-w-[12rem]', wide: 'aspect-[21/9]' })[props.aspect])

const pick = () => fileInput.value?.click()

const upload = async (file?: File | null) => {
  if (!file) return
  error.value = ''
  uploading.value = true
  try {
    emit('update:modelValue', await uploadImage(file, props.folder))
  } catch (e: any) {
    error.value = e.message
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const onFile = (e: Event) => upload((e.target as HTMLInputElement).files?.[0])
const onDrop = (e: DragEvent) => {
  dragging.value = false
  upload(e.dataTransfer?.files?.[0])
}
</script>

<style scoped>
.img-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 0.5rem;
  background: rgb(0 0 0 / 0.55);
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
  backdrop-filter: blur(6px);
  transition: background-color 0.15s;
}
.img-btn:hover {
  background: rgb(0 0 0 / 0.75);
}
</style>
