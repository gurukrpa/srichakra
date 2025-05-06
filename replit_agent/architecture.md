# Architecture Overview

## Overview

This repository contains a full-stack web application designed to provide an interactive JavaScript Closure Library execution environment. The application follows a client-server architecture with a React-based frontend and a Node.js backend. It uses Drizzle ORM with PostgreSQL for data persistence, and implements modern web development patterns including API-based communication between the frontend and backend.

## System Architecture

### High-Level Architecture

The application is structured as a monorepo with clear separation between client and server code:

```
/
├── client/             # Frontend React application
├── server/             # Express.js backend server
├── db/                 # Database configuration and migrations
├── shared/             # Shared code (schema definitions, types)
├── attached_assets/    # Static assets
```

### Technology Stack

- **Frontend**: React with TypeScript, styled using Tailwind CSS and Shadcn UI components
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **API Communication**: RESTful API with JSON payloads
- **Build & Development Tools**: Vite for frontend, esbuild for backend

## Key Components

### Frontend

The frontend is a React application built with TypeScript and Vite. It implements a code editor interface that allows users to interact with and test JavaScript Closure Library code.

Key frontend components:

1. **CodeEditor**: Main page component for code editing functionality
2. **UI Components**: Uses the Shadcn UI component library, which is built on top of Radix UI primitives
3. **Query Management**: Uses TanStack Query for API state management
4. **Routing**: Uses Wouter for lightweight client-side routing

The UI is styled with Tailwind CSS, using a customized theme defined in the tailwind configuration with CSS variables for theming.

### Backend

The backend is an Express.js server written in TypeScript. It provides API endpoints to support the frontend functionality.

Key backend components:

1. **Express Server**: Handles HTTP requests and serves the static frontend assets in production
2. **API Routes**: RESTful endpoints for application functionality
3. **Database Integration**: Connection to PostgreSQL database via Drizzle ORM

The server has a minimal API surface currently, with potential for expansion to support code execution history, saving code snippets, or other features.

### Database

The application uses PostgreSQL with Drizzle ORM for data persistence. The schema is defined in TypeScript with zod for validation.

Current schema models:

- **User**: Stores user credentials with username and password

The database schema is designed to be extensible for future requirements.

## Data Flow

1. **User Interaction**:
   - User inputs JavaScript code in the browser interface
   - Code execution happens client-side for security reasons
   - Results are displayed in the UI

2. **API Communication**:
   - Frontend makes API requests to the backend for data persistence operations
   - Backend processes requests, interacts with the database, and returns responses

3. **Database Operations**:
   - Backend uses Drizzle ORM to handle database operations
   - Schema definitions are shared between frontend and backend via the shared directory

## External Dependencies

### Frontend Dependencies

- **React**: UI library
- **Radix UI**: Accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Data fetching and state management
- **Wouter**: Client-side routing
- **Shadcn UI**: Component library

### Backend Dependencies

- **Express.js**: Web server framework
- **Drizzle ORM**: Database ORM
- **Neon Database SDK**: PostgreSQL client for serverless environments

## Deployment Strategy

The application is configured for deployment to the Replit platform:

1. **Development Mode**:
   - Uses `npm run dev` to run the Express server with live reloading
   - Vite development server for the frontend with HMR

2. **Production Build**:
   - Frontend: Built with Vite to static assets
   - Backend: Bundled with esbuild
   - Output: Combined into a single distribution package

3. **Deployment Configuration**:
   - `.replit` file configures the Replit environment
   - Deployment target is set to "autoscale"
   - Build and run commands are defined for automated deployment

4. **Database**:
   - Uses Neon serverless PostgreSQL for database functionality
   - Connection details are stored in environment variables

## Design Decisions and Tradeoffs

### Monorepo Structure

**Decision**: Use a monorepo structure with shared code.

**Rationale**: This approach allows for easier code sharing between frontend and backend, simplified dependency management, and atomic changes across the stack. The tradeoff is increased complexity in build configuration.

### Client-Side Code Execution

**Decision**: Execute JavaScript code on the client side rather than the server.

**Rationale**: Client-side execution provides immediate feedback without network latency and reduces server load. It also eliminates security risks associated with executing arbitrary code on the server. The tradeoff is limited access to server-side APIs and potential performance limitations in the browser.

### UI Component Library

**Decision**: Use Shadcn UI with Tailwind CSS for component styling.

**Rationale**: This combination provides a consistent design system with accessible components out of the box, while maintaining the flexibility of Tailwind CSS for custom styling. The tradeoff is increased bundle size from the component library dependencies.

### Database ORM

**Decision**: Use Drizzle ORM with PostgreSQL.

**Rationale**: Drizzle provides type-safe database operations with a lightweight API surface. Integration with Zod enables seamless validation between API and database layers. The tradeoff is that Drizzle is newer compared to alternatives like Prisma, with potentially fewer features and community resources.

### API Architecture

**Decision**: Use a RESTful API design for client-server communication.

**Rationale**: REST provides a simple, stateless architecture that is compatible with HTTP caching and well-understood by developers. The tradeoff compared to alternatives like GraphQL is less flexibility in data fetching patterns.