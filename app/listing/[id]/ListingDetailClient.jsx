"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Users,
  BedDouble,
  Bath,
  ChevronRight,
  Star,
  ShieldCheck,
  Clock,
  Check,
  ExternalLink,
  Ban,
  PawPrint,
  Phone,
  Building2,
} from "lucide-react";

const CATEGORY_LABELS = {
  homes: "Homes",
  "long-term": "Long-term",
  commercial: "Commercial",
  services: "Services",
  vibes: "Vibes",
};

function formatPriceUnit(unit) {
  if (!unit) return "";
  if (unit === "flat") return " total";
  return ` / ${unit}`;
}

export default function ListingDetailClient({ listing }) {
  const gallery = listing.photo_gallery?.length
    ? listing.photo_gallery
    : listing.photo_url
    ? [listing.photo_url]
    : [];

  const mainPhoto = gallery[0] || listing.photo_url || null;
  const extraPhotos = gallery.slice(1);

  const categoryLabel =
    CATEGORY_LABELS[listing.category] || "Homes";

  const hasStayStats =
    listing.guests != null ||
    listing.beds != null ||
    listing.baths != null;

  const hasCommercialDetails =
    listing.category === "commercial" &&
    (listing.square_feet ||
      listing.commercial_use ||
      listing.lease_type);

  const hasRules =
    Array.isArray(listing.rules) &&
    listing.rules.length > 0;

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 font-sans selection:bg-[#FFB703] selection:text-[#0B132B]">

      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-emerald-600" />
        <div className="h-full w-1/3 bg-[#FFD300]" />
        <div className="h-full w-1/3 bg-rose-600" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Image
              src="/kokeb-logo-light.png"
              alt="Kokeb"
              width={140}
              height={62}
              className="w-[140px] h-[62px]"
              priority
            />
          </Link>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-6 uppercase tracking-wider">

          <Link
            href="/"
            className="hover:text-slate-200 transition-colors"
          >
            Marketplace
          </Link>

          <ChevronRight className="w-3 h-3 text-[#5BC0BE]" />

          <Link
            href="/"
            className="hover:text-slate-200 transition-colors"
          >
            {categoryLabel}
          </Link>

          <ChevronRight className="w-3 h-3 text-[#5BC0BE]" />

          <span className="text-[#FFB703] font-medium">
            {listing.title}
          </span>

        </div>

        {/* PHOTO GALLERY */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 rounded-2xl overflow-hidden border border-slate-800 bg-[#16223F] p-2">

          <div className="md:col-span-2 relative min-h-[350px] md:min-h-[450px] rounded-xl overflow-hidden bg-slate-900">

            {mainPhoto ? (
              <img
                src={mainPhoto}
                alt={listing.title}
                className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0B132B] via-[#16223F] to-[#5BC0BE] flex items-center justify-center p-8 text-center">
                <p className="text-sm text-slate-400 italic font-serif">
                  No photo available yet.
                </p>
              </div>
            )}

            <div className="absolute top-4 left-4 bg-[#0B132B]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-xs font-semibold text-[#FFB703] flex items-center space-x-1">

              <Star className="w-3 h-3 fill-[#FFD300] text-[#FFD300]" />

              <span>
                {listing.source === "supabase"
                  ? "Kokeb Listing"
                  : "Real Listing"}
              </span>

            </div>

          </div>

          <div className="hidden md:flex flex-col gap-4">

            {extraPhotos.slice(0, 2).map((photo, index) => (

              <div
                key={`${photo}-${index}`}
                className="flex-1 relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800"
              >

                <img
                  src={photo}
                  alt={`${listing.title} — photo ${index + 2}`}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />

              </div>

            ))}

          </div>

        </div>

        {extraPhotos.length > 2 && (

          <div className="grid grid-cols-3 gap-3 mb-10 md:hidden">

            {extraPhotos.slice(2).map((photo, index) => (

              <div
                key={`${photo}-${index}`}
                className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 border border-slate-800"
              >

                <img
                  src={photo}
                  alt={`${listing.title} — photo ${index + 4}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />

              </div>

            ))}

          </div>

        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* LEFT COLUMN */}

          <div className="lg:col-span-2 space-y-8">

            <div>

              <h1 className="text-3xl md:text-4xl font-serif font-semibold text-slate-100 tracking-tight leading-tight mb-3">
                {listing.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">

                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-[#5BC0BE]" />
                  <span>{listing.location}</span>
                </div>

                <span className="hidden sm:inline text-slate-700">•</span>

                <span className="bg-[#16223F] border border-slate-800 px-2 py-0.5 rounded text-xs text-[#5BC0BE]">
                  {listing.type}
                </span>

                {listing.rating && (
                  <>
                    <span className="hidden sm:inline text-slate-700">•</span>

                    <div className="flex items-center gap-1 text-[#FFB703]">

                      <Star className="w-3.5 h-3.5 fill-[#FFD300] text-[#FFD300]" />

                      <span className="font-semibold">
                        {listing.rating}
                      </span>

                    </div>
                  </>
                )}

              </div>

            </div>

            {/* RESIDENTIAL DETAILS */}

            {hasStayStats && (

              <div className="flex flex-wrap gap-6 p-4 rounded-xl bg-[#16223F] border border-slate-800">

                {listing.guests != null && (

                  <div className="flex items-center gap-2 text-sm text-slate-300">

                    <Users className="w-4 h-4 text-[#5BC0BE]" />

                    <span>
                      {listing.guests}{" "}
                      {listing.guests === 1 ? "guest" : "guests"}
                    </span>

                  </div>

                )}

                {listing.beds != null && (

                  <div className="flex items-center gap-2 text-sm text-slate-300">

                    <BedDouble className="w-4 h-4 text-[#5BC0BE]" />

                    <span>
                      {listing.beds}{" "}
                      {Number(listing.beds) === 1
                        ? "bedroom"
                        : "bedrooms"}
                    </span>

                  </div>

                )}

                {listing.baths != null && (

                  <div className="flex items-center gap-2 text-sm text-slate-300">

                    <Bath className="w-4 h-4 text-[#5BC0BE]" />

                    <span>
                      {listing.baths}{" "}
                      {Number(listing.baths) === 1
                        ? "bathroom"
                        : "bathrooms"}
                    </span>

                  </div>

                )}

              </div>

            )}

            {/* COMMERCIAL */}

            {hasCommercialDetails && (

              <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-[#16223F] border border-slate-800 text-sm text-slate-300">

                <Building2 className="w-4 h-4 text-[#5BC0BE]" />

                {listing.square_feet && (
                  <span>
                    {Number(listing.square_feet).toLocaleString()} sq ft
                  </span>
                )}

                {listing.commercial_use && (
                  <span>{listing.commercial_use}</span>
                )}

                {listing.lease_type && (
                  <span>{listing.lease_type}</span>
                )}

              </div>

            )}

            {/* DESCRIPTION */}

            {listing.description && (

              <div className="prose prose-invert max-w-none">

                <h2 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-800 pb-2">
                  About this listing
                </h2>

                <p className="text-slate-300 leading-relaxed">
                  {listing.description}
                </p>

              </div>

            )}

            {/* AMENITIES */}

            {listing.amenities &&
              listing.amenities.length > 0 && (

                <div className="space-y-4">

                  <div className="border-b border-slate-800 pb-2">

                    <h3 className="text-lg font-semibold text-slate-200">
                      Amenities & Features
                    </h3>

                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {listing.amenities.map((amenity) => (

                      <div
                        key={amenity}
                        className="flex items-center gap-2 text-sm text-slate-300"
                      >

                        <Check className="w-4 h-4 text-[#FFB703] shrink-0" />

                        <span>{amenity}</span>

                      </div>

                    ))}

                  </div>

                </div>

              )}

            {/* ORIGINAL LISTING POLICIES */}

            {listing.policies && (

              <div className="space-y-4">

                <div className="border-b border-slate-800 pb-2">

                  <h3 className="text-lg font-semibold text-slate-200">
                    Good to Know
                  </h3>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

                  <div className="flex items-center gap-2 text-slate-300">

                    <Clock className="w-4 h-4 text-[#5BC0BE] shrink-0" />

                    <span>
                      Check-in {listing.policies.checkIn} · Check-out{" "}
                      {listing.policies.checkOut}
                    </span>

                  </div>

                  <div className="flex items-center gap-2 text-slate-300">

                    <PawPrint className="w-4 h-4 text-[#5BC0BE] shrink-0" />

                    <span>
                      Pets: {listing.policies.pets}
                    </span>

                  </div>

                  <div className="flex items-center gap-2 text-slate-300">

                    <Ban className="w-4 h-4 text-[#5BC0BE] shrink-0" />

                    <span>
                      Smoking: {listing.policies.smoking}
                    </span>

                  </div>

                </div>

                {listing.policies.cancellation && (

                  <div className="text-sm text-slate-400 space-y-1 pt-1">

                    {listing.policies.cancellation.map((line) => (
                      <p key={line}>{line}</p>
                    ))}

                  </div>

                )}

              </div>

            )}

            {/* CUSTOMER RULES */}

            {hasRules && (

              <div className="space-y-4">

                <div className="border-b border-slate-800 pb-2">

                  <h3 className="text-lg font-semibold text-slate-200">
                    Rules & Policies
                  </h3>

                </div>

                <div className="space-y-2">

                  {listing.rules.map((rule) => (

                    <div
                      key={rule}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >

                      <Check className="w-4 h-4 text-[#FFB703] shrink-0" />

                      <span>{rule}</span>

                    </div>

                  ))}

                </div>

              </div>

            )}

          </div>

          {/* RIGHT COLUMN */}

          <aside className="bg-[#16223F] rounded-2xl border border-slate-800 p-6 shadow-xl sticky top-8">

            {listing.price != null && (

              <div className="mb-5">

                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                  Price
                </p>

                <p className="text-2xl font-bold text-white">

                  ${Number(listing.price).toLocaleString()}

                  <span className="text-sm font-normal text-slate-400">
                    {formatPriceUnit(listing.pricing_unit)}
                  </span>

                </p>

              </div>

            )}

            {/* ORIGINAL BOOKING URL */}

            {listing.bookingUrl ? (

              <>

                <p className="text-sm text-slate-400 mb-4">
                  Live availability and rates are managed on the official booking site.
                </p>

                <a
                  href={listing.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#FFB703] to-[#FFD300] hover:from-[#FFD300] hover:to-[#FFB703] text-slate-900 shadow-lg shadow-[#FFB703]/20 transition-all"
                >
                  Check availability & book
                  <ExternalLink className="w-4 h-4" />
                </a>

              </>

            ) : (

              <>

                {listing.availability && (

                  <div className="mb-5">

                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                      Availability
                    </p>

                    <p className="text-sm text-slate-200">
                      {listing.availability}
                    </p>

                  </div>

                )}

                {listing.contact_phone ? (

                  <a
                    href={`tel:${listing.contact_phone}`}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#FFB703] to-[#FFD300] hover:from-[#FFD300] hover:to-[#FFB703] text-slate-900 shadow-lg shadow-[#FFB703]/20 transition-all"
                  >

                    <Phone className="w-4 h-4" />

                    Contact property owner

                  </a>

                ) : (

                  <p className="text-sm text-slate-400">
                    Contact information will be provided by the property owner.
                  </p>

                )}

              </>

            )}

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-3.5">

              <div className="flex items-center space-x-3 text-xs text-slate-400">

                <ShieldCheck className="w-4 h-4 text-[#5BC0BE] shrink-0" />

                <span>
                  <span className="font-semibold">
                    Kokeb listing
                  </span>{" "}
                  — only published listings are shown publicly.
                </span>

              </div>

              {listing.policies?.cancellation?.[0] && (

                <div className="flex items-center space-x-3 text-xs text-slate-400">

                  <Clock className="w-4 h-4 text-[#5BC0BE] shrink-0" />

                  <span>
                    <span className="font-semibold">
                      Flexible cancellation
                    </span>{" "}
                    — {listing.policies.cancellation[0].toLowerCase()}.
                  </span>

                </div>

              )}

            </div>

          </aside>

        </div>

      </div>

    </div>
  );
}