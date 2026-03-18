"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      showToast({
        title: "Login failed",
        message: error.message,
        type: "error",
      });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      showToast({
        title: "Session not found",
        message: "Login succeeded but user session was not found.",
        type: "error",
      });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    setLoading(false);

    showToast({
      title: "Login successful",
      message: "Welcome back to BookBazaar.",
      type: "success",
    });

    if (profile?.role === "admin") {
      router.push("/admin");
      router.refresh();
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-md rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
        <h1 className="mb-2 text-3xl font-bold text-[#1F1F1F] sm:text-4xl">
          Login
        </h1>
        <p className="mb-6 text-sm text-[#6B6B6B] sm:text-base">
          Sign in to access your BookBazaar account.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-[#DED8CF] bg-white px-4 py-3 text-[16px] text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-[#DED8CF] bg-white px-4 py-3 text-[16px] text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#E67E22] px-5 py-3 font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B6B6B]">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#E67E22] hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
