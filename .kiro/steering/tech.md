# Technology Stack

## Framework & Runtime
- **Next.js 15.4.2** with App Router (React 19.1.0)
- **TypeScript** for type safety
- **Node.js** runtime environment

## Database & ORM
- **PostgreSQL** with Neon serverless database
- **Prisma** ORM with client generation and Neon adapter
- Database migrations managed through Prisma
- **@neondatabase/serverless** for serverless database connections
- **@prisma/adapter-neon** for optimized Neon integration

## Authentication
- **NextAuth.js v5** (beta) with custom credentials provider
- **bcryptjs** for password hashing
- JWT session strategy with custom callbacks
- Dual authentication system (parent email + child username)

## UI & Styling
- **Tailwind CSS v4** for styling with custom CSS variables
- **Radix UI** components for accessible primitives
- **Framer Motion** for animations and interactions
- **Lucide React** for icons
- **react-hot-toast** for notifications
- Custom theme system with light/dark mode support

## PWA & Performance
- **next-pwa** for Progressive Web App capabilities
- **Turbopack** for faster development builds
- Service worker registration with offline support

## Development Tools
- **ESLint** with Next.js configuration
- **Jest** and **@testing-library/react** for unit testing
- **Playwright** for end-to-end testing
- **@next/bundle-analyzer** for bundle analysis
- **class-variance-authority** and **clsx** for conditional styling
- **tailwind-merge** for Tailwind class merging

## Common Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes to database
npx prisma migrate   # Run database migrations
npx prisma studio    # Open Prisma Studio
```

### Testing
```bash
npm test            # Run Jest tests
npx playwright test # Run E2E tests
```