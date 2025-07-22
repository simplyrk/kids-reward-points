# Project Structure

## Root Directory
- **Configuration files**: `next.config.mjs`, `tsconfig.json`, `package.json`
- **Environment**: `.env` (local), `.env.example` (template)
- **Database**: `prisma/` directory with schema and migrations

## App Directory Structure (Next.js App Router)

### Core App Files
- `app/layout.tsx` - Root layout with theme provider and toast notifications
- `app/page.tsx` - Landing/home page
- `app/globals.css` - Global styles with CSS variables and utility classes

### Authentication Routes
- `app/(auth)/login/` - Parent and child login page
- `app/(auth)/register/` - User registration page
- Route groups `(auth)` for shared auth layout

### Main Application Routes
- `app/dashboard/` - Main dashboard for parents and children
- `app/children/` - Child management interface
- Each route contains `page.tsx` and optional client components

### API Routes
- `app/api/auth/[...nextauth]/` - NextAuth.js authentication endpoints
- `app/api/points/` - Points management API
- `app/api/register/` - User registration API

### Reusable Components
- `app/components/` - App-specific components (Button, Card, Input, theme-toggle)
- `components/ui/` - Shared UI primitives (shadcn/ui style)
- `app/providers/` - React context providers (theme)

## Library Directory
- `lib/auth.ts` - NextAuth configuration and callbacks
- `lib/auth-edge.ts` - Edge-compatible auth utilities
- `lib/prisma.ts` - Prisma client instance
- `lib/utils.ts` - Utility functions (cn for className merging)

## Database
- `prisma/schema.prisma` - Database schema with User, Account, Session, Point models
- `prisma/migrations/` - Database migration files

## Static Assets
- `public/` - Static files including PWA icons and manifest

## Type Definitions
- `types/next-auth.d.ts` - NextAuth type extensions
- `middleware.ts` - Route protection middleware

## Naming Conventions
- **Components**: PascalCase (e.g., `Button.tsx`, `DashboardClient.tsx`)
- **Pages**: lowercase with `page.tsx` suffix
- **API routes**: lowercase with `route.ts` suffix
- **Utilities**: camelCase (e.g., `auth.ts`, `prisma.ts`)
- **Client components**: Suffix with `Client.tsx` when needed for clarity

## Architecture Patterns
- **Server/Client separation**: Server components by default, client components explicitly marked
- **Route groups**: Use parentheses for layout organization without affecting URL structure
- **Colocation**: Keep related components close to their usage (page-specific components in route folders)
- **Shared utilities**: Common functions in `lib/` directory
- **Type safety**: Extend NextAuth types in dedicated type definition files