"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-sm font-medium text-slate-300 border border-slate-700 rounded-full px-4 py-2 hover:border-slate-500 hover:text-white transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Log out
    </button>
  );
}
