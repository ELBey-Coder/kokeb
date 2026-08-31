// Supabase client for use on the server (Server Components, Route Handlers,
// Server Actions). Reads/writes the auth session via Next.js cookies so the
// logged-in user is available on the server without any extra round trip.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll was called from a Server Component that can't set cookies
            // (e.g. during a plain page render). Safe to ignore here — the
            // middleware below is what keeps sessions refreshed in that case.
          }
        },
      },
    }
  );
}
