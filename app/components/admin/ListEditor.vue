<template>
  <div>
    <ol v-if="modelValue.length" class="space-y-2">
      <li
        v-for="(item, i) in modelValue"
        :key="i"
        class="flex items-start gap-2 rounded-xl border border-line bg-surface/60 p-2"
      >
        <!-- Reorder -->
        <div class="flex shrink-0 flex-col">
          <button type="button" class="reorder-btn" :disabled="i === 0" aria-label="Move up" @click="move(i, -1)">
            <span class="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
          </button>
          <button type="button" class="reorder-btn" :disabled="i === modelValue.length - 1" aria-label="Move down" @click="move(i, 1)">
            <span class="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
          </button>
        </div>

        <!-- Plain list of strings -->
        <div v-if="!fields" class="flex-1">
          <textarea
            v-if="multiline"
            :value="(item as string)"
            rows="2"
            class="input"
            :placeholder="placeholder"
            @input="setString(i, ($event.target as HTMLTextAreaElement).value)"
          ></textarea>
          <input
            v-else
            :value="(item as string)"
            class="input"
            :placeholder="placeholder"
            @input="setString(i, ($event.target as HTMLInputElement).value)"
          />
        </div>

        <!-- List of objects -->
        <div v-else class="grid flex-1 gap-2" :class="gridClass">
          <div v-for="f in fields" :key="f.key" :class="f.type === 'textarea' ? 'sm:col-span-full' : ''">
            <label class="sr-only">{{ f.label }}</label>
            <textarea
              v-if="f.type === 'textarea'"
              v-model="(item as any)[f.key]"
              rows="2"
              class="input"
              :placeholder="f.label"
            ></textarea>
            <div v-else class="relative">
              <input
                v-model="(item as any)[f.key]"
                class="input"
                :class="{ '!pr-10': f.type === 'icon' || f.type === 'symbol' }"
                :placeholder="f.placeholder || f.label"
                :title="f.label"
              />
              <span
                v-if="f.type === 'icon' && (item as any)[f.key]"
                class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Icon :name="(item as any)[f.key]" class="text-lg" />
              </span>
              <span
                v-if="f.type === 'symbol' && (item as any)[f.key]"
                class="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-primary"
              >{{ (item as any)[f.key] }}</span>
            </div>
          </div>
        </div>

        <button type="button" class="reorder-btn mt-1.5 hover:!text-rose-600" aria-label="Remove" @click="removeAt(i)">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </li>
    </ol>
    <p v-else class="rounded-xl border border-dashed border-line px-4 py-3 text-sm text-on-surface-variant">Nothing here yet.</p>

    <button type="button" class="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline" @click="add">
      <span class="material-symbols-outlined text-[18px]">add</span>{{ addLabel }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ListField {
  key: string
  label: string
  placeholder?: string
  /** text (default), textarea, icon (Iconify name, previewed) or symbol (Material Symbols name, previewed) */
  type?: 'text' | 'textarea' | 'icon' | 'symbol'
}

const props = withDefaults(defineProps<{
  modelValue: any[]
  /** Omit for a plain list of strings. */
  fields?: ListField[]
  addLabel?: string
  placeholder?: string
  multiline?: boolean
}>(), { addLabel: 'Add item', placeholder: '', multiline: false })

const gridClass = computed(() => {
  const inline = (props.fields ?? []).filter(f => f.type !== 'textarea').length
  return inline >= 3 ? 'sm:grid-cols-3' : inline === 2 ? 'sm:grid-cols-2' : ''
})

const list = () => props.modelValue

const setString = (i: number, v: string) => { list()[i] = v }

const add = () => {
  if (!props.fields) list().push('')
  else list().push(Object.fromEntries(props.fields.map(f => [f.key, ''])))
}

const removeAt = (i: number) => { list().splice(i, 1) }

const move = (i: number, dir: -1 | 1) => {
  const j = i + dir
  if (j < 0 || j >= list().length) return
  const [item] = list().splice(i, 1)
  list().splice(j, 0, item)
}
</script>

<style scoped>
.reorder-btn {
  display: flex;
  height: 1.6rem;
  width: 1.6rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  color: rgb(var(--muted-rgb));
  transition: background-color 0.15s, color 0.15s;
}
.reorder-btn:hover:not(:disabled) {
  background: rgb(var(--border-rgb) / 0.6);
  color: rgb(var(--text-rgb));
}
.reorder-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
