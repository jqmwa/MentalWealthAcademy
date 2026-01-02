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
- **Library**: Organized library of community resources and assets

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules with custom design system
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (local or cloud-hosted like Supabase)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your database configuration:

   Create a `.env.local` file in the root directory with your database connection:

   **Option 1: Using DATABASE_URL (Recommended)**
   ```bash
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

   **Option 2: Using individual environment variables**
   ```bash
   POSTGRES_HOST=localhost
   POSTGRES_USER=your_username
   POSTGRES_PASSWORD=your_password
   POSTGRES_DATABASE=your_database
   POSTGRES_PORT=5432
   ```

   **For Supabase users:**
   - Get your connection string from Supabase Dashboard → Settings → Database
   - Use the "Connection string" → "URI" format
   - The connection string should look like: `postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres`

3. Set up the database schema:

   If using Supabase, run the SQL from `db/schema.sql` in the Supabase SQL Editor.
   
   Otherwise, the schema will be automatically created on first API call.

4. Test your database connection:
```bash
npm run test-db
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Troubleshooting Database Connection

If you encounter database connection errors:

1. **Test your connection:**
   ```bash
   npm run test-db
   ```

2. **Common issues:**
   - **ECONNREFUSED**: Database server is not running or not accessible
   - **ENOTFOUND**: Hostname cannot be resolved (check your DATABASE_URL)
   - **IPv6 issues**: If your connection string uses IPv6 and you're having issues, try using the IPv4 address instead
   - **SSL/TLS**: For cloud databases (Supabase), SSL is automatically configured

3. **Verify your environment variables:**
   - Make sure `.env.local` is in the root directory
   - Restart your development server after changing environment variables
   - Check that your `.env.local` file is not committed to git (it should be in `.gitignore`)

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
│   ├── messageboard-card/ # Messageboard card (links to forum)
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
