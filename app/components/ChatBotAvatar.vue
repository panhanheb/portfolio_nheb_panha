<template>
  <svg
    ref="svgRef"
    viewBox="0 0 120 120"
    role="img"
    aria-label="Chat assistant robot"
    shape-rendering="geometricPrecision"
    class="bot"
    :class="{ 'bot-animated': animated, 'is-tracking': isTracking }"
  >
    <defs>
      <!-- Glossy white shell, lit from the top-left -->
      <radialGradient :id="`${uid}-shell`" cx="0.32" cy="0.22" r="0.9">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset="0.5" stop-color="#f1f3f6" />
        <stop offset="0.85" stop-color="#d3d8de" />
        <stop offset="1" stop-color="#b9c0c8" />
      </radialGradient>
      <!-- Black glass visor with a cool blue floor reflection -->
      <linearGradient :id="`${uid}-visor`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0b0c0e" />
        <stop offset="0.62" stop-color="#121417" />
        <stop offset="0.8" stop-color="#2c3f52" />
        <stop offset="1" stop-color="#3f5a72" />
      </linearGradient>
      <linearGradient :id="`${uid}-gloss`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0.35" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
      <!-- Orange metal trim -->
      <linearGradient :id="`${uid}-orange`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f7a24b" />
        <stop offset="1" stop-color="#c8641d" />
      </linearGradient>
      <!-- Glowing eye -->
      <radialGradient :id="`${uid}-eye`" cx="0.5" cy="0.62" r="0.55">
        <stop offset="0" stop-color="#ffe2a8" />
        <stop offset="0.35" stop-color="#ffab4a" />
        <stop offset="0.8" stop-color="#d9711f" />
        <stop offset="1" stop-color="#7a3a0e" />
      </radialGradient>
      <radialGradient :id="`${uid}-eyeglow`">
        <stop offset="0" stop-color="#ff9a3c" stop-opacity="0.55" />
        <stop offset="1" stop-color="#ff9a3c" stop-opacity="0" />
      </radialGradient>
      <radialGradient :id="`${uid}-ear`" cx="0.45" cy="0.45" r="0.6">
        <stop offset="0" stop-color="#ffd08a" />
        <stop offset="0.6" stop-color="#e8862f" />
        <stop offset="1" stop-color="#a24d12" />
      </radialGradient>
      <radialGradient :id="`${uid}-shadow`">
        <stop offset="0" stop-color="#0f172a" stop-opacity="0.38" />
        <stop offset="1" stop-color="#0f172a" stop-opacity="0" />
      </radialGradient>
      <clipPath :id="`${uid}-visor-clip`">
        <path :d="visorPath" />
      </clipPath>
      <!-- Face wraps around the round head when it turns -->
      <clipPath :id="`${uid}-shell-clip`">
        <ellipse cx="60" cy="44" rx="40" ry="31" transform="rotate(-6 60 44)" />
      </clipPath>
    </defs>

    <!-- Ground shadow -->
    <ellipse class="shadow" cx="60" cy="112" rx="24" ry="4.5" :fill="`url(#${uid}-shadow)`" />

    <g class="body-float">
      <!-- Arms (behind the body) -->
      <g class="arm arm-left">
        <!-- Gripper hand -->
        <g class="hand hand-left">
          <g class="finger finger-a"><rect x="27.4" y="96" width="1.8" height="4" rx="0.9" fill="#4a4f57" transform="rotate(25 28.3 96)" /></g>
          <rect class="finger finger-b" x="30.1" y="96.8" width="1.8" height="4.2" rx="0.9" fill="#4a4f57" />
          <g class="finger finger-c"><rect x="32.8" y="96" width="1.8" height="4" rx="0.9" fill="#4a4f57" transform="rotate(-25 33.7 96)" /></g>
          <circle cx="31" cy="95.5" r="2.6" fill="#5b5f66" stroke="#3b3f45" stroke-width="0.4" />
        </g>
        <ellipse cx="35" cy="89" rx="6.5" ry="8.5" transform="rotate(35 35 89)" :fill="`url(#${uid}-shell)`" stroke="#aeb5be" stroke-width="0.5" />
        <circle cx="42" cy="82" r="4" :fill="`url(#${uid}-orange)`" />
      </g>
      <g class="arm arm-right">
        <!-- Gripper hand -->
        <g class="hand hand-right">
          <g class="finger finger-a"><rect x="85.4" y="96" width="1.8" height="4" rx="0.9" fill="#4a4f57" transform="rotate(25 86.3 96)" /></g>
          <rect class="finger finger-b" x="88.1" y="96.8" width="1.8" height="4.2" rx="0.9" fill="#4a4f57" />
          <g class="finger finger-c"><rect x="90.8" y="96" width="1.8" height="4" rx="0.9" fill="#4a4f57" transform="rotate(-25 91.7 96)" /></g>
          <circle cx="89" cy="95.5" r="2.6" fill="#5b5f66" stroke="#3b3f45" stroke-width="0.4" />
        </g>
        <ellipse cx="85" cy="89" rx="6.5" ry="8.5" transform="rotate(-35 85 89)" :fill="`url(#${uid}-shell)`" stroke="#aeb5be" stroke-width="0.5" />
        <circle cx="78" cy="82" r="4" :fill="`url(#${uid}-orange)`" />
      </g>

      <!-- Body -->
      <ellipse cx="60" cy="89" rx="19" ry="17" :fill="`url(#${uid}-shell)`" stroke="#aeb5be" stroke-width="0.5" />
      <path d="M45 85c3-6 9-9 15-9" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.9" fill="none" />
      <rect x="64" y="80" width="7" height="5" rx="2" fill="none" stroke="#c2c8cf" stroke-width="0.7" />
      <!-- Belly lens -->
      <circle cx="64" cy="96" r="6.2" fill="#f4f5f7" :stroke="`url(#${uid}-orange)`" stroke-width="2.4" />
      <circle class="lens" cx="64" cy="96" r="2.6" fill="#2b3440" />
      <circle cx="63.2" cy="95.2" r="0.8" fill="#9fb4c8" />

      <!-- Head (outer group follows the cursor, inner group plays the idle animation) -->
      <g :style="headStyle">
      <g class="head">
        <!-- Antennae -->
        <g class="antenna">
          <path d="M31 30C27 22 22 14 22 6" stroke="#cfd5dc" stroke-width="1" fill="none" stroke-linecap="round" />
          <path d="M33 29C30 21 27 13 27.5 4" stroke="#cfd5dc" stroke-width="1" fill="none" stroke-linecap="round" />
          <rect x="20.8" y="3" width="2.4" height="4.5" rx="1.2" fill="#f5f7fa" stroke="#b7bec6" stroke-width="0.4" />
          <rect x="26.3" y="1.2" width="2.4" height="4.5" rx="1.2" fill="#f5f7fa" stroke="#b7bec6" stroke-width="0.4" />
        </g>

        <!-- Shell -->
        <ellipse cx="60" cy="44" rx="40" ry="31" transform="rotate(-6 60 44)" :fill="`url(#${uid}-shell)`" stroke="#aeb5be" stroke-width="0.5" />
        <path d="M36 25c7-7 17-11 28-11" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity="0.95" fill="none" />
        <path d="M44 22l6-2M46 25l6-2" stroke="#c4cad1" stroke-width="0.8" stroke-linecap="round" />

        <!-- Ear disc (left side) - swings round as the head turns -->
        <g :style="earStyle">
        <g class="ear-turn">
          <ellipse cx="25" cy="46" rx="7.5" ry="11" transform="rotate(-6 25 46)" fill="#f2f4f7" :stroke="`url(#${uid}-orange)`" stroke-width="2.2" />
          <ellipse class="ear-core" cx="25.5" cy="46" rx="4.6" ry="7.2" transform="rotate(-6 25.5 46)" :fill="`url(#${uid}-ear)`" />
          <ellipse cx="25.5" cy="46" rx="2.6" ry="4.4" transform="rotate(-6 25.5 46)" fill="none" stroke="#ffcf8f" stroke-width="0.5" opacity="0.8" />
        </g>
        </g>

        <!-- Far ear (right side) - only shows when the head turns left -->
        <g :style="farEarStyle">
        <g class="far-ear-turn">
          <ellipse cx="97" cy="42" rx="3.5" ry="10" transform="rotate(-6 97 42)" fill="#eef0f3" :stroke="`url(#${uid}-orange)`" stroke-width="1.8" />
          <ellipse cx="97.3" cy="42" rx="2" ry="6.5" transform="rotate(-6 97.3 42)" :fill="`url(#${uid}-ear)`" />
        </g>
        </g>

        <!-- Face: slides across the head and narrows when turning (3D yaw) -->
        <g :clip-path="`url(#${uid}-shell-clip)`">
        <g :style="faceStyle">
        <g class="face">
        <!-- Visor -->
        <path :d="visorPath" :fill="`url(#${uid}-visor)`" :stroke="`url(#${uid}-orange)`" stroke-width="2.4" />
        <g :clip-path="`url(#${uid}-visor-clip)`">
          <g :style="eyeStyle">
          <g class="eyes">
            <circle cx="63" cy="44" r="10" :fill="`url(#${uid}-eyeglow)`" />
            <circle cx="83" cy="43" r="8.5" :fill="`url(#${uid}-eyeglow)`" />
            <g class="eye">
              <circle cx="63" cy="44" r="6.2" :fill="`url(#${uid}-eye)`" />
              <circle cx="63" cy="44" r="4.3" fill="none" stroke="#ffd59a" stroke-width="0.4" opacity="0.7" />
              <circle cx="63" cy="44" r="2.6" fill="none" stroke="#ffd59a" stroke-width="0.35" opacity="0.6" />
            </g>
            <g class="eye">
              <circle cx="83" cy="43" r="5.2" :fill="`url(#${uid}-eye)`" />
              <circle cx="83" cy="43" r="3.5" fill="none" stroke="#ffd59a" stroke-width="0.4" opacity="0.7" />
            </g>
          </g>
          </g>
          <!-- Glass reflection -->
          <path d="M50 30c10-6 26-7 38-3-14 1-27 4-36 10z" :fill="`url(#${uid}-gloss)`" />
        </g>
        </g>
        </g>
        </g>
      </g>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<{ animated?: boolean }>(), { animated: true })

