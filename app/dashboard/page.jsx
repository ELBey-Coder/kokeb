import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Home as HomeIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "./DashboardHeader";
import StatusPill from "./StatusPill";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Server-side session check — a logged-out visitor never receives this
  // page's HTML at all, not even briefly.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
  .from("profiles")
  .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  // RLS already restricts this to the logged-in user's own rows, but the
  // explicit .eq() keeps the intent obvious in the code too.
  const { data: listings } = await supabase
  .from("listings")
  .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);
  const displayName = profile?.full_name || profile?.email || user.email;
const isAdmin =
  profile?.role === "platform_admin" ||
  profile?.role === "admin_owner";
  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#0B132B]">
      <DashboardHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-serif text-3xl font-semibold mb-1">
          Welcome, {displayName}
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Manage your Kokeb properties from here.
        </p>
{isAdmin && (
  <div className="mb-8 bg-[#0B132B] text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-[#FFB703] font-semibold mb-1">
        Admin Tools
      </p>

      <h2 className="font-serif text-xl font-semibold">
        Review Pending Listings
      </h2>

      <p className="text-sm text-slate-300 mt-1">
        Approve customer listings before they appear publicly on Kokeb.
      </p>
    </div>

    <Link
      href="/admin/listings"
      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#FFB703] text-[#0B132B] text-sm font-semibold hover:bg-[#FFD300]"
    >
      Open Admin Review
    </Link>
  </div>
)}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Properties</h2>
          <Link
            href="/dashboard/properties/new"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB703] to-[#FFD300] text-slate-900 hover:from-[#FFD300] hover:to-[#FFB703] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </Link>
        </div>

        {!listings || listings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <HomeIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">
              You haven&apos;t added a property yet.
            </p>
            <Link
              href="/dashboard/properties/new"
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-[#0B132B] text-white hover:bg-[#16223F] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add your first property
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="font-semibold">{listing.title}</p>
                  <p className="text-xs text-slate-500">
                    {listing.address || "No address yet"}
                  </p>
                </div>
                <StatusPill status={listing.status} />
              </div>
            ))}
          </div>
        )}

        {listings && listings.length > 0 && (
          <div className="mt-4 text-right">
            <Link
              href="/dashboard/properties"
              className="text-sm font-semibold text-[#0B132B] hover:underline"
            >
              View all my properties &rarr;
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
