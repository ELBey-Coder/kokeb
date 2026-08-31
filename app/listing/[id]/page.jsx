import Link from "next/link";
import { getListingById } from "@/lib/listings";
import ListingDetailClient from "./ListingDetailClient";

// Server Component: resolves the dynamic route id (Next.js 15+ delivers
// `params` as a Promise, so it must be awaited here) and looks up the
// matching listing. In production, swap getListingById for a Supabase
// query keyed on this same id.
export default async function ListingDetailPage({ params }) {
  const { id } = await params;
  const listing = getListingById(id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-slate-100 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-serif font-semibold mb-3">Listing not found</h1>
          <p className="text-sm text-slate-400 mb-6">
            We couldn't find a listing with id "{id}". It may have been
            removed, or the link might be out of date.
          </p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-[#FFB703] to-[#FFD300] text-slate-900 font-semibold px-6 py-3 rounded-xl"
          >
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  return <ListingDetailClient listing={listing} />;
}
