import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Home as HomeIcon, BedDouble, Bath } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "../DashboardHeader";
import StatusPill from "../StatusPill";

export default async function MyPropertiesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#0B132B]">
      <DashboardHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold mb-1">
              My Properties
            </h1>
            <p className="text-sm text-slate-500">
              Only you can see and edit these listings.
            </p>
          </div>
          <Link
            href="/dashboard/properties/new"
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB703] to-[#FFD300] text-slate-900 hover:from-[#FFD300] hover:to-[#FFB703] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </Link>
        </div>

        {!listings || listings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <HomeIcon className="w-9 h-9 text-slate-300 mx-auto mb-3" />
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
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white border border-slate-200 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold pr-2">{listing.title}</h3>
                  <StatusPill status={listing.status} />
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  {[listing.address, listing.city, listing.state]
                    .filter(Boolean)
                    .join(", ") || "No address yet"}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  {listing.bedrooms != null && (
                    <span className="flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5" />
                      {listing.bedrooms} bd
                    </span>
                  )}
                  {listing.bathrooms != null && (
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5" />
                      {listing.bathrooms} ba
                    </span>
                  )}
                  {listing.price != null && (
                    <span className="ml-auto font-semibold text-[#0B132B]">
                      ${listing.price}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
