"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type WishlistBook = {
  id: number;
  books: {
    id: number;
    title: string;
    author: string;
    price: number;
    condition: string;
    location: string;
    image_url: string | null;
  } | null;
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistBook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("wishlists")
      .select(
        `
        id,
        books (
          id,
          title,
          author,
          price,
          condition,
          location,
          image_url
        )
      `,
      )
      .eq("user_id", user.id);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const formattedItems: WishlistBook[] =
      data?.map((item: any) => ({
        id: item.id,
        books: item.books
          ? {
              id: item.books.id,
              title: item.books.title,
              author: item.books.author,
              price: item.books.price,
              condition: item.books.condition,
              location: item.books.location,
              image_url: item.books.image_url || null,
            }
          : null,
      })) || [];

    setItems(formattedItems);
    setLoading(false);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (wishlistId: number) => {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", wishlistId);

    if (error) {
      alert(error.message);
      return;
    }

    fetchWishlist();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5F1] px-6 py-10">
        <div className="mx-auto max-w-7xl text-[#6B6B6B]">
          Loading wishlist...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E67E22]">
            Saved Books
          </p>
          <h1 className="mt-2 text-4xl font-bold text-[#1F1F1F]">
            My Wishlist
          </h1>
          <p className="mt-2 text-[#6B6B6B]">
            Books you saved for later are listed here.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-[#E5E0D8] bg-white p-10 text-center shadow-sm">
            <p className="text-[#6B6B6B]">Your wishlist is empty.</p>

            <Link
              href="/marketplace"
              className="mt-4 inline-block rounded-full bg-[#E67E22] px-6 py-3 font-semibold text-white transition hover:bg-[#cf6f1c]"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[24px] border border-[#E5E0D8] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {item.books?.image_url ? (
                  <img
                    src={item.books.image_url}
                    alt={item.books.title}
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 w-full items-center justify-center bg-[#F1ECE4] text-[#8A8175]">
                    No Image
                  </div>
                )}

                <div className="p-5">
                  <h2 className="line-clamp-2 min-h-[56px] text-lg font-semibold text-[#1F1F1F]">
                    {item.books?.title || "Unknown Book"}
                  </h2>

                  <p className="mt-1 text-sm text-[#6B6B6B]">
                    {item.books?.author || "Unknown Author"}
                  </p>

                  <p className="mt-3 text-lg font-bold text-[#E67E22]">
                    ₱{item.books?.price ?? 0}
                  </p>

                  <p className="mt-1 text-sm text-[#8A8175]">
                    {item.books?.condition || "N/A"} •{" "}
                    {item.books?.location || "N/A"}
                  </p>

                  <div className="mt-5 flex gap-2">
                    {item.books && (
                      <Link
                        href={`/book/${item.books.id}`}
                        className="flex-1 rounded-full bg-[#E67E22] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#cf6f1c]"
                      >
                        View
                      </Link>
                    )}

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="flex-1 rounded-full border border-red-400 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
