# offset.

![Project Status](https://img.shields.io/badge/status-active-success)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

**The modern way to coordinate global time.** Offset is a minimalist world clock and timezone converter designed with a focus on aesthetics ("Technical Glass"), performance, and privacy.

## ✨ Features

- **Technical Glass Aesthetic:** Deep "Zinc" dark mode with subtle glows and blurs.
- **Local-First Precision:** Calculates timezones locally using your browser's clock (no API latency).
- **Bento Grid Layout:** Responsive dashboard that adapts to any screen size.
- **Real-Time Updates:** Smooth second-by-second updates synchronized via `requestAnimationFrame`.
- **Privacy Focused:** No tracking, no external cookies.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Coming soon for persistence)
- **Time Logic:** `date-fns` & `date-fns-tz`

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

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

## 🗺️ Roadmap

- [x] MVP: Local clock & basic city list
- [x] UI: Dark mode & "Glass" design system
- [ ] **Search:** Add city search functionality
- [ ] **Persistance:** Save user cities via LocalStorage
- [ ] **Themes:** Custom theme toggle (Light/Dark)
- [ ] **Backup:** Export/Import settings configuration

## 📄 License

This project is open source and available under the [MIT License](https://www.google.com/search?q=LICENSE).
