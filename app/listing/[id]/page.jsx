import Link from "next/link";
import { getListingById } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";
import ListingDetailClient from "./ListingDetailClient";

async function getPublishedSupabaseListing(id) {
  const supabase = await createClient();

  const { data: listing, error } = await supabase
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
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error || !listing) {
    return null;
  }

  const photos = [...(listing.listing_photos || [])].sort(
    (a, b) => {
      if (a.is_cover && !b.is_cover) return -1;
      if (!a.is_cover && b.is_cover) return 1;
      return a.sort_order - b.sort_order;
    }
  );

  const photoGallery = [];

  for (const photo of photos) {
    const { data } = await supabase.storage
      .from("listing-photos")
      .createSignedUrl(photo.storage_path, 60 * 60);

    if (data?.signedUrl) {
      photoGallery.push(data.signedUrl);
    }
  }

  return {
    id: listing.id,
    title: listing.title,
    category: listing.category || "homes",
    type: listing.property_type || "Property",

    location:
      [listing.address, listing.city, listing.state, listing.zip]
        .filter(Boolean)
        .join(", ") || "Location available on request",

    guests: listing.guests || null,
    beds: listing.bedrooms ?? listing.beds ?? null,
    baths: listing.bathrooms ?? listing.baths ?? null,

    rating: null,

    description: listing.description || "",

    amenities: listing.amenities || [],
    rules: listing.rules || [],

    availability: listing.availability || null,
    contact_phone: listing.contact_phone || null,

    price: listing.price,
    pricing_unit: listing.pricing_unit || null,

    square_feet: listing.square_feet || null,
    commercial_use: listing.commercial_use || null,
    lease_type: listing.lease_type || null,

    photo_url: photoGallery[0] || null,
    photo_gallery: photoGallery,

    policies: null,
    bookingUrl: null,

    source: "supabase",
  };
}

export default async function ListingDetailPage({ params }) {
  const { id } = await params;

  // First keep the original Kokeb listings working.
  const originalListing = getListingById(id);

  // If it is not one of the original listings, look for
  // a customer-created published listing in Supabase.
  const listing =
    originalListing ||
    (await getPublishedSupabaseListing(id));

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-slate-100 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-serif font-semibold mb-3">
            Listing not found
          </h1>

          <p className="text-sm text-slate-400 mb-6">
            This listing may still be under review, may have been removed,
            or the link may be out of date.
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