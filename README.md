# Srichakra Project

This is the central documentation for the Srichakra project.

## Project Structure
- `client/`: Frontend code
- `server/`: Backend services
- `shared/`: Shared utilities and types
- `db/`: Database configuration and models
- `photos/`: Image assets
- `attached_assets/`: Additional assets

## Setup Instructions
1. Install dependencies: `npm install`
2. Set up environment variables (see `.env.example`)
3. Start development server: `npm run dev`

## Notes
- This is a TypeScript project using Tailwind CSS
- Vite is used for bundling

## Signup page
- The signup form is fully functional at `/signup`.
- Supports both public registration and school-based registration with student ID validation.
- School registrations can be validated against pre-registered school_students records in Supabase.
- All signups are saved to the Supabase `users` table via the `/api/register` endpoint.
