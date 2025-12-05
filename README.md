```
           __________                                 
         .'----------`.                              
         | .--------. |                             
         | |########| |       __________              
         | |########| |      /__________\             
.--------| `--------' |------|    --=-- |-------------.
|        `----,-.-----'      |o ======  |             | 
|       ______|_|_______     |__________|             | 
|      /  %%%%%%%%%%%%  \                             | 
|     /  %%%%%%%%%%%%%%  \                            | 
|     ^^^^^^^^^^^^^^^^^^^^                            | 
+-----------------------------------------------------+
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 
```

# Mental Wealth Academy

A pedagogical educational toolbox for small IRL communities looking to safely digitize their community and assets, with educational features such as prompt libraries and Agentic Daemon helpers to provide customizability and easy onboarding for all users. Grow stronger by empowering your community.

## Overview

Mental Wealth Academy is designed to help small real-world communities transition into the digital space while maintaining their core values and educational mission. The platform provides tools and resources to help communities digitize their assets, share knowledge, and grow together.

## Key Features

- **Educational Toolbox**: Comprehensive resources for community learning and development
- **Prompt Libraries**: Curated collections of prompts to guide community interactions and learning
- **Agentic Daemon Helpers**: AI-powered assistants to provide customizability and easy onboarding
- **Forum System**: Community discussion boards for knowledge sharing and collaboration
- **Quest System**: Interactive learning paths and community challenges
- **Catalog**: Organized library of community resources and assets

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules with custom design system
- **Deployment**: Vercel

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
│   ├── page.tsx            # Home page
│   └── forum/
│       └── page.tsx        # Forum page
├── components/
│   ├── forum/              # Forum components
│   ├── nav-buttons/        # Navigation buttons
│   ├── prompt-library-card/ # Prompt library card
│   └── ...                 # Other components
├── styles/
│   └── globals.css         # Global styles & design system
├── design-system.css       # Design system tokens
├── DESIGN_SYSTEM.md        # Design system documentation
├── package.json
├── tsconfig.json
├── next.config.js
└── vercel.json
```

## Design System

This project uses a custom design system. For detailed information about colors, typography, and design tokens, see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The project is configured for deployment on Vercel. The `vercel.json` file contains deployment settings.

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your project in [Vercel](https://vercel.com)
3. Vercel will automatically detect Next.js and configure the build settings
4. Deploy!

## TypeScript

This project is fully typed with TypeScript. All components are written in `.tsx` format with proper type definitions.

## Mission

Mental Wealth Academy empowers communities to:
- Safely transition to digital platforms
- Preserve and share knowledge
- Grow stronger through collaboration
- Customize their experience with AI-powered tools
- Onboard new members easily

---

**Grow stronger by empowering your community.**

