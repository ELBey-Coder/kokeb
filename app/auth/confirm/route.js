// Handles the link Supabase emails after signup:
//   /auth/confirm?token_hash=...&type=email
// Exchanges that token for a real session, then sends the customer
// straight into their dashboard.
//
// One-time setup required in the Supabase dashboard:
//   Authentication → Email Templates → Confirm signup → change
//   {{ .ConfirmationURL }} to:
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirect(next);
    }
    redirect(`/auth/error?message=${encodeURIComponent(error.message)}`);
  }

  redirect("/auth/error");
}
