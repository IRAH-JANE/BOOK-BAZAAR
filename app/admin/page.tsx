"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type RecentBook = {
  id: number;
  title: string;
  author: string;
  price: number;
  location: string;
};

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

function AdminPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#F7F5F1]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <SkeletonBox className="h-4 w-24 rounded-full" />
          <SkeletonBox className="mt-2 h-10 w-64" />
          <SkeletonBox className="mt-2 h-5 w-80 max-w-full" />
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#E5E0D8] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6"
            >
              <SkeletonBox className="h-4 w-24" />
              <SkeletonBox className="mt-3 h-8 w-20" />
            </div>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:mt-10 sm:rounded-3xl sm:p-6">
          <div className="mb-5">
            <SkeletonBox className="h-8 w-52" />
            <SkeletonBox className="mt-2 h-5 w-72 max-w-full" />
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E5E0D8] text-left text-sm text-[#8A8175]">
                  <th className="pb-3">
                    <SkeletonBox className="h-4 w-16" />
                  </th>
                  <th className="pb-3">
                    <SkeletonBox className="h-4 w-16" />
                  </th>
                  <th className="pb-3">
                    <SkeletonBox className="h-4 w-16" />
                  </th>
                  <th className="pb-3">
                    <SkeletonBox className="h-4 w-20" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, index) => (
                  <tr key={index} className="border-b border-[#F0EAE2]">
                    <td className="py-4">
                      <SkeletonBox className="h-4 w-40" />
                    </td>
                    <td className="py-4">
                      <SkeletonBox className="h-4 w-28" />
                    </td>
                    <td className="py-4">
                      <SkeletonBox className="h-4 w-16" />
                    </td>
                    <td className="py-4">
                      <SkeletonBox className="h-4 w-24" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 sm:hidden">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#EEE6DB] bg-[#FFFDF9] p-4"
              >
                <SkeletonBox className="h-5 w-2/3" />
                <SkeletonBox className="mt-3 h-4 w-full" />
                <SkeletonBox className="mt-2 h-4 w-4/5" />
                <SkeletonBox className="mt-2 h-4 w-3/5" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [usersCount, setUsersCount] = useState(0);
  const [booksCount, setBooksCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [recentBooks, setRecentBooks] = useState<RecentBook[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadAdminData = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError || profile?.role !== "admin") {
          router.push("/");
          return;
        }

        if (!mounted) return;

        setAuthorized(true);

        const [usersRes, booksRes, wishlistRes, recentRes] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("books").select("*", { count: "exact", head: true }),
          supabase
            .from("wishlists")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("books")
            .select("id, title, author, price, location")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        if (!mounted) return;

        setUsersCount(usersRes.count ?? 0);
        setBooksCount(booksRes.count ?? 0);
        setWishlistCount(wishlistRes.count ?? 0);

        setRecentBooks((recentRes.data as RecentBook[]) ?? []);
      } catch (error) {
        console.error("Admin dashboard error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAdminData();

    return () => {
      mounted = false;
    };
  }, [router]);

  const estimatedRevenue = recentBooks.reduce(
    (total, book) => total + Number(book.price || 0),
    0,
  );

  if (loading) {
    return <AdminPageSkeleton />;
  }

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-[#F7F5F1]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E67E22] sm:text-sm">
            Admin Panel
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1F1F1F] sm:text-4xl">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-sm text-[#6B6B6B] sm:text-base">
            Monitor users, listings, and platform activity in real time.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
            <p className="text-sm text-[#8A8175]">Total Users</p>
            <h2 className="mt-3 text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
              {usersCount}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
            <p className="text-sm text-[#8A8175]">Books Listed</p>
            <h2 className="mt-3 text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
              {booksCount}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
            <p className="text-sm text-[#8A8175]">Wishlist Items</p>
            <h2 className="mt-3 text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
              {wishlistCount}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
            <p className="text-sm text-[#8A8175]">Estimated Revenue</p>
            <h2 className="mt-3 text-2xl font-bold text-[#E67E22] sm:text-3xl">
              ₱{estimatedRevenue.toFixed(2)}
            </h2>
          </div>
        </div>

        {/* Recent Listings */}
        <section className="mt-8 rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:mt-10 sm:rounded-3xl sm:p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
              Recent Listings
            </h2>
            <p className="mt-1 text-sm text-[#6B6B6B] sm:text-base">
              Newly added books from sellers across the platform.
            </p>
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E5E0D8] text-left text-sm text-[#8A8175]">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Author</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Location</th>
                </tr>
              </thead>
              <tbody>
                {recentBooks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-sm text-[#6B6B6B]">
                      No recent listings found.
                    </td>
                  </tr>
                ) : (
                  recentBooks.map((book) => (
                    <tr
                      key={book.id}
                      className="border-b border-[#F0EAE2] text-sm text-[#1F1F1F]"
                    >
                      <td className="py-4">{book.title}</td>
                      <td className="py-4">{book.author}</td>
                      <td className="py-4">₱{book.price}</td>
                      <td className="py-4">{book.location}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 sm:hidden">
            {recentBooks.length === 0 ? (
              <div className="rounded-2xl border border-[#EEE6DB] bg-[#FFFDF9] p-4 text-sm text-[#6B6B6B]">
                No recent listings found.
              </div>
            ) : (
              recentBooks.map((book) => (
                <div
                  key={book.id}
                  className="rounded-2xl border border-[#EEE6DB] bg-[#FFFDF9] p-4"
                >
                  <h3 className="text-base font-semibold text-[#1F1F1F]">
                    {book.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#8A8175]">{book.author}</p>
                  <p className="mt-2 text-sm font-semibold text-[#E67E22]">
                    ₱{book.price}
                  </p>
                  <p className="mt-1 text-sm text-[#6B6B6B]">{book.location}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
