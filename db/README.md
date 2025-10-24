# Database quick-apply SQL (Supabase Studio)

If drizzle push is blocked locally, use Supabase Studio > SQL Editor and run these files:

- `db/users.sql` – creates `public.users` used by /api/register, /api/login, and admin lists.
- `db/pdfs.sql` – creates `public.pdfs` for uploaded PDF metadata.

After running, verify live function with:
- https://srichakraacademy.org/api/health?verbose=1
- Submit a signup from the website or POST to `/api/register`.
