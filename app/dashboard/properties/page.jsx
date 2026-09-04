import { redirect } from "next/navigation";
import Link from "next/link";
import SubmitForReviewButton from "./SubmitForReviewButton";
import {
  Plus,
  Home as HomeIcon,
  BedDouble,
  Bath,
  MapPin,
  Building2,
  ImageIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader from "../DashboardHeader";
import StatusPill from "../StatusPill";

const CATEGORY_LABELS = {
  homes: "Homes",
  "long-term": "Long-term",
  commercial: "Commercial",
  services: "Services",
  vibes: "Vibes",
};

const PRICE_LABELS = {
  night: "night",
  week: "week",
  month: "month",
  year: "year",
  flat: "total",
};

export default async function MyPropertiesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: listings, error } = await supabase
    .from("listings")
    .select(
      `
      *,
      listing_photos (
        id,
        storage_path,
        is_cover,
        sort_order
      )
    `,
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Could not load listings:", error.message);
  }

  const listingsWithPhotos = await Promise.all(
    (listings || []).map(async (listing) => {
      const photos = [...(listing.listing_photos || [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );

      const cover = photos.find((photo) => photo.is_cover) || photos[0] || null;

      let coverUrl = null;

      if (cover?.storage_path) {
        const { data } = await supabase.storage
          .from("listing-photos")
          .createSignedUrl(cover.storage_path, 60 * 60);

        coverUrl = data?.signedUrl || null;
      }

      return {
        ...listing,
        coverUrl,
        photoCount: photos.length,
      };
    }),
  );

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#0B132B]">
      <DashboardHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold mb-1">
              My Properties
            </h1>

            <p className="text-sm text-slate-500">
              Manage your listings, photos, categories and publishing status.
            </p>
          </div>

          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FFB703] to-[#FFD300] text-slate-900 hover:from-[#FFD300] hover:to-[#FFB703] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Listing
          </Link>
        </div>

        {listingsWithPhotos.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <HomeIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />

            <h2 className="font-semibold mb-2">No listings yet</h2>

            <p className="text-sm text-slate-500 mb-5">
              Add your first Kokeb listing and upload your own property photos.
            </p>

            <Link
              href="/dashboard/properties/new"
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-[#0B132B] text-white hover:bg-[#16223F]"
            >
              <Plus className="w-4 h-4" />
              Add your first listing
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listingsWithPhotos.map((listing) => {
              const location =
                [listing.city, listing.state].filter(Boolean).join(", ") ||
                listing.address ||
                "Location not added";

              const category =
                CATEGORY_LABELS[listing.category] ||
                listing.category ||
                "Listing";

              const priceUnit =
                PRICE_LABELS[listing.pricing_unit] || listing.pricing_unit;

              return (
                <article
                  key={listing.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {listing.coverUrl ? (
                      <img
                        src={listing.coverUrl}
                        alt={listing.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-9 h-9 mb-2" />
                        <span className="text-xs">No photos yet</span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      <span className="inline-flex bg-[#0B132B]/90 text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full">
                        {category}
                      </span>
                    </div>

                    {listing.photoCount > 0 && (
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full">
                        {listing.photoCount}{" "}
                        {listing.photoCount === 1 ? "photo" : "photos"}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h2 className="font-serif text-lg font-semibold leading-snug">
                        {listing.title}
                      </h2>

                      <StatusPill status={listing.status} />
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{location}</span>
                    </div>

                    {(listing.category === "homes" ||
                      listing.category === "long-term") && (
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                        {listing.bedrooms != null && (
                          <span className="flex items-center gap-1">
                            <BedDouble className="w-4 h-4" />
                            {listing.bedrooms} bed
                          </span>
                        )}

                        {listing.bathrooms != null && (
                          <span className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            {listing.bathrooms} bath
                          </span>
                        )}
                      </div>
                    )}

                    {listing.category === "commercial" && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                        <Building2 className="w-4 h-4" />

                        <span>
                          {listing.square_feet
                            ? `${listing.square_feet.toLocaleString()} sq ft`
                            : "Commercial property"}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-slate-100 pt-4 flex items-end justify-between gap-4">
                      <div>
                        {listing.price != null ? (
                          <>
                            <span className="font-bold text-lg">
                              ${Number(listing.price).toLocaleString()}
                            </span>

                            {priceUnit && (
                              <span className="text-xs text-slate-500">
                                {" "}
                                / {priceUnit}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Price not added
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-semibold text-[#3E8E8A]">
                        {listing.status === "draft"
                          ? "Draft listing"
                          : listing.status === "pending"
                            ? "Under review"
                            : "Live"}
                      </span>
                    </div>
                    {listing.status === "draft" && (
                      <SubmitForReviewButton listingId={listing.id} />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