// Unique ids so several avatars on one page don't share gradients/clip paths.
const uid = `bot-${Math.random().toString(36).slice(2, 8)}`

// Big rounded visor on the front of the head.
const visorPath = 'M47 34c3-7 14-11 28-10 13 1 22 7 22 17 0 11-8 19-23 20-14 1-26-4-28-12-1-5-1-10 1-15z'

/* ---------------------------------------------------------------------------
 * Look at the cursor: the head turns and the eyes follow the mouse.
 * After a few seconds without movement it eases back to the idle animation.
 * ------------------------------------------------------------------------- */
const svgRef = ref<SVGSVGElement | null>(null)
const isTracking = ref(false)
const look = ref({ x: 0, y: 0 }) // eased position, -1..1 on each axis

const target = { x: 0, y: 0 }
let frame = 0

const clamp = (v: number) => Math.max(-1, Math.min(1, v))

// Strong enough to read clearly even at button size (~64px).
const headStyle = computed(() => ({
  transform: `translate(${(look.value.x * 5).toFixed(2)}px, ${(look.value.y * 4.5).toFixed(2)}px) rotate(${(look.value.x * 5).toFixed(2)}deg)`,
  transformBox: 'fill-box',
  transformOrigin: '50% 95%'
}))
// Eyes slide across the visor and squash slightly when looking to the side (3D feel).
const eyeStyle = computed(() => ({
  transform: `translate(${(look.value.x * 4).toFixed(2)}px, ${(look.value.y * 5.5).toFixed(2)}px) scaleX(${(1 - Math.abs(look.value.x) * 0.12).toFixed(3)})`,
  transformBox: 'fill-box',
  transformOrigin: 'center'
}))

