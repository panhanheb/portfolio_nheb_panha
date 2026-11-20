<!-- 🔥 Animated Header -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2575fc,100:6a11cb&height=180&section=header&text=Nheb%20Panha&fontSize=44&fontColor=ffffff&desc=Flutter%20%26%20Full-Stack%20Developer&descAlignY=62&descSize=18" width="100%"/>

## 👨‍💻 About Me

Hello! I'm **Nheb Panha**, a Flutter & full-stack developer based in **Phnom Penh, Cambodia (UTC+7)**.
I build cross-platform mobile apps and web platforms end to end, from the database and APIs to a polished interface.

* 📱 Cross-platform mobile apps with **Flutter**
* 🌐 Modern web apps with **Nuxt & Vue**
* 🗄️ Backends and data with **Laravel, Supabase & PostgreSQL**
* 🧮 An accounting background that brings care for data accuracy

✅ Available for freelance and full-time roles.

---

## 🛠️ Tech Stack

![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Dart](https://img.shields.io/badge/Dart-0175C2?style=for-the-badge&logo=dart&logoColor=white)
![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

---

## 🚀 Projects

### 🛒 RED ANT Express (E-Commerce)

* Customer shopping app for the RED ANT Express platform
* Browse products, cart, checkout and order tracking through to delivery
* Built with Flutter & Dart

### 🏪 RED ANT Merchant (Merchant App)

* Seller app for RED ANT Express
* Manage products and incoming orders, and prepare each order for delivery
* Built with Flutter & Dart

### 🛵 RED ANT Driver (Delivery App)

* Driver app for RED ANT Express orders
* Accept delivery jobs, pick up from merchants and update each order through to drop-off
* Built with Flutter & Dart

### 📱 E-Shop Native (E-Commerce)

* Native mobile shopping app for Android and iOS
* Product browsing, cart and checkout
* Built with Kotlin & Swift

---

## 🌐 About This Portfolio Site

This repository is my portfolio website.

* ⚡ **Nuxt 4 + Vue 3 + Tailwind CSS**, clean light/dark design
* 🤖 **AI assistant** chat powered by Google Gemini (with built-in fallback answers)
* 📬 **Contact form** that saves to Supabase and notifies me on Telegram
* ☁️ Deployed on **Cloudflare Workers** (static assets + server API)
* 🔒 All API keys stay on the server, never in the browser

### 📁 Project Structure

```text
app/
  components/        # Header, Hero, About, Timeline, Portfolio, Skills, Blog, Contact, Footer, Chat
  composables/       # useSupabase (projects & articles data), useScrollAnimate
  assets/css/        # design tokens and shared styles
server/api/
  chat.post.ts       # AI chat endpoint (Gemini)
  contact.post.ts    # contact form endpoint (Supabase + Telegram)
public/              # images, logo, robots.txt
supabase_schema.sql  # database tables and policies
wrangler.jsonc       # Cloudflare Workers config
role_flutter.md      # spec for rebuilding this site in Flutter
```

Most content (projects, articles) lives in `app/composables/useSupabase.ts`; experience is in `app/components/WorkTimeline.vue`.

---

## ⚙️ Setup

Requires **Node.js 22 or newer**.

```bash
npm install
cp .env.example .env   # then fill in your keys
npm run dev            # http://localhost:3000
```

### 🔑 Environment Variables

| Variable | Purpose |
| --- | --- |
| `NUXT_GEMINI_API_KEY` | Google Gemini key for the AI chat (optional, falls back to built-in answers) |
| `NUXT_TELEGRAM_BOT_TOKEN` | Telegram bot that sends contact-form notifications |
| `NUXT_TELEGRAM_CHAT_ID` | Telegram chat that receives them |
| `NUXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NUXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public (anon) key |
| `NUXT_SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server only) |

Never commit `.env`. For the database, run `supabase_schema.sql` in the Supabase SQL editor.

### ☁️ Deploy (Cloudflare Workers)

```bash
npm run build          # builds with the cloudflare-module preset
npx wrangler deploy    # deploys the "panha" Worker
```

Cloudflare also builds and deploys automatically on every push to `main` (build command `npm run build`, deploy command `npx wrangler deploy`).
Add the environment variables above under **Worker → Settings → Variables and Secrets**.

---

## 📊 GitHub Stats

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=panhanheb&show_icons=true&theme=tokyonight" />
</p>

---

## 👀 Visitor Counter

<p align="center">
  <img src="https://komarev.com/ghpvc/?username=panhanheb&style=for-the-badge&color=blue" />
</p>

---

## 📫 Contact Me

* 📧 Email: [nhebpanha78@gmail.com](mailto:nhebpanha78@gmail.com)
* 🐙 GitHub: [github.com/panhanheb](https://github.com/panhanheb)
* ✈️ Telegram: [@panhanheb](https://t.me/panhanheb)
* 💼 LinkedIn: https://linkedin.com/in/nhebpanha
* 🌍 Portfolio: https://nheb-panha.vercel.app/

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!

---

<!-- 🔻 Footer -->

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2575fc,100:6a11cb&height=120&section=footer" width="100%"/>
