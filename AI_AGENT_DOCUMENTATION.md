# AI Agent Documentation: Tumpuk Sampah (TS) Website

## Overview

**Tumpuk Sampah (TS)** is an innovative waste management service focused on organic waste processing directly from the source. The website is a single-page landing page designed to promote their subscription-based service for households and businesses in Makassar, Indonesia.

**Core Mission:** Provide sustainable waste management solutions that reduce landfill waste and greenhouse gas emissions.

---

## Technical Stack

- **Framework:** React 19.2.7
- **Build Tool:** Vite 8.1.1
- **Linting:** oxlint 1.71.0
- **Icons:** lucide-react 1.24.0
- **Fonts:** Bricolage Grotesque (headings), Inter (body)
- **Styling:** Custom CSS with CSS variables (no Tailwind/Bootstrap)

---

## Project Structure

```
/
├── index.html                 # Entry point
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite configuration
├── src/
│   ├── main.jsx              # React DOM root
│   ├── App.jsx               # Main component (orchestrates all sections)
│   ├── App.css               # (empty, styles moved to index.css)
│   ├── index.css             # All global styles & CSS variables
│   ├── assets/               # Images (hero, logos, workflow)
│   └── components/           # 9 section components
│       ├── Header.jsx
│       ├── Hero.jsx
│       ├── About.jsx
│       ├── TrackRecord.jsx
│       ├── Workflow.jsx
│       ├── Pricing.jsx
│       ├── Registration.jsx
│       ├── FAQ.jsx
│       └── Footer.jsx
└── public/                   # Static assets
```

---

## Component Architecture

All components are functional React components with no client-side routing (single page). Navigation is handled via smooth scroll to section IDs.

### App.jsx
The root component that renders all sections in order:
1. Header
2. Hero
3. About
4. TrackRecord
5. Workflow
6. Pricing
7. Registration
8. FAQ
9. Footer

---

## Section Details

### 1. Header (`Header.jsx`)
- **Purpose:** Displays the company logo
- **Position:** Fixed/absolute at top with z-index 10
- **Content:** Logo image from `assets/logo.png`
- **Styling:** White background box with shadow

### 2. Hero (`Hero.jsx`)
- **Purpose:** Main landing section with call-to-action
- **Features:**
  - Parallax scrolling background effect
  - Badge: "Start New Habits" with recycle icon
  - Heading: "Tumpuk Sampah (TS)"
  - Subtext explaining the service
  - CTA button: "Lihat Layanan" (scrolls to pricing)
- **State:** Uses `useState` and `useEffect` for scroll-based parallax
- **Background:** `hero1.jpg` with gradient overlay

### 3. About (`About.jsx`)
- **Purpose:** Company profile section
- **ID:** `#about`
- **Content:**
  - Company description paragraph
  - Two-column grid:
    - **Visi Kami:** Vision statement
    - **Misi Kami:** Two mission points (practical waste management, quality communication)
- **Styling:** Centered text with tag badge

### 4. TrackRecord (`TrackRecord.jsx`)
- **Purpose:** Showcase impact and track record
- **Features:**
  - Three stat cards in a row:
    - 12+ Ton Sampah Terkelola (Waste Managed)
    - 100 Karbon Terselamatkan (Carbon Saved)
    - 360 Orang Teredukasi (People Educated)
  - Client/partner logos: Mama, Citra Garden, Rappo, DLH Makassar
  - Operational area: Kota Makassar
- **Styling:** Cards with top border accent

### 5. Workflow (`Workflow.jsx`)
- **Purpose:** Explain the service workflow and sorting guidelines
- **ID:** N/A (accessible via scroll)
- **Content:**
  - 3-step process cards:
    1. Registrasi — Sign up, receive bucket
    2. Pilah Sampah — Sort organic waste into TS bucket
    3. Terima Kompos — Receive compost back
  - Sorting guide (two-column):
    - **BISA MASUK EMBER (Can go in):** Fruit/vegetable scraps, eggshells, meat, coffee grounds, rice, nuts, bread
    - **TIDAK BISA MASUK (Cannot go in):** Plastics, fabric, tissues, batteries, cardboard, glass, diapers, rice wrappers
- **Images:** workflow-img-1.png, workflow-img-2.png

### 6. Pricing (`Pricing.jsx`)
- **Purpose:** Display subscription packages
- **ID:** `#pricing`
- **State:** Manages 4 modal states (Consult, Edukasi, BSS, Minjel)

#### Package 1: Paket Rumah Tangga (Household)
- **Price:** Rp115,000/month
- **Features:**
  - 20L bucket + lid
  - 1x pickup per week
  - Fast-response admin service
  - 10kg free compost per 6 months
- **Duration options:**
  - 3 months: Rp345,000
  - 6 months: Rp690,000
  - 1 year: Rp1,242,000 (10% discount)
- **Promo:** Invite 10 neighbors, get 1 month free

#### Package 2: Paket Bisnis (Business)
- **Note:** Requires formal contract
- **4 tiers:**
  - **STARTER:** Rp500k/month — 5 buckets, 1x pickup/week, 10kg compost
  - **GREEN:** Rp1.5Jt/month — 10 buckets, 3x pickup/week, 25kg compost (POPULAR)
  - **SUSTAIN:** Rp2.5Jt/month — 20 buckets, 3x pickup/week, waste report, 50kg compost
  - **IMPACT:** Rp3.5Jt/month — 30 buckets, 3x pickup/week, waste report, 75kg compost

