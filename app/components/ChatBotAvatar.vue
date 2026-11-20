<template>
  <svg
    viewBox="0 0 120 120"
    role="img"
    aria-label="Chat assistant robot"
    shape-rendering="geometricPrecision"
    class="bot"
    :class="{ 'bot-animated': animated }"
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
    </defs>

    <!-- Ground shadow -->
    <ellipse class="shadow" cx="60" cy="112" rx="24" ry="4.5" :fill="`url(#${uid}-shadow)`" />

    <g class="body-float">
      <!-- Arms (behind the body) -->
      <g class="arm arm-left">
        <circle cx="42" cy="82" r="4" :fill="`url(#${uid}-orange)`" />
        <ellipse cx="35" cy="89" rx="6.5" ry="8.5" transform="rotate(35 35 89)" :fill="`url(#${uid}-shell)`" stroke="#aeb5be" stroke-width="0.5" />
        <circle cx="31" cy="95.5" r="2.4" fill="#5b5f66" />
      </g>
      <g class="arm arm-right">
        <circle cx="78" cy="82" r="4" :fill="`url(#${uid}-orange)`" />
        <ellipse cx="85" cy="89" rx="6.5" ry="8.5" transform="rotate(-35 85 89)" :fill="`url(#${uid}-shell)`" stroke="#aeb5be" stroke-width="0.5" />
        <circle cx="89" cy="95.5" r="2.4" fill="#5b5f66" />
      </g>

      <!-- Body -->
      <ellipse cx="60" cy="89" rx="19" ry="17" :fill="`url(#${uid}-shell)`" stroke="#aeb5be" stroke-width="0.5" />
      <path d="M45 85c3-6 9-9 15-9" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.9" fill="none" />
      <rect x="64" y="80" width="7" height="5" rx="2" fill="none" stroke="#c2c8cf" stroke-width="0.7" />
      <!-- Belly lens -->
      <circle cx="64" cy="96" r="6.2" fill="#f4f5f7" :stroke="`url(#${uid}-orange)`" stroke-width="2.4" />
      <circle class="lens" cx="64" cy="96" r="2.6" fill="#2b3440" />
      <circle cx="63.2" cy="95.2" r="0.8" fill="#9fb4c8" />

      <!-- Head -->
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

        <!-- Ear disc -->
        <ellipse cx="25" cy="46" rx="7.5" ry="11" transform="rotate(-6 25 46)" fill="#f2f4f7" :stroke="`url(#${uid}-orange)`" stroke-width="2.2" />
        <ellipse class="ear-core" cx="25.5" cy="46" rx="4.6" ry="7.2" transform="rotate(-6 25.5 46)" :fill="`url(#${uid}-ear)`" />
        <ellipse cx="25.5" cy="46" rx="2.6" ry="4.4" transform="rotate(-6 25.5 46)" fill="none" stroke="#ffcf8f" stroke-width="0.5" opacity="0.8" />

        <!-- Visor -->
        <path :d="visorPath" :fill="`url(#${uid}-visor)`" :stroke="`url(#${uid}-orange)`" stroke-width="2.4" />
        <g :clip-path="`url(#${uid}-visor-clip)`">
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
          <!-- Glass reflection -->
          <path d="M50 30c10-6 26-7 38-3-14 1-27 4-36 10z" :fill="`url(#${uid}-gloss)`" />
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ animated?: boolean }>(), { animated: true })

// Unique ids so several avatars on one page don't share gradients/clip paths.
const uid = `bot-${Math.random().toString(36).slice(2, 8)}`

// Big rounded visor on the front of the head.
const visorPath = 'M47 34c3-7 14-11 28-10 13 1 22 7 22 17 0 11-8 19-23 20-14 1-26-4-28-12-1-5-1-10 1-15z'
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
.bot-animated .arm {
  transform-box: fill-box;
  animation: flap 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
.bot-animated .arm-left { transform-origin: 85% 15%; }
.bot-animated .arm-right {
  transform-origin: 15% 15%;
  animation-name: flap-right;
}
.bot-animated .ear-core,
.bot-animated .lens {
  animation: pulse 2.4s ease-in-out infinite;
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
@keyframes flap {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(10deg); }
}
@keyframes flap-right {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-10deg); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
