<template>
  <div class="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none font-body">
    <!-- Chat Window -->
    <Transition name="chat-window">
      <div v-if="isOpen" class="chat-container mb-4 pointer-events-auto">

        <!-- Header -->
        <div class="chat-header glass-divider flex items-center justify-between border-b px-4 py-3">
          
          
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 shrink-0">
              <ChatBotAvatar />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-on-surface">{{ bot.title }}</h3>
              <div class="flex items-center gap-1.5">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span class="text-xs text-on-surface-variant">AI assistant · usually instant</span>
              </div>
            </div>
          </div>

          <button @click="isOpen = false" class="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-white/30 hover:text-on-surface dark:hover:bg-white/10" aria-label="Close chat">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <!-- Quick Suggestions Bar -->
        <div class="glass-divider flex gap-1.5 overflow-x-auto border-b px-3 py-2 custom-scrollbar">
          <button v-for="chip in bot.suggestions" :key="chip.label" :disabled="isTyping" @click="sendQuick(chip)"
                  class="glass-chip whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:border-primary/50 hover:text-on-surface">
            {{ chip }}
          </button>
        </div>

        <!-- Messages Area -->
        <div ref="messageContainer" class="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
          <div v-for="(msg, index) in displayMessages" :key="index" 
               :class="['flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start']">
            <span class="bubble-label">
              {{ msg.role === 'user' ? 'You' : 'Assistant' }}
            </span>
            <div :class="[
              'bubble text-xs leading-relaxed shadow-sm',
              msg.role === 'user' ? 'bubble-user' : 'bubble-bot'
            ]">
              {{ msg.content }}
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="flex flex-col items-start">
            <span class="bubble-label">Assistant</span>
            <div class="bubble bubble-bot flex gap-1.5 shadow-sm">
              <span class="dot-bounce" style="animation-delay: 0s"></span>
              <span class="dot-bounce" style="animation-delay: 0.18s"></span>
              <span class="dot-bounce" style="animation-delay: 0.36s"></span>
            </div>
          </div>
        </div>

        <!-- Input Field -->
        <div class="chat-footer glass-divider border-t p-3">
          <form @submit.prevent="handleSend" class="relative group">
            <input v-model="input" 
                   type="text" 
                   placeholder="Ask about skills, projects or availability" aria-label="Message" 
                   class="chat-input"
                   :disabled="isTyping" />
            <button type="submit" 
                    class="send-button" aria-label="Send message"
                    :disabled="!input.trim() || isTyping">
              <span class="material-symbols-outlined text-xs">send</span>
            </button>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Floating Trigger FAB -->
    <button @click="isOpen = !isOpen" 
            class="pointer-events-auto relative h-16 w-16 rounded-full transition-transform duration-300 hover:scale-105 active:scale-95"
            :aria-label="isOpen ? 'Close chat' : 'Open chat assistant'" :aria-expanded="isOpen">

      <!-- The robot always stays as the button -->
      <span class="absolute inset-0">
        <ChatBotAvatar aria-hidden="true" />
      </span>

      <!-- Small close badge while the chat is open -->
      <span
        aria-hidden="true"
        class="glass-badge absolute -right-0.5 -top-0.5 flex h-6 w-6 items-center justify-center rounded-full text-on-surface transition-all duration-300"
        :class="isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
      >
        <span class="material-symbols-outlined text-[14px]">close</span>
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useSiteContent } from '~/composables/useSiteContent'

const isOpen = ref(false)
const input = ref('')
const isTyping = ref(false)
const messageContainer = ref(null)

// Title, greeting and suggestion buttons are edited in /admin -> Website -> Chatbot.
const { content, load } = useSiteContent()
load()
const bot = computed(() => content.value.chatbot)

// The greeting is always the first bubble, so it updates when content loads.
const messages = ref([])
const displayMessages = computed(() => [{ role: 'assistant', content: bot.value.greeting }, ...messages.value])

const sendQuick = (chip) => {
  if (isTyping.value) return
  input.value = chip.question || chip.label
  handleSend()
}