/* Head turn (yaw): the face slides around the round shell and narrows, the side ear
 * swings toward/away from the viewer and the far ear peeks out when turning left.
 * The visor already sits right of centre, so it travels further to the left. */
const faceStyle = computed(() => {
  const yaw = look.value.x
  const tx = yaw < 0 ? yaw * 12 : yaw * 5
  return {
    transform: `translateX(${tx.toFixed(2)}px) scaleX(${(1 - Math.abs(yaw) * 0.1).toFixed(3)})`,
    transformBox: 'fill-box',
    transformOrigin: 'center'
  }
})
const earStyle = computed(() => {
  const yaw = look.value.x
  const tx = yaw < 0 ? yaw * 5 : yaw * 4
  const sx = yaw < 0 ? 1 + yaw * 0.55 : 1 + yaw * 0.15
  return {
    transform: `translateX(${tx.toFixed(2)}px) scaleX(${sx.toFixed(3)})`,
    transformBox: 'fill-box',
    transformOrigin: 'center',
    opacity: yaw < 0 ? (1 + yaw * 0.35).toFixed(3) : 1
  }
})
const farEarStyle = computed(() => {
  const left = Math.max(0, -look.value.x)
  return {
    transform: `translateX(${(-left * 3).toFixed(2)}px) scaleX(${(0.5 + left * 0.6).toFixed(3)})`,
    transformBox: 'fill-box',
    transformOrigin: 'center',
    // While idle, the inner group's keyframes control visibility instead.
    opacity: isTracking.value ? Math.min(1, left * 1.6).toFixed(3) : 1
  }
})

