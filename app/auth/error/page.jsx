import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default async function AuthErrorPage({ searchParams }) {
  const params = await searchParams;
  const message = params?.message;

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col items-center justify-center px-6 text-center">
      <AlertTriangle className="w-10 h-10 text-[#FFB703] mb-4" />
      <h1 className="font-serif text-2xl font-semibold mb-2">
        That link didn&apos;t work
      </h1>
      <p className="text-sm text-slate-400 max-w-sm mb-6">
        {message ||
          "This confirmation link is invalid or has expired. Try signing in — if your email still isn't confirmed, sign up again to get a fresh link."}
      </p>
      <Link
        href="/auth"
        className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#FFB703] to-[#FFD300] text-slate-900"
      >
        Back to sign in
      </Link>
    </div>
  );
}
