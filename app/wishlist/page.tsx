"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { Trash2 } from "lucide-react";

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

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

function WishlistPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[32px] border border-[#EEE7DC] bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F9F4EC] px-6 py-8 shadow-[0_12px_40px_rgba(31,31,31,0.06)] sm:px-8 sm:py-10">
          <div className="max-w-2xl">
            <SkeletonBox className="h-4 w-28 rounded-full" />
            <SkeletonBox className="mt-4 h-11 w-64" />
            <SkeletonBox className="mt-3 h-5 w-[22rem] max-w-full" />
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] shadow-[0_10px_30px_rgba(31,31,31,0.05)]"
            >
              <SkeletonBox className="h-72 w-full rounded-none" />

              <div className="p-5 sm:p-6">
                <SkeletonBox className="h-6 w-full" />
                <SkeletonBox className="mt-2 h-6 w-4/5" />

                <SkeletonBox className="mt-4 h-4 w-32" />
                <SkeletonBox className="mt-4 h-7 w-24" />
                <SkeletonBox className="mt-3 h-4 w-40" />

                <div className="mt-6 flex gap-3">
                  <SkeletonBox className="h-11 flex-1 rounded-full" />
                  <SkeletonBox className="h-11 flex-1 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function WishlistPage() {
  const supabase = createSupabaseBrowser();

  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [items, setItems] = useState<WishlistBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

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
      showToast({
        title: "Failed to load wishlist",
        message: error.message,
        type: "error",
      });
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
    const confirmed = await confirm({
      title: "Remove from Wishlist?",
      message: "Are you sure you want to remove this book from your wishlist?",
      confirmText: "Remove",
      cancelText: "Keep Book",
      danger: true,
    });

    if (!confirmed) return;

    setRemovingId(wishlistId);

    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", wishlistId);

    if (error) {
      setRemovingId(null);
      showToast({
        title: "Remove failed",
        message: error.message,
        type: "error",
      });
      return;
    }

    setRemovingId(null);
    showToast({
      title: "Removed from wishlist",
      message: "The book has been removed from your wishlist.",
      type: "success",
    });

    fetchWishlist();
  };

  if (loading) {
    return <WishlistPageSkeleton />;
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[32px] border border-[#EEE7DC] bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F9F4EC] px-6 py-8 shadow-[0_12px_40px_rgba(31,31,31,0.06)] sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#E67E22]/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#F3C998]/20 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl lg:text-5xl">
                My Wishlist
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#6B6B6B] sm:text-base">
                Keep track of books you love, compare your choices later, and
                jump back into the marketplace anytime.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-[#E8DED1] bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A8175]">
                  Total Saved
                </p>
                <p className="mt-1 text-2xl font-bold text-[#1F1F1F]">
                  {items.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="mt-8 overflow-hidden rounded-[32px] border border-[#E8E1D7] bg-[#FFFDF9] p-8 text-center shadow-[0_12px_30px_rgba(31,31,31,0.05)] sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF3E7] text-3xl">
              ♡
            </div>

            <h2 className="mt-5 text-2xl font-bold text-[#1F1F1F]">
              Your wishlist is still empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#6B6B6B] sm:text-base">
              Start saving books you want to buy later so they stay in one clean
              and easy-to-find place.
            </p>

            <Link
              href="/marketplace"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#E67E22] px-7 py-3 font-semibold text-white transition duration-200 hover:bg-[#cf6f1c]"
            >
              Browse Books
            </Link>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.books ? `/book/${item.books.id}` : "#"}
                className="block"
              >
                <article className="group overflow-hidden rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] shadow-[0_10px_30px_rgba(31,31,31,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(31,31,31,0.08)]">
                  <div className="relative overflow-hidden bg-gradient-to-b from-[#F6EFE6] to-[#EFE7DB]">
                    <div className="absolute right-3 top-3 z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(item.id);
                        }}
                        disabled={removingId === item.id}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm backdrop-blur-sm transition active:scale-95 disabled:opacity-50"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {item.books?.image_url ? (
                      <img
                        src={item.books.image_url}
                        alt={item.books.title}
                        className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-72 w-full flex-col items-center justify-center px-6 text-center text-[#8A8175]">
                        <div className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold shadow-sm">
                          No Image Available
                        </div>
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="min-h-[72px]">
                      <h2 className="line-clamp-2 text-lg font-bold leading-7 text-[#1F1F1F]">
                        {item.books?.title || "Unknown Book"}
                      </h2>

                      <p className="mt-2 line-clamp-1 text-sm text-[#6B6B6B]">
                        {item.books?.author || "Unknown Author"}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-2xl font-bold text-[#E67E22]">
                        ₱{item.books?.price ?? 0}
                      </p>

                      <span className="rounded-full bg-[#F6EFE6] px-3 py-1 text-xs font-semibold text-[#7A6F61]">
                        {item.books?.condition || "N/A"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-[#8A8175]">
                      {item.books?.location || "N/A"}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
