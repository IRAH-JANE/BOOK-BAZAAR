"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import PageLoader from "@/components/PageLoader";

type RecentBook = {
  id: number;
  title: string;
  author: string;
  price: number;
  location: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [usersCount, setUsersCount] = useState(0);
  const [booksCount, setBooksCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [recentBooks, setRecentBooks] = useState<RecentBook[]>([]);

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile || profile.role !== "admin") {
        router.push("/");
        return;
      }

      setAuthorized(true);

      const [
        { count: users },
        { count: books },
        { count: wishlists },
        { data: recent },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("books").select("*", { count: "exact", head: true }),
        supabase.from("wishlists").select("*", { count: "exact", head: true }),
        supabase
          .from("books")
          .select("id, title, author, price, location")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setUsersCount(users ?? 0);
      setBooksCount(books ?? 0);
      setWishlistCount(wishlists ?? 0);
      setRecentBooks((recent as RecentBook[]) ?? []);
      setLoading(false);
    };

    checkAdminAndLoadData();
  }, [router]);

  const estimatedRevenue = recentBooks.reduce(
    (sum, book) => sum + Number(book.price || 0),
    0,
  );

  if (loading) {
    return (
      <PageLoader
        title="Loading admin dashboard..."
        subtitle="Please wait while we prepare your admin overview."
      />
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E67E22] sm:text-sm">
            Admin Panel
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1F1F1F] sm:text-4xl">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-sm text-[#6B6B6B] sm:text-base">
            Monitor the activity and performance of the BookBazaar platform.
          </p>
        </div>

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
            <h2 className="mt-3 break-words text-2xl font-bold text-[#E67E22] sm:text-3xl">
              ₱{estimatedRevenue.toFixed(2)}
            </h2>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:mt-10 sm:rounded-3xl sm:p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
              Recent Listings
            </h2>
            <p className="mt-1 text-sm text-[#6B6B6B] sm:text-base">
              Recently posted books on the platform.
            </p>
          </div>

          {/* Mobile card list */}
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
                  <h3 className="text-base font-semibold leading-6 text-[#1F1F1F]">
                    {book.title}
                  </h3>

                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[#8A8175]">Author</span>
                      <span className="text-right text-[#1F1F1F]">
                        {book.author}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[#8A8175]">Price</span>
                      <span className="text-right font-semibold text-[#1F1F1F]">
                        ₱{book.price}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[#8A8175]">Location</span>
                      <span className="text-right text-[#1F1F1F]">
                        {book.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E5E0D8] text-left text-sm text-[#8A8175]">
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Author</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {recentBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="border-b border-[#F0EAE2] text-sm text-[#1F1F1F]"
                  >
                    <td className="py-4 pr-4">{book.title}</td>
                    <td className="py-4 pr-4">{book.author}</td>
                    <td className="py-4 pr-4">₱{book.price}</td>
                    <td className="py-4">{book.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