const handleSend = async () => {
  const prompt = input.value.trim()
  if (!prompt) return

  messages.value.push({ role: 'user', content: prompt })
  input.value = ''
  isTyping.value = true
  scrollToBottom()

  try {
    const history = displayMessages.value.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }))

    const data = await $fetch('/api/chat', {
      method: 'POST',
      body: { prompt, history }
    })

    messages.value.push({ role: 'assistant', content: data.responseText })
  } catch {
    messages.value.push({ role: 'assistant', content: 'Sorry, I couldn’t reply just now. Please try again in a moment.' })
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

watch(isOpen, (newVal) => {
  if (newVal) scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  width: min(360px, calc(100vw - 2rem));
  height: 500px;
  max-height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  color: rgb(var(--text-rgb));
  /* Frosted glass */
  background:
    radial-gradient(120% 80% at 0% 0%, rgb(var(--accent-rgb) / 0.16), transparent 60%),
    radial-gradient(100% 70% at 100% 100%, rgb(var(--accent-rgb) / 0.12), transparent 60%),
    rgb(255 255 255 / 0.55);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  backdrop-filter: blur(22px) saturate(160%);
  border: 1px solid rgb(255 255 255 / 0.6);
  box-shadow:
    0 24px 60px -12px rgb(15 23 42 / 0.35),
    inset 0 1px 0 rgb(255 255 255 / 0.7);
}
.dark .chat-container {
  background:
    radial-gradient(120% 80% at 0% 0%, rgb(var(--accent-rgb) / 0.18), transparent 60%),
    radial-gradient(100% 70% at 100% 100%, rgb(var(--accent-rgb) / 0.12), transparent 60%),
    rgb(24 24 27 / 0.55);
  border-color: rgb(255 255 255 / 0.12);
  box-shadow:
    0 24px 60px -12px rgb(0 0 0 / 0.6),
    inset 0 1px 0 rgb(255 255 255 / 0.08);
}

.glass-divider { border-color: rgb(255 255 255 / 0.45); }
.dark .glass-divider { border-color: rgb(255 255 255 / 0.08); }

.glass-chip {
  border: 1px solid rgb(255 255 255 / 0.6);
  background: rgb(255 255 255 / 0.4);
}
.dark .glass-chip {
  border-color: rgb(255 255 255 / 0.12);
  background: rgb(255 255 255 / 0.05);
}

.glass-badge {
  background: rgb(255 255 255 / 0.7);
  border: 1px solid rgb(255 255 255 / 0.8);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px -2px rgb(15 23 42 / 0.3);
}
.dark .glass-badge {
  background: rgb(39 39 42 / 0.7);
  border-color: rgb(255 255 255 / 0.15);
}

.bubble {
  max-width: 85%;
  padding: 0.6rem 0.85rem;
  border-radius: 14px;
  font-size: 0.85rem;
  line-height: 1.5;
}

.bubble-user {
  background: rgb(var(--accent-rgb));
  color: #fff;
  border-top-right-radius: 4px;
  box-shadow: 0 6px 16px -6px rgb(var(--accent-rgb) / 0.6);
}
.dark .bubble-user {
  color: #09090b;
}

.bubble-bot {
  background: rgb(255 255 255 / 0.6);
  color: rgb(var(--text-rgb));
  border: 1px solid rgb(255 255 255 / 0.7);
  border-top-left-radius: 4px;
}
.dark .bubble-bot {
  background: rgb(255 255 255 / 0.06);
  border-color: rgb(255 255 255 / 0.1);
}

.bubble-label {
  margin: 0 6px 3px;
  font-size: 11px;
  font-weight: 500;
  color: rgb(var(--muted-rgb));
}

.chat-input {
  width: 100%;
  padding: 0.65rem 3rem 0.65rem 0.85rem;
  border: 1px solid rgb(255 255 255 / 0.7);
  border-radius: 12px;
  background: rgb(255 255 255 / 0.55);
  color: rgb(var(--text-rgb));
  font-size: 0.875rem;
  outline: none;
}
.dark .chat-input {
  border-color: rgb(255 255 255 / 0.12);
  background: rgb(255 255 255 / 0.05);
}
.chat-input:focus {
  border-color: rgb(var(--accent-rgb));
  box-shadow: 0 0 0 3px rgb(var(--accent-rgb) / 0.2);
}

.send-button {
  position: absolute;
  right: 0.4rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  background-color: rgb(var(--accent-rgb));
  color: #fff;
}
.dark .send-button { color: #09090b; }
.send-button:disabled { opacity: 0.4; cursor: not-allowed; }

.dot-bounce {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(var(--muted-rgb));
  animation: bounce 0.6s ease-in-out infinite alternate;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-4px); }
}

.chat-window-enter-active,
.chat-window-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.chat-window-enter-from,
.chat-window-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.custom-scrollbar::-webkit-scrollbar { height: 3px; width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgb(var(--muted-rgb) / 0.4); border-radius: 10px; }
</style>
