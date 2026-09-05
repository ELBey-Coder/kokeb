"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteDraftButton({ listingId }) {
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this draft listing? This cannot be undone."
    );

    if (!confirmed) return;

    setStatus("deleting");
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data: photoRows, error: photoLookupError } = await supabase
      .from("listing_photos")
      .select("storage_path")
      .eq("listing_id", listingId)
      .eq("owner_id", user.id);

    if (photoLookupError) {
      setStatus("error");
      setErrorMessage(photoLookupError.message);
      return;
    }

    const storagePaths = (photoRows || [])
      .map((photo) => photo.storage_path)
      .filter(Boolean);

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("listing-photos")
        .remove(storagePaths);

      if (storageError) {
        setStatus("error");
        setErrorMessage(storageError.message);
        return;
      }
    }

    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId)
      .eq("owner_id", user.id)
      .eq("status", "draft");

    if (deleteError) {
      setStatus("error");
      setErrorMessage(deleteError.message);
      return;
    }

    setStatus("done");
    router.refresh();
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={status === "deleting" || status === "done"}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-2.5 text-sm font-semibold hover:bg-rose-100 disabled:opacity-60"
      >
        <Trash2 className="w-4 h-4" />

        {status === "deleting"
          ? "Deleting..."
          : status === "done"
          ? "Deleted"
          : "Delete Draft"}
      </button>

      {status === "error" && (
        <p className="text-xs text-rose-600 mt-2">
          {errorMessage}
        </p>
      )}
    </div>
  );
}