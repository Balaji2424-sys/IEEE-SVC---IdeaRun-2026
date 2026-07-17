# IdeaRun 2026 — IEEE Smart Village South Asia Website

A static, production-ready website for IdeaRun 2026, IEEE Smart Village –
South Asia Regional Committee's call for student project ideas.

## Stack
- HTML5 + Vanilla CSS + Vanilla JS
- Tailwind CSS (via CDN, configured inline in `index.html`)
- Google Fonts: Fraunces (display), Inter (body), IBM Plex Mono (data/dates)

No build step, no dependencies to install — open `index.html` in a browser,
or serve the folder with any static file server.

```bash
# quick local preview
python3 -m http.server 8080
# then open http://localhost:8080
```

## Folder structure

```
idearun2026/
├── index.html              # entire single-page site (all 11 sections)
├── css/
│   └── style.css           # design tokens, light/dark themes, animations
├── js/
│   └── main.js              # theme toggle, scroll reveal, timeline progress,
│                             # resource preview modal, mobile nav, back-to-top
└── assets/
    ├── poster/              # event poster (idearun-horizontal.svg placeholder)
    ├── logos/                # IEEE, IEEE Smart Village, IEEE SB, Sairam logos
    ├── templates/            # Proposal .docx, PPT .pptx, Reference PDF placeholders
    ├── team/                 # Patron / SCOPE / Magic Member avatar placeholders
    └── projects/             # Ongoing student project thumbnails
```

## Replacing placeholders

All placeholder assets are simple generated SVGs so the site renders fully
out of the box. Swap them for real files using the **same filenames**:

| Placeholder | Replace with |
|---|---|
| `assets/poster/idearun-horizontal.svg` | Real event poster (keep ~5:3 ratio) |
| `assets/logos/*.svg` | Official IEEE / ISV / Sairam logos |
| `assets/templates/*.txt` | Real `.docx` / `.pptx` / `.pdf` files (update the `href` extension in `index.html` to match) |
| `assets/team/*.svg` | Real headshots (square, ~300×300) |
| `assets/projects/*.svg` | Real project photos (4:3, ~640×420) |

Update the two placeholder links before going live:
- Google Form URL: `https://forms.google.com/XXXXXXXX` (appears in Hero and
  Registration & Resources sections)
- Social links in the footer (`href="#"`)

## Features
- Light & dark theme, persisted via `localStorage`, respects system preference
- Sticky, accessible navbar with mobile menu
- Scroll-reveal animations via `IntersectionObserver`
- Animated vertical timeline ("Live Circuit") that fills as you scroll
- Resource cards with Preview (modal), Fullscreen and Download actions
- Lazy-loaded images with shimmer placeholders
- Skip-to-content link, visible focus states, `prefers-reduced-motion` support
- Semantic HTML, structured data (`EducationEvent` JSON-LD) and meta tags for SEO
- Fully responsive from mobile to desktop

## Accessibility notes
- All interactive elements are keyboard reachable and have visible focus rings
- Modal traps focus on open/close and is dismissible via `Esc`
- Images carry descriptive `alt` text; decorative elements use `aria-hidden`
- Color contrast follows the brand palette against light/dark backgrounds
