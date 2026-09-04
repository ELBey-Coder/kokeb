import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

async function approveListing(formData) {
  "use server";

  const listingId = formData.get("listingId");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin =
    profile?.role === "platform_admin" ||
    profile?.role === "admin_owner";

  if (!isAdmin) {
    throw new Error("You do not have permission to publish listings.");
  }

  const { error } = await supabase
    .from("listings")
    .update({
      status: "published",
    })
    .eq("id", listingId)
    .eq("status", "pending");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/listings");
  revalidatePath("/");
}

async function sendBackToDraft(formData) {
  "use server";

  const listingId = formData.get("listingId");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin =
    profile?.role === "platform_admin" ||
    profile?.role === "admin_owner";

  if (!isAdmin) {
    throw new Error("You do not have permission to review listings.");
  }

  const { error } = await supabase
    .from("listings")
    .update({
      status: "draft",
    })
    .eq("id", listingId)
    .eq("status", "pending");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/listings");
}

export default async function AdminListingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  const isAdmin =
    profile?.role === "platform_admin" ||
    profile?.role === "admin_owner";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md text-center">
          <h1 className="font-serif text-2xl font-semibold mb-2">
            Admin access required
          </h1>

          <p className="text-sm text-slate-500 mb-5">
            This page is only available to Kokeb administrators.
          </p>

          <Link
            href="/dashboard"
            className="inline-flex px-4 py-2.5 rounded-xl bg-[#0B132B] text-white text-sm font-semibold"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { data: listings, error } = await supabase
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
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Could not load pending listings:", error.message);
  }

  const ownerIds = [
    ...new Set(
      (listings || [])
        .map((listing) => listing.owner_id)
        .filter(Boolean)
    ),
  ];

  let ownerMap = {};

  if (ownerIds.length > 0) {
    const { data: owners } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", ownerIds);

    ownerMap = Object.fromEntries(
      (owners || []).map((owner) => [
        owner.id,
        owner,
      ])
    );
  }

  const listingsWithPhotos = await Promise.all(
    (listings || []).map(async (listing) => {
      const photos = [...(listing.listing_photos || [])].sort(
        (a, b) => a.sort_order - b.sort_order
      );

      const cover =
        photos.find((photo) => photo.is_cover) ||
        photos[0] ||
        null;

      let coverUrl = null;

      if (cover?.storage_path) {
        const { data } = await supabase.storage
          .from("listing-photos")
          .createSignedUrl(
            cover.storage_path,
            60 * 60
          );

        coverUrl = data?.signedUrl || null;
      }

      return {
        ...listing,
        coverUrl,
        owner: ownerMap[listing.owner_id] || null,
      };
    })
  );

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#0B132B]">
      <header className="bg-[#0B132B] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#FFB703] font-semibold">
              Kokeb Admin
            </p>

            <h1 className="font-serif text-2xl font-semibold">
              Listing Review
            </h1>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-semibold mb-1">
            Pending Listings
          </h2>

          <p className="text-sm text-slate-500">
            Review customer submissions before they appear publicly on Kokeb.
          </p>
        </div>

        {listingsWithPhotos.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Clock3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />

            <h3 className="font-semibold mb-2">
              Nothing waiting for review
            </h3>

            <p className="text-sm text-slate-500">
              Customer listings will appear here after they click Submit for Review.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {listingsWithPhotos.map((listing) => {
              const location =
                [listing.city, listing.state]
                  .filter(Boolean)
                  .join(", ") ||
                listing.address ||
                "Location not provided";

              return (
                <article
                  key={listing.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
                >
                  <div className="grid md:grid-cols-[260px_1fr]">
                    <div className="relative min-h-[220px] bg-slate-100">
                      {listing.coverUrl ? (
                        <img
                          src={listing.coverUrl}
                          alt={listing.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                          <ImageIcon className="w-9 h-9 mb-2" />
                          <span className="text-xs">
                            No photo
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                        <div>
                          <p className="text-xs uppercase tracking-wider font-semibold text-[#3E8E8A] mb-1">
                            {listing.category}
                          </p>

                          <h3 className="font-serif text-2xl font-semibold">
                            {listing.title}
                          </h3>
                        </div>

                        <span className="inline-flex self-start bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                          Pending Review
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <MapPin className="w-4 h-4" />
                        {location}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 text-sm mb-5">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-400">
                            Submitted by
                          </p>

                          <p className="font-semibold">
                            {listing.owner?.full_name ||
                              listing.owner?.email ||
                              "Property owner"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-400">
                            Price
                          </p>

                          <p className="font-semibold">
                            {listing.price != null
                              ? `$${Number(
                                  listing.price
                                ).toLocaleString()}${
                                  listing.pricing_unit
                                    ? ` / ${listing.pricing_unit}`
                                    : ""
                                }`
                              : "Not provided"}
                          </p>
                        </div>
                      </div>

                      {listing.description && (
                        <p className="text-sm text-slate-600 leading-relaxed mb-6">
                          {listing.description}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3">
                        <form action={approveListing}>
                          <input
                            type="hidden"
                            name="listingId"
                            value={listing.id}
                          />

                          <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve & Publish
                          </button>
                        </form>

                        <form action={sendBackToDraft}>
                          <input
                            type="hidden"
                            name="listingId"
                            value={listing.id}
                          />

                          <button
                            type="submit"
                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                          >
                            Send Back to Draft
                          </button>
                        </form>

                        <Link
                          href={`/listing/${listing.id}`}
                          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                        >
                          View Listing
                        </Link>
                      </div>
                    </div>
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