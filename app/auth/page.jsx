"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Real Supabase Auth wiring for signup/signin, matching the Kokeb visual
// design. `handleSubmit` now calls supabase.auth.signInWithPassword /
// supabase.auth.signUp instead of the old UI-only stub.

const supabase = createClient();

export default function AuthPage() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState(null); // null | "submitting" | "error" | "check-email"
  const [errorMessage, setErrorMessage] = useState("");

  const isSignIn = mode === "signin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    if (isSignIn) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setStatus("error");
        setErrorMessage(error.message);
        return;
      }
      window.location.href = "/dashboard";
      return;
    }

    // Sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/confirm`
            : undefined,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    // If email confirmation is required, Supabase returns a user with no
    // active session yet — send them to check their inbox instead of in.
    if (data?.user && !data.session) {
      setStatus("check-email");
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col">
      {/* Ethiopian heritage accent stripe, matches homepage header */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-emerald-600" />
        <div className="h-full w-1/3 bg-[#FFD300]" />
        <div className="h-full w-1/3 bg-rose-600" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex justify-center mb-8">
            <Image
              src="/kokeb-logo-light.png"
              alt="Kokeb"
              width={150}
              height={66}
              className="w-[150px] h-[66px]"
              priority
            />
          </Link>

          <div className="bg-[#16223F] border border-slate-800 rounded-2xl p-6 sm:p-8">
            {status === "check-email" ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-10 h-10 text-[#5BC0BE] mx-auto mb-3" />
                <h1 className="font-serif text-xl font-semibold mb-2">
                  Check your email
                </h1>
                <p className="text-sm text-slate-400">
                  We sent a confirmation link to{" "}
                  <span className="text-slate-200">{email}</span>. Click it
                  to activate your account, then come back and sign in.
                </p>
              </div>
            ) : (
              <>
                <h1 className="font-serif text-2xl font-semibold text-center mb-1">
                  {isSignIn ? "Welcome back" : "Create your account"}
                </h1>
                <p className="text-sm text-slate-400 text-center mb-6">
                  {isSignIn
                    ? "Sign in to book a stay or manage your listings."
                    : "Join Kokeb to book stays or list your own place."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isSignIn && (
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        Full name
                      </label>
                      <div className="flex items-center gap-2 bg-[#0B132B] border border-slate-800 rounded-xl px-3 py-2.5">
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your name"
                          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      Email
                    </label>
                    <div className="flex items-center gap-2 bg-[#0B132B] border border-slate-800 rounded-xl px-3 py-2.5">
                      <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      Password
                    </label>
                    <div className="flex items-center gap-2 bg-[#0B132B] border border-slate-800 rounded-xl px-3 py-2.5">
                      <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {status === "error" && (
                    <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                      {errorMessage || "Something went wrong. Please try again."}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#FFB703] to-[#FFD300] hover:from-[#FFD300] hover:to-[#FFB703] text-slate-900 transition-all disabled:opacity-60"
                  >
                    {status === "submitting" ? (
                      "One moment..."
                    ) : (
                      <>
                        {isSignIn ? "Sign in" : "Create account"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {status !== "check-email" && (
            <p className="text-center text-sm text-slate-400 mt-6">
              {isSignIn ? "New to Kokeb?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setMode(isSignIn ? "signup" : "signin");
                  setStatus(null);
                  setErrorMessage("");
                }}
                className="text-[#FFB703] font-semibold hover:underline"
              >
                {isSignIn ? "Sign up" : "Sign in"}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
