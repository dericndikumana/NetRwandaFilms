# NetRwandaFilms 🎬🇷🇼

A high-performance, mobile-first movie streaming platform designed specifically for Rwandan viewers and global African cinema lovers. Built with Next.js (App Router), Tailwind CSS, PostgreSQL (Supabase) via Prisma, NextAuth.js, and Cloudflare R2 / Backblaze B2 object storage for HLS video streaming.

---

## ✨ Features

- **Mobile-First & Data-Efficient**: Optimized for average Rwandan cellular connectivity (MTN / Airtel 3G/4G) with 480p, 720p, and 1080p stream options.
- **Dual-Language Streaming**: Switch seamlessly between English audio and synchronized Kinyarwanda dubbing with zero buffering.
- **Bilingual Interface**: Full English and Ikinyarwanda language toggle across all pages.
- **MovieBox-Inspired Layout**: Dynamic hero carousel banner, horizontal category sliders with smooth touch-swiping, and high-contrast movie cards.
- **Continue Watching & Favorites**: Saves playback position and bookmarks to resume anytime from your phone or desktop.
- **Audience Comments & DMCA Center**: Public viewer feedback system and formal intellectual property takedown submission forms.
- **Creator Support Fund**: Direct callout for viewer donations via MTN Mobile Money / Airtel Money USSD codes.
- **Full Admin Dashboard**:
  - Upload movies, posters, wide banners, trailers, and subtitles with direct-to-R2 upload progress bars.
  - Optional legal rights and license management.
  - Hero banner curator & category manager.
  - User role management (`SUPER_ADMIN`, `EDITOR`, `USER`).
  - Storage & bandwidth analytics.

---

## 🎨 Color Palette

Designed strictly without pure white (`#FFFFFF`) or pure black (`#000000`):

| Token | Hex Code | Role |
| :--- | :--- | :--- |
| **Background (Dark)** | `#1B1F3B` | Deep indigo-navy foundation |
| **Background (Light)** | `#F6F1E7` | Light-cream alternative theme |
| **Cards & Surfaces** | `#262B52` | Elevated cards (`#EAE3D2` light) |
| **Surface Hover** | `#2F3563` | Interactive hover states (`#DFD7C4` light) |
| **Primary Accent** | `#F5B83D` | Warm amber (CTA buttons, play icons) |
| **Secondary Accent** | `#2FBF71` | Rwanda green (badges, highlights) |
| **Info / Links** | `#4DA3FF` | Sky blue for metadata links |
| **Main Text (Dark)** | `#F3EFE6` | Soft cream readable typography |
| **Main Text (Light)** | `#1B1F3B` | Deep indigo text for light theme |
| **Muted Text** | `#B8BCD6` | Secondary labels (`#5E6382` light) |
| **Errors & Alerts** | `#FF6B6B` | Coral red for alerts & removals |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase database credentials:
```bash
cp .env.example .env
```

### 3. Push Database Schema to Supabase
```bash
npx prisma db push
```

### 4. Seed Admin Accounts & Sample Films
```bash
npm run prisma:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public portal, or [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin dashboard:
- **Super Admin**: `admin@netrwanda.com` / `AdminRwanda2025!Secure`
- **Editor**: `editor@netrwanda.com` / `EditorRwanda2025!Secure`

---

## 📄 License
This project is proprietary and built for NetRwandaFilms.
