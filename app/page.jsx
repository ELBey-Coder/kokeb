"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Sparkles,
  User,
  BedDouble,
  Bath,
  Building2,
} from "lucide-react";
import { CATEGORIES, LISTINGS } from "@/lib/listings";
import { createClient } from "@/lib/supabase/client";

const CATEGORY_LABELS = {
  homes: "Homes",
  "long-term": "Long-term",
  commercial: "Commercial",
  services: "Services",
  vibes: "Vibes",
};

export default function Home() {
  const supabase = useMemo(() => createClient(), []);

  const [activeCategory, setActiveCategory] = useState("homes");
  const [query, setQuery] = useState("");
  const [databaseListings, setDatabaseListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPublishedListings() {
      setLoading(true);

      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          listing_photos (
            id,
            storage_path,
            is_cover,
            sort_order
          )
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Could not load public listings:", error.message);

        if (!cancelled) {
          setDatabaseListings([]);
          setLoading(false);
        }

        return;
      }

      const rows = await Promise.all(
        (data || []).map(async (listing) => {
          const photos = [...(listing.listing_photos || [])].sort(
            (a, b) => a.sort_order - b.sort_order
          );

          const cover =
            photos.find((photo) => photo.is_cover) ||
            photos[0] ||
            null;

          let photoUrl = null;

          if (cover?.storage_path) {
            const { data: signed } = await supabase.storage
              .from("listing-photos")
              .createSignedUrl(cover.storage_path, 60 * 60);

            photoUrl = signed?.signedUrl || null;
          }

          return {
            id: listing.id,
            title: listing.title,
            category: listing.category || "homes",
            type: listing.property_type || "Property",
            location:
              [listing.city, listing.state]
                .filter(Boolean)
                .join(", ") ||
              listing.address ||
              "Location available on request",

            guests: listing.guests || null,
            beds: listing.bedrooms ?? listing.beds ?? null,
            baths: listing.bathrooms ?? listing.baths ?? null,

            rating: null,

            price: listing.price,
            pricing_unit: listing.pricing_unit,

            square_feet: listing.square_feet,
            commercial_use: listing.commercial_use,

            photo_url: photoUrl,

            source: "supabase",
          };
        })
      );

      if (!cancelled) {
        setDatabaseListings(rows);
        setLoading(false);
      }
    }

    loadPublishedListings();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const allListings = useMemo(() => {
    const originalListings = LISTINGS.map((listing) => ({
      ...listing,
      category: listing.category || "homes",
      source: "original",
    }));

    return [...databaseListings, ...originalListings];
  }, [databaseListings]);

  const visibleListings = useMemo(() => {
    const q = query.trim().toLowerCase();

    return allListings.filter((listing) => {
      const correctCategory =
        (listing.category || "homes") === activeCategory;

      if (!correctCategory) {
        return false;
      }

      if (!q) {
        return true;
      }

      return [
        listing.title,
        listing.location,
        listing.type,
        CATEGORY_LABELS[listing.category],
      ]
        .filter(Boolean)
        .some((field) =>
          String(field).toLowerCase().includes(q)
        );
    });
  }, [allListings, activeCategory, query]);

  const activeCategoryData = CATEGORIES.find(
    (category) => category.slug === activeCategory
  );

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#0B132B] font-sans">
      <header className="sticky top-0 z-40 bg-[#0B132B]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">

          <div className="flex items-center justify-between mb-6">

            <Link href="/" className="flex items-center">
              <Image
                src="/kokeb-logo-light.png"
                alt="Kokeb"
                width={150}
                height={66}
                className="w-[150px] h-[66px]"
                priority
              />
            </Link>

            <Link
              href="/auth"
              className="flex items-center gap-2 text-sm font-medium text-slate-100 border border-slate-700 rounded-full px-4 py-2 hover:border-slate-500 transition-colors"
            >
              <User className="w-4 h-4" />
              Sign in
            </Link>

          </div>

          <div className="relative mb-5">

            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city, property or listing name"
              className="w-full bg-white rounded-full pl-11 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB703]"
            />

          </div>

          <nav className="flex gap-6 overflow-x-auto no-scrollbar text-sm font-semibold">

            {CATEGORIES.map((category) => (

              <button
                key={category.slug}
                onClick={() =>
                  setActiveCategory(category.slug)
                }
                className={`whitespace-nowrap pb-3 border-b-2 transition-colors ${
                  activeCategory === category.slug
                    ? "text-white border-[#FFB703]"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                {category.label}
              </button>

            ))}

          </nav>

        </div>

        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-emerald-600" />
          <div className="h-full w-1/3 bg-[#FFD300]" />
          <div className="h-full w-1/3 bg-rose-600" />
        </div>

      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">

          <div>

            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-[#3E8E8A] mb-1">
              {activeCategoryData?.label || "Marketplace"}
            </p>

            <h1 className="font-serif text-2xl sm:text-3xl font-semibold">
              {activeCategory === "homes"
                ? "Places to stay"
                : activeCategory === "long-term"
                ? "Long-term rentals"
                : activeCategory === "commercial"
                ? "Commercial opportunities"
                : activeCategory === "services"
                ? "Services"
                : "Vibes"}
            </h1>

          </div>

          <span className="text-sm text-slate-500">
            {loading
              ? "Loading..."
              : `${visibleListings.length} ${
                  visibleListings.length === 1
                    ? "listing"
                    : "listings"
                }`}
          </span>

        </div>

        {activeCategory !== "homes" ? (
  <div className="text-center py-20">
    <Sparkles className="w-8 h-8 text-[#FFB703] mx-auto mb-4" />

    <h2 className="font-serif text-xl font-semibold mb-2">
      {activeCategoryData?.label} — coming soon
    </h2>

    <p className="text-sm text-slate-500 max-w-sm mx-auto">
      This category is part of Kokeb and will be available in a future update.
    </p>
  </div>
) : loading ? (
  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
    Loading listings...
  </div>
) : visibleListings.length === 0 ? (
  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
    <Sparkles className="w-8 h-8 text-[#FFB703] mx-auto mb-3" />

    <h2 className="font-serif text-xl font-semibold mb-2">
      No homes available yet
    </h2>

    <p className="text-sm text-slate-500">
      Approved short-term home listings will appear here automatically.
    </p>
  </div>
) : (
  <div className="grid gap-6 sm:grid-cols-2">
    {visibleListings.map((listing) => (
      <ListingCard
        key={`${listing.source}-${listing.id}`}
        listing={listing}
      />
    ))}
  </div>
)}
          

      </main>

      <footer className="bg-[#0B132B] text-white mt-12">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          <div className="flex items-center gap-2">

            <Image
              src="/kokeb-mark.png"
              alt=""
              width={28}
              height={12}
              className="w-[28px] h-[12px]"
            />

            <span className="font-serif text-xl font-bold">
              Kokeb
            </span>

          </div>

          <p className="text-sm text-slate-400">
            Every stay has a story.
          </p>

        </div>

      </footer>
    </div>
  );
}

function ListingCard({ listing }) {
  const category =
    CATEGORY_LABELS[listing.category] ||
    listing.category ||
    "Listing";

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="block bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow"
    >

      <div className="relative w-full aspect-[4/3] bg-slate-100">

        {listing.photo_url ? (
          <img
            src={listing.photo_url}
            alt={listing.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">

            <Sparkles className="w-8 h-8 mb-2" />

            <span className="text-xs">
              Photo coming soon
            </span>

          </div>
        )}

        <span className="absolute top-3 left-3 bg-[#0B132B]/90 text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full">
          {category}
        </span>

      </div>

      <div className="p-5">

        <div className="flex items-start justify-between gap-3 mb-1">

          <h2 className="font-serif text-xl font-semibold leading-snug">
            {listing.title}
          </h2>

          {listing.rating ? (
            <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0 pt-1">

              <Star className="w-3.5 h-3.5 fill-[#FFB703] text-[#FFB703]" />

              <span className="font-semibold text-slate-700">
                {listing.rating}
              </span>

            </div>
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-[#3E8E8A] font-semibold shrink-0 pt-1.5">
              New
            </span>
          )}

        </div>

        <p className="text-sm text-slate-600 mb-2">
          {listing.type}
        </p>

        <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">

          <MapPin className="w-3.5 h-3.5 shrink-0" />

          <span>
            {listing.location}
          </span>

        </div>

        {(listing.category === "homes" ||
          listing.category === "long-term") && (

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">

            {listing.beds != null && (
              <span className="flex items-center gap-1">
                <BedDouble className="w-4 h-4" />
                {listing.beds}{" "}
                {listing.beds === 1 ? "bed" : "beds"}
              </span>
            )}

            {listing.baths != null && (
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                {listing.baths}{" "}
                {Number(listing.baths) === 1
                  ? "bath"
                  : "baths"}
              </span>
            )}

          </div>

        )}

        {listing.category === "commercial" && (

          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">

            <Building2 className="w-4 h-4" />

            <span>
              {listing.square_feet
                ? `${Number(
                    listing.square_feet
                  ).toLocaleString()} sq ft`
                : listing.commercial_use ||
                  "Commercial property"}
            </span>

          </div>

        )}

        {listing.price != null && (

          <div className="border-t border-slate-100 pt-4">

            <span className="font-bold text-lg">
              ${Number(listing.price).toLocaleString()}
            </span>

            {listing.pricing_unit && (
              <span className="text-sm text-slate-500">
                {" "}
                / {listing.pricing_unit}
              </span>
            )}

          </div>

        )}

      </div>

    </Link>
  );
}