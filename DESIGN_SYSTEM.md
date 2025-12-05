# Academy V3

A modern, futuristic website built with Next.js, TypeScript, and a carefully crafted design system. Optimized for deployment on Vercel.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Deployment**: Vercel

## Design System

This project uses a custom design system with the following specifications:

### Colors
- **Background**: `#F4F5FE` - Light purple background
- **Primary**: `#5168FF` - Vibrant blue for primary actions
- **Secondary**: `#62BE8F` - Green for secondary elements
- **Text/Button**: `#000000` (black) & `#ECECEC` (light gray)

### Gradients
- **Futuristic Floss**: Linear gradient from `#ECECFF` to `#E1E1FE` (top to bottom)

### Typography
- **Primary Fonts**: Poppins, Space Grotesk
- **Paragraph Font**: Poppins Light
- **Button Font**: IBM Plex Mono

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
academyv3/
├── app/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── hero/
│   │   ├── Hero.tsx        # Hero component
│   │   └── Hero.module.css # Hero styles
│   └── banner/
│       ├── Banner.tsx      # Banner component
│       └── Banner.module.css # Banner styles
├── styles/
│   └── globals.css         # Global styles & design system
├── package.json
├── tsconfig.json
├── next.config.js
└── vercel.json
```

## Components

### Hero Component
Located in `components/hero/Hero.tsx` - The main hero section with background image.

### Banner Component
Located in `components/banner/Banner.tsx` - The top banner with announcement text.

## Design Tokens

All design tokens are available as CSS custom properties in `styles/globals.css`:

- `--color-background`
- `--color-primary`
- `--color-secondary`
- `--color-text-dark`
- `--color-text-light`
- `--gradient-futuristic-floss`
- And more...

## Deployment to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your project in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and configure the build settings
4. Deploy!

The `vercel.json` file is already configured for optimal Vercel deployment.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## TypeScript

This project is fully typed with TypeScript. All components are written in `.tsx` format with proper type definitions.