#### Additional Services (with modals):
1. Konsultasi Manajemen Sampah — Links to Google Form
2. Edukasi Lingkungan — WhatsApp contact
3. Bawa Sampah Sendiri (BSS) — Placeholder
4. TS MINJEL (Setor Minyak Jelantah) — Placeholder

### 7. Registration (`Registration.jsx`)
- **Purpose:** Registration process and terms
- **Content:**
  - 5-step horizontal timeline:
    1. Daftar — Fill registration form (Google Forms link)
    2. Konfirmasi — Admin validates via WhatsApp
    3. Pengantaran Alat — Bucket delivered
    4. Mulai Memilah — Start sorting
    5. Tukar Ember — Weekly bucket exchange
  - Terms & Conditions (2x2 grid):
    - Pengangkutan: Every Thursday
    - Pembayaran: Upfront via bank transfer
    - Pembatalan: Non-refundable
    - Kompensasi Alat: Rp55,000/bucket if damaged/lost

### 8. FAQ (`FAQ.jsx`)
- **Purpose:** Testimonials and frequently asked questions
- **Content:**
  - **Cerita Warga (Testimonials):**
    - Nathali (Mama Toko Kue 2nd gen)
    - Erma (subscriber since August 2024)
  - **FAQ (Accordion):**
    - Q: Sampah organiknya dikelola jadi apa? → Kompos
    - Q: Mulai dari mana? → Start with small habits
    - Q: Penjemputan 1x/minggu supaya ga bau? → Use sealed container
- **State:** Each AccordionItem manages its own open/close state

### 9. Footer (`Footer.jsx`)
- **Purpose:** CTA, contact info, social media
- **Content:**
  - CTA Box: "Mari Mulai Langkah Baik Ini" with quote and subscribe button
  - Company description
  - Location: Jl. Mallengkeri, Makassar
  - Phone: 0857-9694-5320
  - Social: @tumpuksampah, tumpuksampahh@gmail.com
  - Copyright with dynamic year

---

## Design System (CSS Variables)

Located in `index.css`:

```css
--color-primary: #8C6A4F;        /* Earth tone brown */
--color-primary-dark: #6D4F38;
--color-primary-light: #E8DCCB;   /* Soft beige */
--color-secondary: #B08D6A;
--color-text: #2D2A26;
--color-text-light: #5A5652;
--color-bg: #FFFFFF;
--color-bg-alt: #F9F7F3;         /* Very soft beige */
--color-border: #E5E0D8;

--font-heading: 'Bricolage Grotesque', sans-serif;
--font-body: 'Inter', sans-serif;

--radius-sm: 8px;
--radius-md: 16px;
--radius-lg: 24px;
```

---

## Key CSS Classes

- `.container` — Max-width 960px centered
- `.card` — White card with border, hover effect
- `.btn` / `.btn-primary` / `.btn-outline` — Button styles
- `.tag` — Small badge with beige background
- `.service-btn` — Outlined button for additional services
- `.pricing-scroll` — Horizontal scroll container for business packages
- `.timeline-scroll` — Horizontal scroll for registration steps
- `.modal-overlay` / `.modal-content` — Modal components
- `.bg-alt` — Section with beige background

---

## Responsive Behavior

- Mobile breakpoint: 768px
- Grid columns collapse to single column on mobile
- Pricing and timeline sections use horizontal scroll on mobile
- Hero section padding adjusts for mobile

---

## Key Interactions

1. **Smooth Scroll:** CTA buttons scroll to `#pricing` section
2. **Parallax:** Hero background moves on scroll
3. **Modals:** 4 modal dialogs for additional services
4. **Accordion:** FAQ items expand/collapse
5. **Hover Effects:** Cards lift on hover, buttons transform

---

## External Links

- Registration Form: `https://docs.google.com/forms` (placeholder)
- WhatsApp: `https://wa.me/6281234567890` (placeholder)
- Google Forms (Consultation): `https://forms.gle/your-form-id` (placeholder)

---

## Build & Asset Optimization Notes

Aset gambar telah dioptimasi (total `dist/assets` turun dari ~1.9MB → ~708KB). Aturan yang harus diikuti agent:

- **Workflow images** direferensikan sebagai `.jpg` di `Workflow.jsx` (`workflow-img-1.jpg`, `workflow-img-2.jpg`), meski nama file sumber historisnya `.png`. Jangan ubah ekstensi import tanpa menjalankan ulang optimasi.
- **Optimasi otomatis** dilakukan via `sharp` (devDependency). Skrip: `scripts/optimize-images.mjs`.
  Jalankan setelah mengganti gambar di `src/assets/`:
  ```bash
  node scripts/optimize-images.mjs
  ```
- **Backup aset asli** tersimpan di `src/assets-backup/` (untuk pemulihan).
- **Lazy loading:** semua `<img>` non-hero memakai `loading="lazy"` + `decoding="async"` (TrackRecord logos, Workflow imgs). Hero background adalah CSS background, bukan `<img>`.
- **Parallax Hero** (`Hero.jsx`) sengaja menggunakan `ref` + `requestAnimationFrame` (bukan `setState` tiap scroll) agar tidak memicu re-render React berulang. Jangan kembalikan ke pola `setState`/`window.scrollY`.

---

## Running the Project

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Preview production build
npm run preview

# Re-run image optimization (after changing src/assets/)
node scripts/optimize-images.mjs
```


