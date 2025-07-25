# Design Document

## Overview

The Kids Reward Points (KRP) system is built as a Next.js 15 application using the App Router architecture with TypeScript for type safety. The system implements a dual-role authentication system supporting both parents and children, with a PostgreSQL database managed through Prisma ORM. The application follows a server-first approach with selective client-side interactivity and is optimized as a Progressive Web App for mobile usage.

## Architecture

### Technology Stack
- **Frontend**: Next.js 15.4.2 with App Router, React 19.1.0, TypeScript
- **Backend**: Next.js API Routes with server actions
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Prisma with Neon adapter for optimized connections
- **Authentication**: NextAuth.js v5 with custom credentials provider
- **Styling**: Tailwind CSS v4 with Radix UI components
- **PWA**: next-pwa for offline capabilities and app-like experience

### System Architecture Pattern
The application follows a layered architecture:
1. **Presentation Layer**: React Server Components with selective Client Components
2. **API Layer**: Next.js API routes handling business logic and validation
3. **Service Layer**: Prisma ORM for database operations and data modeling
4. **Data Layer**: PostgreSQL database with optimized schema design

## Components and Interfaces

### Authentication System

#### NextAuth Configuration
```typescript
// lib/auth.ts
- Custom credentials provider for dual authentication (parent email/child username)
- JWT session strategy with role-based callbacks
- Session extension with user role and ID information
- Secure password hashing with bcryptjs for parents
- Plain text password storage for children (parent visibility requirement)
```

#### User Model Structure
```typescript
interface User {
  id: string
  email?: string          // Required for parents, null for children
  password: string        // Hashed for all users
  name: string
  role: 'PARENT' | 'KID'
  childUsername?: string  // Required for children, unique identifier
  plainPassword?: string  // Plain text for children only (parent access)
  parentId?: string       // Foreign key linking children to parents
  avatar: string          // Generated avatar URL
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Points Management System

#### Point Model Structure
```typescript
interface Point {
  id: string
  amount: number          // Positive for rewards, negative for penalties
  description: string     // Activity description or reason
  userId: string          // Child receiving the points
  givenById: string       // Parent who awarded the points
  activityRequestId?: string // Optional link to approved activity request
  createdAt: DateTime
}
```

#### Points API Endpoints
- `GET /api/points` - Retrieve points with role-based filtering
- `POST /api/points` - Create new point records (parents only)
- `DELETE /api/points?id={pointId}` - Remove point records (parents only)

### Activity Request Workflow

#### ActivityRequest Model Structure
```typescript
interface ActivityRequest {
  id: string
  activity: string        // Activity type/category
  description: string     // Detailed description of completed activity
  activityDate: DateTime  // When the activity was performed (supports backdating)
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedById: string   // Child who submitted the request
  reviewedById?: string   // Parent who reviewed (when status changes)
  reviewedAt?: DateTime   // Timestamp of review
  pointId?: string        // Link to created point record if approved
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Activity Request API Endpoints
- `GET /api/activity-requests` - Retrieve requests with role-based filtering
- `POST /api/activity-requests` - Submit new activity requests
- `POST /api/activity-requests/[id]/review` - Review and approve/reject requests (parents only)

### User Management System

#### Registration API
- `POST /api/register` - Handle both parent and child account creation
- Validates unique email for parents and unique username for children
- Generates avatar URLs using DiceBear API
- Implements proper parent-child relationship linking

#### Children Management API
- `GET /api/children/credentials` - Retrieve child login credentials (parents only)
- `DELETE /api/children/[id]` - Remove child accounts with cascade deletion

## Data Models

### Database Schema Design

#### Relationships
- **One-to-Many**: Parent → Children (User.parentId → User.id)
- **One-to-Many**: User → Points (Point.userId → User.id)
- **One-to-Many**: User → Given Points (Point.givenById → User.id)
- **One-to-Many**: User → Activity Requests (ActivityRequest.requestedById → User.id)
- **One-to-One**: ActivityRequest → Point (ActivityRequest.pointId → Point.id)

#### Performance Optimizations
- Indexed queries on frequently accessed fields (userId, parentId, createdAt)
- Limit queries to 50 recent records for points display
- Cascade deletion for data integrity and cleanup
- Optimized includes for related data fetching

### Data Validation Rules
- Email uniqueness for parent accounts
- Username uniqueness for child accounts
- Required fields validation at API level
- Role-based access control for all operations
- Parent-child relationship verification for data access

## Error Handling

### API Error Responses
```typescript
interface APIError {
  error: string
  status: number
}

// Standard error codes:
// 400 - Bad Request (validation errors)
// 401 - Unauthorized (authentication required)
// 403 - Forbidden (insufficient permissions)
// 404 - Not Found (resource doesn't exist)
// 409 - Conflict (duplicate data)
// 500 - Internal Server Error (unexpected errors)
```

### Client-Side Error Handling
- Toast notifications for user feedback using react-hot-toast
- Form validation with appropriate error messages
- Loading states and error boundaries for graceful degradation
- Redirect handling for authentication failures

### Server-Side Error Handling
- Comprehensive try-catch blocks in API routes
- Detailed server-side logging without exposing sensitive data
- Database connection error handling with Prisma
- Session validation and role verification

## Testing Strategy

### Unit Testing Approach
- **API Routes**: Test all endpoints with various input scenarios
- **Database Operations**: Test Prisma queries and relationships
- **Authentication**: Test login flows for both parent and child roles
- **Validation**: Test input validation and error handling

### Integration Testing
- **End-to-End Workflows**: Test complete user journeys (registration → login → points management)
- **Role-Based Access**: Verify proper authorization for different user roles
- **Data Relationships**: Test parent-child data access and cascade operations

### Testing Tools
- **Jest** for unit testing with @testing-library/react
- **Playwright** for end-to-end testing
- **Test Database**: Separate test environment with seed data

### Test Coverage Areas
1. **Authentication flows** for both parent and child users
2. **Points management** including creation, viewing, and deletion
3. **Activity request workflow** from submission to approval/rejection
4. **Parent-child relationship** management and data access control
5. **API endpoint security** and authorization checks
6. **Database operations** and data integrity constraints

## Security Considerations

### Authentication Security
- Secure password hashing with bcryptjs (salt rounds: 10)
- JWT session tokens with appropriate expiration
- Role-based access control at API level
- Session validation on protected routes

### Data Protection
- Parameterized database queries to prevent SQL injection
- Input validation and sanitization
- CORS configuration for API endpoints
- Environment variable protection for sensitive configuration

### Authorization Model
- Parent users can access and modify their children's data
- Child users can only access their own data
- API endpoints verify user ownership before operations
- Middleware protection for authenticated routes

## Progressive Web App Features

### PWA Configuration
- Service worker registration for offline functionality
- Web app manifest with proper icons and metadata
- Responsive design optimized for mobile devices
- App-like navigation and user experience

### Mobile Optimization
- Touch-friendly interface elements
- Responsive breakpoints for various screen sizes
- Fast loading with optimized bundle sizes
- Smooth animations and transitions using Framer Motion

### Offline Capabilities
- Cached static assets for offline access
- Local storage for temporary data persistence
- Graceful degradation when network is unavailable
- Background sync for data synchronization when online