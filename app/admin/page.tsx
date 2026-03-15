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
      <main className="min-h-screen bg-[#F7F5F1] px-6 py-10 text-[#6B6B6B]">
        Loading admin dashboard...
      </main>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E67E22]">
            Admin Panel
          </p>
          <h1 className="mt-2 text-4xl font-bold text-[#1F1F1F]">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-[#6B6B6B]">
            Monitor the activity and performance of the BookBazaar platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#8A8175]">Total Users</p>
            <h2 className="mt-3 text-3xl font-bold text-[#1F1F1F]">
              {usersCount}
            </h2>
          </div>

          <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#8A8175]">Books Listed</p>
            <h2 className="mt-3 text-3xl font-bold text-[#1F1F1F]">
              {booksCount}
            </h2>
          </div>

          <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#8A8175]">Wishlist Items</p>
            <h2 className="mt-3 text-3xl font-bold text-[#1F1F1F]">
              {wishlistCount}
            </h2>
          </div>

          <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <p className="text-sm text-[#8A8175]">Estimated Revenue</p>
            <h2 className="mt-3 text-3xl font-bold text-[#E67E22]">
              ₱{estimatedRevenue.toFixed(2)}
            </h2>
          </div>
        </div>

        <section className="mt-10 rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#1F1F1F]">
              Recent Listings
            </h2>
            <p className="mt-1 text-sm text-[#6B6B6B]">
              Recently posted books on the platform.
            </p>
          </div>

          <div className="overflow-x-auto">
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
                    <td className="py-4">{book.title}</td>
                    <td className="py-4">{book.author}</td>
                    <td className="py-4">₱{book.price}</td>
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
