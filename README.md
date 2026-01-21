# offset.

![Project Status](https://img.shields.io/badge/status-active-success)
![Next.js](https://img.shields.io/badge/Next.js-15%2B-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

**The modern way to coordinate global time.** Offset is a minimalist world clock, meeting planner, and timezone converter designed with a focus on aesthetics ("Technical Glass"), performance, and privacy.

## ✨ Features

- **🧠 Smart Auto-Location:** Automatically detects your city, weather, and time via IP (with GPS fallback) using `ipwho.is`.
- **📅 Meeting Planner:** Interactive 24h grid to find overlapping business hours across timezones. Includes color-coded availability (Business/Extended/Night) and a "Copy Summary" feature.
- **🌍 Global Search:** Search any city in the world using the Open-Meteo Geocoding API. Includes disambiguation (e.g., handling "Paris, Texas" vs "Paris, France").
- **drag & Drop Dashboard:** Reorder your clocks easily with a smooth, animated interface.
- **☁️ Real-Time Weather:** Live temperature and condition icons for every saved city.
- **🎨 Technical Glass Aesthetic:** Deep "Zinc" dark mode with subtle glows, blurs, and skeletons for loading states.
- **💾 Local-First Persistence:** All settings and cities are saved instantly to your browser's `localStorage`. No login required.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router & Server Components)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (JIT Mode)
- **Interactions:** [dnd-kit](https://dndkit.com/) (Drag & Drop)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Time Logic:** `date-fns` & `date-fns-tz`
- **Data Sources:** - Geocoding & Weather: [Open-Meteo](https://open-meteo.com/)
  - IP Location: [ipwho.is](https://ipwho.is/)
  - Flags: [FlagCDN](https://flagcdn.com/)

## 🚀 Getting Started

First, clone the repository:

```bash
git clone https://github.com/EdvinCodes/offset.git
cd offset
```

Install the dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗺️ Roadmap

- [x] **MVP:** Local clock & basic city list
- [x] **UI:** Dark mode & "Glass" design system
- [x] **Search:** Global city search via API
- [x] **Persistence:** Save user cities via LocalStorage
- [x] **Productivity:** Meeting Planner with business hours
- [x] **Context:** Real-time weather and dynamic flags
- [x] **Themes:** Custom theme toggle (Light/Dark/System)
- [x] **Backup:** Export/Import settings as JSON
- [x] **PWA:** Install as a native app on mobile

## 📄 License

This project is open source and available under the [MIT License](https://www.google.com/search?q=LICENSE).
