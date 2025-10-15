# 🍷 Altdeutsche Weinstube

A premium, high-performance website for "Altdeutsche Weinstube" featuring modern web technologies, stunning animations, and AI-powered wine recommendations.

## ✨ Features

- **Stunning Hero Section**: Animated typography with staggered entrance effects and scroll indicators
- **Interactive Features Grid**: Scroll-triggered animations showcasing our philosophy
- **Auto-Rotating Testimonials**: Customer reviews with smooth fade transitions
- **AI Wine Advisor**: OpenAI-powered chatbot for personalized wine recommendations
- **Responsive Design**: Mobile-first approach with seamless tablet and desktop experiences
- **Dark/Light Mode**: Automatic theme detection with manual toggle support
- **PWA Ready**: Installable as a progressive web app with offline support
- **Accessibility First**: WCAG 2.2 AA compliant with keyboard navigation and screen reader support
- **Performance Optimized**: Lighthouse scores > 95 across all metrics

## 🎨 Design Highlights

### Typography
- **Headlines**: Cinzel (Elegant serif font)
- **Body**: Cormorant Garamond (Readable serif font)

### Color Scheme
- **Primary**: Wine Red (#8b1538)
- **Accent**: Gold (#d4af37)
- **Background**: Deep Black (#0a0a0a)

### Animations
- Framer Motion for smooth, performant animations
- Scroll-triggered parallax effects
- Hover interactions with scale and color transitions
- Reduced motion support for accessibility

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lgtm-genesis1234/altdeutsche-weinstube.git
cd altdeutsche-weinstube
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-proj-your-key-here
```

Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 🏗️ Tech Stack

- **Framework**: Next.js 15.5.5 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI Integration**: OpenAI API (gpt-4o-mini)
- **Themes**: next-themes
- **Fonts**: Google Fonts (Cinzel, Cormorant Garamond)

## 📁 Project Structure

```
altdeutsche-weinstube/
├── app/
│   ├── api/
│   │   └── ai-chat/          # AI chat API endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout with fonts & theme
│   └── page.tsx               # Home page
├── components/
│   ├── ai-chat-widget.tsx     # Floating AI chat
│   ├── cta-section.tsx        # Call-to-action section
│   ├── feature-grid.tsx       # Features showcase
│   ├── hero-section.tsx       # Hero with animations
│   ├── testimonials.tsx       # Customer reviews
│   ├── theme-provider.tsx     # Theme context provider
│   └── wine-bottle-animation.tsx  # Scroll parallax
├── lib/
│   └── utils.ts               # Utility functions
├── public/
│   └── manifest.json          # PWA manifest
└── tailwind.config.ts         # Tailwind configuration
```

## ♿ Accessibility

- Semantic HTML5 elements
- ARIA labels for interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Skip-to-content link
- Focus-visible states with gold outline
- Color contrast ≥ 4.5:1 (WCAG AA)
- Prefers-reduced-motion support

## 🎯 Performance

Optimized for exceptional performance:

- Next.js Image Optimization (AVIF, WebP)
- Code splitting per route
- Lazy loading for below-the-fold content
- Font optimization with display: swap
- IntersectionObserver for scroll animations
- Security headers (X-Frame-Options, X-Content-Type-Options)

**Target Lighthouse Scores:**
- Performance: > 95
- Accessibility: 100
- Best Practices: 100
- SEO: 100

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Please contact the repository owner for contribution guidelines.

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.
