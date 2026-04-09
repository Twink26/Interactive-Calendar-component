#  Wall Calendar — Interactive React/Next.js Component

A polished, interactive wall calendar built with **Next.js 14 (App Router)** and **TypeScript**. Inspired by physical wall calendars, it features a hero image that changes every month, a dynamic colour palette derived from that image, date range selection, an integrated notes system, and smooth 3D page-flip animations.

---

##  Features

- **Wall calendar aesthetic** — hero image per month with an accent wedge overlay
- **Dynamic theming** — palette extracted from each month's image via canvas colour math; every surface, button, and border adapts automatically
- **Date range selection** — click a start date, Shift+click an end date; range band renders between them with visual start/end caps
- **3D page-flip animation** — month transitions use CSS `rotateX` with a back-face paper texture
- **Integrated notes** — attach memos to any date; persisted in `localStorage`; sidebar shows your last 4 saved notes
- **Holiday markers** — 27 fixed-date holidays (US, India, international) shown as coloured pulsing dots with tooltips
- **Ambient background animation** — three blurred accent-coloured orbs drift slowly behind the layout
- **Fully responsive** — desktop side-by-side layout → tablet horizontal strip → mobile full-bleed edge-to-edge
- **Accessible** — `aria-label` on every day cell, `prefers-reduced-motion` respected, WCAG AA accent text contrast guaranteed

---

##  Project Structure

```
src/
├── app/
│   ├── globals.css          # All styles + responsive breakpoints + animations
│   ├── layout.tsx
│   └── page.tsx
└── components/
    └── wall-calendar/
        ├── WallCalendar.tsx  # Root component, palette extraction, state
        ├── CalendarGrid.tsx  # Grid, flip animation, holiday dots
        ├── NotesPanel.tsx    # Notes textarea + save/status
        ├── constants.ts      # WEEK_DAYS, HOLIDAYS list, HOLIDAY_COLORS map
        ├── date-utils.ts     # stripTime, isSameDay, monthMatrix, getHolidayInfo
        └── types.ts          # DayCell, Holiday types
```

---

##  Running Locally

**Prerequisites:** Node.js 18+ and npm/yarn/pnpm.

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# 2. Install dependencies
npm install
# or
yarn install
# or
pnpm install

# 3. Start the development server
npm run dev
# or
yarn dev
# or
pnpm dev

# 4. Open in your browser
# http://localhost:3000
```





## 🧰 Tech Stack

| Tool | Purpose |
|---|---|
| Next.js 14 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Utility base (`@import "tailwindcss"`) |
| CSS Custom Properties | Dynamic palette theming |
| Canvas API | Hero image colour extraction |
| localStorage | Note persistence |
| Unsplash | Monthly hero images (via URL params, no API key needed) |

---

##  Design Decisions

**No backend, no API keys.** All data (notes) is stored in `localStorage`. Hero images are loaded directly from Unsplash's public CDN with `?w=1200&q=80` parameters — no account or API key required.

**Palette from image.** The canvas colour extraction draws each hero image into a 20×20 pixel grid, averages the RGB values, converts to HSL, then derives 10 role-specific colours (bg, card, sidebar, accent, border, muted, input-bg, etc.) from that single hue anchor. Dark images produce dark surfaces; light images produce light ones.

**3D flip without a library.** The page-flip animation uses only CSS `rotateX` with `perspective`, `transform-style: preserve-3d`, and `backface-visibility: hidden`. No animation library dependency.

**Holiday colour system.** Each of the 27 holidays has a named colour (`gold`, `pink`, `green`, etc.) resolved through a `HOLIDAY_COLORS` map to actual hex values, so dots are meaningfully distinct rather than all using the accent colour.

---

## Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| `> 900px` | Desktop: sidebar (240px) + calendar card side by side |
| `≤ 900px` | Tablet: sidebar becomes horizontal strip above the card |
| `≤ 600px` | Mobile: full-bleed edge-to-edge, sidebar collapses to date badge |
| `≤ 380px` | Small phones: hero/font/cell sizes further reduced |

---

