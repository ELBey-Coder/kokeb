"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "../../DashboardHeader";

const CATEGORY_OPTIONS = [
  { value: "homes", label: "Homes" },
  { value: "vibes", label: "Vibes" },
  { value: "services", label: "Services" },
  { value: "long-term", label: "Long-term" },
  { value: "commercial", label: "Commercial" },
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
  amenities: "",
  availability: "",
  contact_phone: "",
};

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-[#0B132B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB703]";

export default function AddPropertyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null); // null | "saving" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("saving");
    setErrorMessage("");

    // The authenticated user id comes from the current session — never
    // from a form field — so nobody can edit a hidden input and claim
    // ownership of someone else's property. Row Level Security enforces
    // the same rule again, independently, at the database level.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { error } = await supabase.from("listings").insert({
      owner_id: user.id,
      title: form.title,
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
      category: form.category,
      property_type: form.property_type || null,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      price: form.price ? Number(form.price) : null,
      description: form.description || null,
      amenities: form.amenities
        ? form.amenities.split(",").map((a) => a.trim()).filter(Boolean)
        : [],
      availability: form.availability || null,
      contact_phone: form.contact_phone || null,
      status: "draft",
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    router.push("/dashboard/properties");
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#0B132B]">
      <DashboardHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/dashboard/properties"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B132B] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Properties
        </Link>

        <h1 className="font-serif text-3xl font-semibold mb-1">
          Add Property
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Saved as a draft first — you can publish it later.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <Field label="Property Title">
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

          <div className="grid grid-cols-3 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
            <Field label="Property Category">
              <select
                value={form.category}
                onChange={update("category")}
                className={inputClass}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Property Type">
              <input
                value={form.property_type}
                onChange={update("property_type")}
                placeholder="Apartment, Villa, Studio..."
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
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
            <Field label="Price">
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={update("price")}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={4}
              value={form.description}
              onChange={update("description")}
              className={inputClass}
            />
          </Field>

          <Field label="Amenities (comma-separated)">
            <input
              value={form.amenities}
              onChange={update("amenities")}
              placeholder="WiFi, Kitchen, Air conditioning"
              className={inputClass}
            />
          </Field>

          <Field label="Availability">
            <input
              value={form.availability}
              onChange={update("availability")}
              placeholder="Available now, From June 1st..."
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

          {status === "error" && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {errorMessage || "Something went wrong saving your property."}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "saving"}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#FFB703] to-[#FFD300] hover:from-[#FFD300] hover:to-[#FFB703] text-slate-900 transition-all disabled:opacity-60"
          >
            {status === "saving" ? "Saving..." : "Save Property"}
          </button>
        </form>
      </main>
    </div>
  );
}