// Ease the current position toward the target every frame for buttery motion.
const step = () => {
  const cur = look.value
  const nx = cur.x + (target.x - cur.x) * 0.15
  const ny = cur.y + (target.y - cur.y) * 0.15
  look.value = { x: nx, y: ny }
  if (Math.abs(target.x - nx) > 0.002 || Math.abs(target.y - ny) > 0.002) {
    frame = requestAnimationFrame(step)
  } else {
    frame = 0
    if (!target.x && !target.y) isTracking.value = false
  }
}
const kick = () => {
  if (!frame) frame = requestAnimationFrame(step)
}

const onPointerMove = (e: PointerEvent) => {
  const el = svgRef.value
  if (!el) return
  const r = el.getBoundingClientRect()
  // Direction from the robot's face to the cursor. Using the angle (not raw distance)
  // keeps the gaze responsive even when the cursor is far across the page.
  const dx = e.clientX - (r.left + r.width / 2)
  const dy = e.clientY - (r.top + r.height * 0.4)
  const dist = Math.hypot(dx, dy) || 1
  const strength = Math.min(1, dist / 160) // close to the robot = gentler
  target.x = clamp((dx / dist) * strength)
  target.y = clamp((dy / dist) * strength)
  isTracking.value = true
  kick()
}

// Cursor left the browser window: ease back to centre and resume the idle animation.
const onPointerLeave = (e: MouseEvent) => {
  if (e.relatedTarget) return
  target.x = 0
  target.y = 0
  kick()
}

onMounted(() => {
  if (!props.animated) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('mouseout', onPointerLeave)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('mouseout', onPointerLeave)
  cancelAnimationFrame(frame)
})
</script>

