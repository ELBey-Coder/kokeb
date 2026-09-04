"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Check,
  Building2,
  Home,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "../../DashboardHeader";

const CATEGORY_OPTIONS = [
  {
    value: "homes",
    label: "Homes",
    help: "Short-term stays and vacation rentals",
  },
  {
    value: "long-term",
    label: "Long-term",
    help: "Monthly or yearly residential rentals",
  },
  {
    value: "commercial",
    label: "Commercial",
    help: "Office, retail, warehouse and business space",
  },
  {
    value: "services",
    label: "Services",
    help: "Property-related services",
  },
  {
    value: "vibes",
    label: "Vibes",
    help: "Experiences and lifestyle offerings",
  },
];

const AMENITIES = [
  "Wi-Fi",
  "Parking",
  "Kitchen",
  "Washer / Dryer",
  "Air conditioning",
  "Heating",
  "Furnished",
  "Pet friendly",
  "Wheelchair accessible",
  "Elevator",
  "Balcony / Patio",
  "Pool",
  "Gym",
  "Security",
  "EV charging",
  "Utilities included",
  "Private entrance",
  "Workspace",
  "Storage",
  "Loading access",
];

const initialForm = {
  title: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  category: "homes",
  property_type: "",
  bedrooms: "",
  bathrooms: "",
  price: "",
  description: "",
  availability: "",
  contact_phone: "",
  square_feet: "",
  commercial_use: "",
  lease_type: "",
  pricing_unit: "night",
  rules: "",
  other_amenities: "",
};

