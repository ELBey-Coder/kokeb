"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Star, Sparkles, User } from "lucide-react";
import { CATEGORIES, LISTINGS } from "@/lib/listings";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("homes");
  const [query, setQuery] = useState("");

  const visibleListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LISTINGS;
    return LISTINGS.filter((listing) =>
      [listing.title, listing.location, listing.type].some((field) =>
        field.toLowerCase().includes(q)
      )
    );
  }, [query]);

  const activeCategoryData = CATEGORIES.find((c) => c.slug === activeCategory);

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#0B132B] font-sans">
      {/* ===================================================================
          SITE HEADER (sticky navy band: logo, sign in, search, category tabs)
          =================================================================== */}
      <header className="sticky top-0 z-40 bg-[#0B132B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          {/* Logo row */}
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

          {/* Search bar */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city or listing name"
              className="w-full bg-white rounded-full pl-11 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB703]"
            />
          </div>

          {/* Category tabs */}
          <nav className="flex gap-6 overflow-x-auto no-scrollbar text-sm font-semibold">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`whitespace-nowrap pb-3 border-b-2 transition-colors ${
                  activeCategory === cat.slug
                    ? "text-white border-[#FFB703]"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Ethiopian heritage accent stripe */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-emerald-600" />
          <div className="h-full w-1/3 bg-[#FFD300]" />
          <div className="h-full w-1/3 bg-rose-600" />
        </div>
      </header>

      {/* ===================================================================
          MAIN CONTENT
          =================================================================== */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {activeCategoryData?.available ? (
          <>
            <div className="flex items-baseline justify-between mb-5">
              <h1 className="text-xl font-serif font-semibold">
                {query ? `Results for "${query}"` : "Homes to book"}
              </h1>
              <span className="text-xs text-slate-500">
                {visibleListings.length} {visibleListings.length === 1 ? "stay" : "stays"}
              </span>
            </div>

            {visibleListings.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <p className="text-sm">No listings match "{query}" yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {visibleListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </>
        ) : (
          <ComingSoon label={activeCategoryData?.label} />
        )}
      </main>

      <footer className="bg-[#0B132B] text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/kokeb-mark.png" alt="" width={28} height={12} className="w-[28px] h-[12px]" />
            <span className="font-serif text-xl font-bold">Kokeb</span>
          </div>
          <p className="text-sm text-slate-400">Every stay has a story.</p>
        </div>
      </footer>
    </div>
  );
}

function ListingCard({ listing }) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="block bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow"
    >
      <div className="relative w-full aspect-[4/3] bg-slate-100">
        {listing.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.photo_url}
            alt={listing.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-slate-300" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="font-serif text-lg font-semibold leading-snug">{listing.title}</h3>
          {listing.rating ? (
            <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0 pt-1">
              <Star className="w-3.5 h-3.5 fill-[#FFB703] text-[#FFB703]" />
              <span className="font-semibold text-slate-700">{listing.rating}</span>
            </div>
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-[#3E8E8A] font-semibold shrink-0 pt-1.5">
              New
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>{listing.location}</span>
        </div>
        <p className="text-sm text-slate-500">
          {listing.guests} guests · {listing.beds} {listing.beds === 1 ? "bed" : "beds"} ·{" "}
          {listing.baths} {listing.baths === 1 ? "bath" : "baths"}
        </p>
      </div>
    </Link>
  );
}

function ComingSoon({ label }) {
  return (
    <div className="text-center py-20">
      <Sparkles className="w-8 h-8 text-[#FFB703] mx-auto mb-4" />
      <h2 className="font-serif text-xl font-semibold mb-2">{label} — coming soon</h2>
      <p className="text-sm text-slate-500 max-w-sm mx-auto">
        This category isn't built out yet. It's on the roadmap — check back soon.
      </p>
    </div>
  );
}
