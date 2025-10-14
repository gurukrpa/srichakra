# Srichakra Project Structure

This document provides an overview of the Srichakra project's structure and architecture.

## Top-Level Structure

```
/Users/gurukrpasharma/Desktop/srichakra/
├── .env                  # Environment variables
├── .git/                 # Git repository
├── .gitignore            # Git ignore rules
├── client/               # Frontend application code
├── server/               # Backend server code
├── shared/               # Shared code between client and server
├── db/                   # Database related code
├── package.json          # Project dependencies and scripts
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite bundler configuration
```

## Technology Stack

Based on package.json, this project uses:

1. **Frontend**:
   - React 18.3.1
   - Tailwind CSS
   - Radix UI components
   - Framer Motion for animations
   - Wouter for routing

2. **Backend**:
   - Express.js server
   - PassportJS for authentication
   - Drizzle ORM for database interactions
   - NeonDB (PostgreSQL) for database

3. **Development Tools**:
   - TypeScript
   - Vite for frontend bundling
   - TSX for running TypeScript files directly

## Key Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run db:push`: Push schema changes to the database
- `npm run db:seed`: Seed the database with initial data

## Getting Started

1. Make sure you have Node.js installed
2. Navigate to the project directory: `cd /Users/gurukrpasharma/Desktop/srichakra`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## Working with this Project

You can use the included `srichakra-workspace.sh` script to easily manage common tasks:

```bash
./srichakra-workspace.sh start    # Start development server
./srichakra-workspace.sh build    # Build the project
./srichakra-workspace.sh status   # Check project status
```
