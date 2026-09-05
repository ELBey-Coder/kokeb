"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SubmitForReviewButton({ listingId }) {
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    setStatus("saving");
    setErrorMessage("");

    const { error } = await supabase
      .from("listings")
      .update({
        status: "pending",
      })
      .eq("id", listingId)
      .eq("status", "draft");

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("done");
    router.push("/dashboard/properties?submitted=1");
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleSubmit}
        disabled={status === "saving" || status === "done"}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B132B] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#16223F] disabled:opacity-60"
      >
        <Send className="w-4 h-4" />

        {status === "saving"
          ? "Submitting..."
          : status === "done"
            ? "Submitted"
            : "Submit for Review"}
      </button>

      {status === "error" && (
        <p className="text-xs text-rose-600 mt-2">{errorMessage}</p>
      )}
    </div>
  );
}