const inputClass =
  "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0B132B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB703]";

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
          {label}
        </label>

        {hint && (
          <p className="text-xs text-slate-400 mt-0.5">
            {hint}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}

export default function AddPropertyPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState(initialForm);
  const [amenities, setAmenities] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedCategory = useMemo(
    () => CATEGORY_OPTIONS.find((x) => x.value === form.category),
    [form.category]
  );

  const isResidential =
    form.category === "homes" ||
    form.category === "long-term";

  const isCommercial = form.category === "commercial";

  const update = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
    }));

  const toggleAmenity = (item) =>
    setAmenities((items) =>
      items.includes(item)
        ? items.filter((x) => x !== item)
        : [...items, item]
    );

  const handlePhotos = (e) => {
    const picked = Array.from(e.target.files || []);

    const valid = picked.filter(
      (file) =>
        file.type.startsWith("image/") &&
        file.size <= 5 * 1024 * 1024
    );

    if (valid.length !== picked.length) {
      setErrorMessage(
        "Each photo must be an image file and 5 MB or smaller."
      );
      setStatus("error");
    }

    setPhotos(valid.slice(0, 10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus("saving");
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const otherAmenities = form.other_amenities
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const allAmenities = Array.from(
      new Set([...amenities, ...otherAmenities])
    );

    const rules = form.rules
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const { data: listing, error: listingError } =
      await supabase
        .from("listings")
        .insert({
          owner_id: user.id,
          title: form.title,
          address: form.address || null,
          city: form.city || null,
          state: form.state || null,
          zip: form.zip || null,
          category: form.category,
          property_type: form.property_type || null,

          bedrooms:
            isResidential && form.bedrooms
              ? Number(form.bedrooms)
              : null,

          bathrooms:
            (isResidential || isCommercial) &&
            form.bathrooms
              ? Number(form.bathrooms)
              : null,

          price: form.price
            ? Number(form.price)
            : null,

          description: form.description || null,
          amenities: allAmenities,
          availability: form.availability || null,
          contact_phone: form.contact_phone || null,

          square_feet:
            isCommercial && form.square_feet
              ? Number(form.square_feet)
              : null,

          commercial_use:
            isCommercial
              ? form.commercial_use || null
              : null,

          lease_type:
            isCommercial
              ? form.lease_type || null
              : null,

          pricing_unit: form.pricing_unit || null,
          rules,
          status: "draft",
        })
        .select("id")
        .single();

    if (listingError) {
      setStatus("error");
      setErrorMessage(listingError.message);
      return;
    }

    if (photos.length) {
      const photoRows = [];

      for (let i = 0; i < photos.length; i += 1) {
        const file = photos[i];

        const cleanName = file.name
          .toLowerCase()
          .replace(/[^a-z0-9._-]+/g, "-");

        const path =
          `${user.id}/${listing.id}/` +
          `${Date.now()}-${i}-${cleanName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("listing-photos")
            .upload(path, file, {
              upsert: false,
            });

        if (uploadError) {
          setStatus("error");
          setErrorMessage(
            `Property saved, but photo upload failed: ${uploadError.message}`
          );
          return;
        }

        photoRows.push({
          listing_id: listing.id,
          owner_id: user.id,
          storage_path: path,
          alt_text: `${form.title} photo ${i + 1}`,
          is_cover: i === 0,
          sort_order: i,
        });
      }

      const { error: photoError } =
        await supabase
          .from("listing_photos")
          .insert(photoRows);

      if (photoError) {
        setStatus("error");
        setErrorMessage(
          `Property saved, but photo records failed: ${photoError.message}`
        );
        return;
      }
    }

    router.push("/dashboard/properties");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#0B132B]">
      <DashboardHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <Link
          href="/dashboard/properties"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B132B] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Properties
        </Link>

        <h1 className="font-serif text-3xl font-semibold mb-1">
          Add Listing
        </h1>

        <p className="text-sm text-slate-500 mb-8">
          Choose a Kokeb category, add details and photos,
          then save it as a private draft.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* CATEGORY */}

          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">

            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFB703]" />

              <h2 className="font-serif text-xl font-semibold">
                1. What are you listing?
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              {CATEGORY_OPTIONS.map((opt) => (

                <button
                  key={opt.value}
                  type="button"

                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      category: opt.value,

                      pricing_unit:
                        opt.value === "homes"
                          ? "night"
                          : opt.value === "long-term"
                          ? "month"
                          : f.pricing_unit,
                    }))
                  }

                  className={`text-left border rounded-xl p-4 transition ${
                    form.category === opt.value
                      ? "border-[#FFB703] ring-2 ring-[#FFB703]/30 bg-[#FFF8D8]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >

                  <div className="font-semibold">
                    {opt.label}
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    {opt.help}
                  </div>

                </button>

              ))}

            </div>

            <p className="text-xs text-slate-500">
              Selected:{" "}
              <strong>
                {selectedCategory?.label}
              </strong>
            </p>

          </section>

          {/* DETAILS */}

          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">

            <div className="flex items-center gap-2">

              {isCommercial ? (
                <Building2 className="w-5 h-5 text-[#3E8E8A]" />
              ) : (
                <Home className="w-5 h-5 text-[#3E8E8A]" />
              )}

              <h2 className="font-serif text-xl font-semibold">
                2. Listing details
              </h2>

            </div>

            <Field label="Listing Title">
              <input
                required
                value={form.title}
                onChange={update("title")}
                placeholder="e.g. Sunny Loft near Bole"
                className={inputClass}
              />
            </Field>

            <Field label="Street Address">
              <input
                value={form.address}
                onChange={update("address")}
                placeholder="123 Main St"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <Field label="City">
                <input
                  value={form.city}
                  onChange={update("city")}
                  className={inputClass}
                />
              </Field>

              <Field label="State">
                <input
                  value={form.state}
                  onChange={update("state")}
                  className={inputClass}
                />
              </Field>

              <Field label="ZIP Code">
                <input
                  value={form.zip}
                  onChange={update("zip")}
                  className={inputClass}
                />
              </Field>

            </div>

            <Field label="Property / Listing Type">
              <input
                value={form.property_type}
                onChange={update("property_type")}
                placeholder={
                  isCommercial
                    ? "Office, Retail, Warehouse..."
                    : "Apartment, Villa, Studio..."
                }
                className={inputClass}
              />
            </Field>

            {isResidential && (

              <div className="grid grid-cols-2 gap-3">

                <Field label="Bedrooms">
                  <input
                    type="number"
                    min="0"
                    value={form.bedrooms}
                    onChange={update("bedrooms")}
                    className={inputClass}
                  />
                </Field>

                <Field label="Bathrooms">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.bathrooms}
                    onChange={update("bathrooms")}
                    className={inputClass}
                  />
                </Field>

              </div>

            )}

            {isCommercial && (

              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-3">

                  <Field label="Square Feet">
                    <input
                      type="number"
                      min="0"
                      value={form.square_feet}
                      onChange={update("square_feet")}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Bathrooms">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={form.bathrooms}
                      onChange={update("bathrooms")}
                      className={inputClass}
                    />
                  </Field>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <Field label="Commercial Use">
                    <input
                      value={form.commercial_use}
                      onChange={update("commercial_use")}
                      placeholder="Retail, office, warehouse..."
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Lease Type">
                    <input
                      value={form.lease_type}
                      onChange={update("lease_type")}
                      placeholder="Full service, NNN, sale..."
                      className={inputClass}
                    />
                  </Field>

                </div>

              </div>

            )}

            <div className="grid grid-cols-2 gap-3">

              <Field label="Price">
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={update("price")}
                  className={inputClass}
                />
              </Field>

              <Field label="Price Is Per">

                <select
                  value={form.pricing_unit}
                  onChange={update("pricing_unit")}
                  className={inputClass}
                >
                  <option value="night">Night</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                  <option value="flat">Flat price</option>
                </select>

              </Field>

            </div>

            <Field label="Description">

              <textarea
                rows={5}
                value={form.description}
                onChange={update("description")}
                placeholder="Describe the property, space, neighborhood and what makes it useful."
                className={inputClass}
              />

            </Field>

          </section>

          {/* AMENITIES */}

          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">

            <h2 className="font-serif text-xl font-semibold">
              3. Amenities & features
            </h2>

            <p className="text-sm text-slate-500">
              Choose everything that applies.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

              {AMENITIES.map((item) => (

                <button
                  key={item}
                  type="button"
                  onClick={() => toggleAmenity(item)}

                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm ${
                    amenities.includes(item)
                      ? "border-[#3E8E8A] bg-[#3E8E8A]/10 text-[#0B132B]"
                      : "border-slate-200 text-slate-600"
                  }`}
                >

                  {amenities.includes(item) && (
                    <Check className="w-4 h-4 text-[#3E8E8A]" />
                  )}

                  {item}

                </button>

              ))}

            </div>

            <Field
              label="Other Amenities"
              hint="Separate extra features with commas."
            >
              <input
                value={form.other_amenities}
                onChange={update("other_amenities")}
                placeholder="Fireplace, rooftop, concierge..."
                className={inputClass}
              />
            </Field>

            <Field
              label="Rules / Policies"
              hint="Separate rules with commas."
            >
              <input
                value={form.rules}
                onChange={update("rules")}
                placeholder="No smoking, Pets require approval..."
                className={inputClass}
              />
            </Field>

          </section>

          {/* PHOTOS */}

          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">

            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#3E8E8A]" />

              <h2 className="font-serif text-xl font-semibold">
                4. Photos
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              The customer uploads their own photos here.
              The first photo becomes the cover image.
              Up to 10 images, 5 MB each.
            </p>

            <label className="block border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-[#3E8E8A] transition">

              <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />

              <span className="font-semibold text-sm">
                Choose property photos
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotos}
                className="hidden"
              />

            </label>

            {photos.length > 0 && (

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                {photos.map((file, index) => (

                  <div
                    key={`${file.name}-${index}`}
                    className="relative aspect-square rounded-xl overflow-hidden bg-slate-100"
                  >

                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {index === 0 && (

                      <span className="absolute top-2 left-2 text-[10px] font-bold bg-[#FFB703] text-[#0B132B] px-2 py-1 rounded-full">
                        COVER
                      </span>

                    )}

                  </div>

                ))}

              </div>

            )}

          </section>

          {/* AVAILABILITY */}

          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">

            <h2 className="font-serif text-xl font-semibold">
              5. Availability & contact
            </h2>

            <Field label="Availability">
              <input
                value={form.availability}
                onChange={update("availability")}
                placeholder="Available now, From October 15..."
                className={inputClass}
              />
            </Field>

            <Field label="Contact Phone">
              <input
                type="tel"
                value={form.contact_phone}
                onChange={update("contact_phone")}
                className={inputClass}
              />
            </Field>

          </section>

          {status === "error" && (

            <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              {errorMessage ||
                "Something went wrong saving your listing."}
            </div>

          )}

          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#FFB703] to-[#FFD300] hover:from-[#FFD300] hover:to-[#FFB703] text-slate-900 transition-all disabled:opacity-60"
          >
            {status === "saving"
              ? "Saving listing and photos..."
              : "Save Listing as Draft"}
          </button>

        </form>

      </main>
    </div>
  );
}