<style scoped>
.bot {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Smooth, sub-pixel motion with gentle easing. */
.bot-animated .body-float {
  animation: float 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
.bot-animated .shadow {
  transform-box: fill-box;
  transform-origin: center;
  animation: shadow 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
.bot-animated .head {
  transform-box: fill-box;
  transform-origin: 50% 95%;
  animation: head-move 8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
.bot-animated .eyes {
  animation: look 8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
.bot-animated .eye {
  transform-box: fill-box;
  transform-origin: center;
  animation: blink 4.6s ease-in-out infinite;
}
.bot-animated .antenna {
  transform-box: fill-box;
  transform-origin: 85% 100%;
  animation: sway 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
/* Arms pivot at the orange shoulder joints. */
.bot-animated .arm {
  transform-box: view-box;
}
.bot-animated .arm-left {
  transform-origin: 42px 82px;
  animation: swing-left 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
/* Right arm: idle swing, then a friendly "hello" wave every cycle. */
.bot-animated .arm-right {
  transform-origin: 78px 82px;
  animation: wave-hello 7s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

/* Hands: wrist wiggle + fingers opening and closing. */
.bot-animated .hand {
  transform-box: fill-box;
  transform-origin: 50% 25%;
  animation: wrist 1.7s ease-in-out infinite;
}
.bot-animated .hand-right {
  animation: wrist-wave 7s ease-in-out infinite;
}
.bot-animated .finger {
  transform-box: fill-box;
  transform-origin: 50% 0%;
}
.bot-animated .finger-a { animation: grip-a 2.2s ease-in-out infinite; }
.bot-animated .finger-c { animation: grip-c 2.2s ease-in-out infinite; }
.bot-animated .finger-b { animation: grip-b 2.2s ease-in-out infinite; }
.bot-animated .hand-right .finger { animation-delay: 0.4s; }
.bot-animated .ear-core,
.bot-animated .lens {
  animation: pulse 2.4s ease-in-out infinite;
}

/* Idle head turn, in sync with the 8s head-move cycle (left at ~37%, right at ~79%). */
.far-ear-turn { opacity: 0; }
.bot-animated .face,
.bot-animated .ear-turn,
.bot-animated .far-ear-turn {
  transform-box: fill-box;
  transform-origin: center;
}
.bot-animated .face { animation: face-turn 8s cubic-bezier(0.45, 0, 0.55, 1) infinite; }
.bot-animated .ear-turn { animation: ear-turn 8s cubic-bezier(0.45, 0, 0.55, 1) infinite; }
.bot-animated .far-ear-turn { animation: far-ear-turn 8s cubic-bezier(0.45, 0, 0.55, 1) infinite; }

/* While following the cursor, the idle look-around steps aside. */
.bot-animated.is-tracking .head,
.bot-animated.is-tracking .eyes,
.bot-animated.is-tracking .face,
.bot-animated.is-tracking .ear-turn {
  animation: none;
}
.bot-animated.is-tracking .far-ear-turn {
  animation: none;
  opacity: 1;
}

@keyframes face-turn {
  0%, 20%, 54%, 62%, 100% { transform: translateX(0) scaleX(1); }
  32%, 42% { transform: translateX(-10px) scaleX(0.91); }
  74%, 84% { transform: translateX(4px) scaleX(0.93); }
}
@keyframes ear-turn {
  0%, 20%, 54%, 62%, 100% { transform: translateX(0) scaleX(1); opacity: 1; }
  32%, 42% { transform: translateX(-4px) scaleX(0.5); opacity: 0.7; }
  74%, 84% { transform: translateX(3px) scaleX(1.14); opacity: 1; }
}
@keyframes far-ear-turn {
  0%, 20%, 54%, 100% { transform: translateX(0) scaleX(0.5); opacity: 0; }
  32%, 42% { transform: translateX(-3px) scaleX(1.05); opacity: 1; }
}

@keyframes float {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -5px, 0); }
}
@keyframes shadow {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.78); opacity: 0.55; }
}
@keyframes head-move {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
  /* up */
  12%, 20% { transform: translate3d(0, -3px, 0) rotate(0deg); }
  /* left */
  32%, 42% { transform: translate3d(-3.5px, 0, 0) rotate(-4deg); }
  /* down */
  54%, 62% { transform: translate3d(0, 2px, 0) rotate(0deg); }
  /* right */
  74%, 84% { transform: translate3d(3.5px, 0, 0) rotate(4deg); }
}
@keyframes look {
  0%, 100% { transform: translate3d(0, 0, 0); }
  12%, 20% { transform: translate3d(0, -2px, 0); }
  32%, 42% { transform: translate3d(-3px, 0, 0); }
  54%, 62% { transform: translate3d(0, 2px, 0); }
  74%, 84% { transform: translate3d(3px, 0, 0); }
}
@keyframes blink {
  0%, 44%, 50%, 100% { transform: scaleY(1); }
  47% { transform: scaleY(0.1); }
}
@keyframes sway {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-8deg); }
}
@keyframes swing-left {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(12deg); }
}
@keyframes wave-hello {
  /* idle swing */
  0%, 100% { transform: rotate(0deg); }
  12% { transform: rotate(-10deg); }
  24% { transform: rotate(0deg); }
  36% { transform: rotate(-10deg); }
  48% { transform: rotate(0deg); }
  /* raise and wave */
  58% { transform: rotate(-80deg); }
  64% { transform: rotate(-62deg); }
  70% { transform: rotate(-88deg); }
  76% { transform: rotate(-62deg); }
  82% { transform: rotate(-85deg); }
  /* lower */
  92% { transform: rotate(-4deg); }
}
@keyframes wrist {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-12deg); }
}
@keyframes wrist-wave {
  0%, 52%, 92%, 100% { transform: rotate(0deg); }
  61% { transform: rotate(-22deg); }
  67% { transform: rotate(18deg); }
  73% { transform: rotate(-22deg); }
  79% { transform: rotate(18deg); }
  85% { transform: rotate(-10deg); }
}
@keyframes grip-a {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(18deg); }
}
@keyframes grip-c {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-18deg); }
}
@keyframes grip-b {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.8); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
