"use client";

import { createSupabaseBrowser } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Store,
  User2,
  Heart,
  SearchX,
  Star,
  ChevronDown,
} from "lucide-react";

type Book = {
  id: string | number;
  title?: string;
  author?: string;
  price?: number;
  image_url?: string | null;
  condition?: string | null;
  status?: string | null;
  location?: string | null;
};

type Profile = {
  shop_name?: string | null;
  shop_slug?: string | null;
  full_name?: string | null;
  city?: string | null;
  province?: string | null;
};

export default function ShopClient({
  profile,
  books,
}: {
  profile: Profile;
  books: Book[];
}) {
  const [sortBy, setSortBy] = useState("newest");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [following, setFollowing] = useState(false);

  const supabase = createSupabaseBrowser();
  const { showToast } = useToast();

  const [followingStatusChecked, setFollowingStatusChecked] = useState(false);

  const [wishlistBookIds, setWishlistBookIds] = useState<number[]>([]);
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState<number[]>([]);
  const [cartBookIds, setCartBookIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchUserBookStates = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setWishlistBookIds([]);
        setCartBookIds([]);
        return;
      }

      const [wishlistRes, cartRes] = await Promise.all([
        supabase.from("wishlists").select("book_id").eq("user_id", user.id),
        supabase.from("cart_items").select("book_id").eq("user_id", user.id),
      ]);

      if (!wishlistRes.error && wishlistRes.data) {
        setWishlistBookIds(
          wishlistRes.data.map((item: { book_id: number }) => item.book_id),
        );
      }

      if (!cartRes.error && cartRes.data) {
        setCartBookIds(
          cartRes.data.map((item: { book_id: number }) => item.book_id),
        );
      }
    };

    fetchUserBookStates();
  }, [supabase]);

  const allVisibleBooks = useMemo(
    () => books.filter((book: Book) => book.status !== "hidden"),
    [books],
  );

  const visibleBooks = useMemo(() => {
    let list = [...allVisibleBooks];

    if (conditionFilter !== "all") {
      list = list.filter(
        (book: Book) =>
          (book.condition || "").toLowerCase() ===
          conditionFilter.toLowerCase(),
      );
    }

    if (sortBy === "price-low") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "title-az") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return list;
  }, [allVisibleBooks, sortBy, conditionFilter]);

  const shopName = profile.shop_name || "Book Store";
  const shopSlug = profile.shop_slug || "shop";
  const sellerName = profile.full_name || "Seller";

  const locationText =
    profile.city && profile.province
      ? `${profile.city}, ${profile.province}`
      : "Davao City, Philippines";

  const fallbackCover =
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1200&auto=format&fit=crop";

  const handleToggleWishlist = async (bookId: number) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      showToast({
        title: "Login required",
        message: "Please log in first to save books to your wishlist.",
        type: "info",
      });
      return;
    }

    if (wishlistLoadingIds.includes(bookId)) return;

    setWishlistLoadingIds((prev) => [...prev, bookId]);

    const isSaved = wishlistBookIds.includes(bookId);

    if (isSaved) {
      const { error: deleteError } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("book_id", bookId);

      if (deleteError) {
        showToast({
          title: "Wishlist error",
          message: deleteError.message,
          type: "error",
        });
      } else {
        setWishlistBookIds((prev) => prev.filter((id) => id !== bookId));
        showToast({
          title: "Removed from wishlist",
          message: "The book was removed from your wishlist.",
          type: "success",
        });
      }
    } else {
      const { error: insertError } = await supabase.from("wishlists").insert({
        user_id: user.id,
        book_id: bookId,
      });

      if (insertError) {
        showToast({
          title: "Wishlist error",
          message: insertError.message,
          type: "error",
        });
      } else {
        setWishlistBookIds((prev) => [...prev, bookId]);
        showToast({
          title: "Added to wishlist",
          message: "The book was added to your wishlist.",
          type: "success",
        });
      }
    }

    setWishlistLoadingIds((prev) => prev.filter((id) => id !== bookId));
  };

  const handleAddToCart = async (bookId: number) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      showToast({
        title: "Login required",
        message: "Please log in first to add books to your cart.",
        type: "info",
      });
      return;
    }

    const { data: existingItem, error: existingError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .maybeSingle();

    if (existingError) {
      showToast({
        title: "Cart error",
        message: existingError.message,
        type: "error",
      });
      return;
    }

    if (existingItem) {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);

      if (updateError) {
        showToast({
          title: "Cart error",
          message: updateError.message,
          type: "error",
        });
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("cart_items").insert({
        user_id: user.id,
        book_id: bookId,
        quantity: 1,
      });

      if (insertError) {
        showToast({
          title: "Cart error",
          message: insertError.message,
          type: "error",
        });
        return;
      }
    }

    showToast({
      title: "Added to cart",
      message: "Book added to cart.",
      type: "success",
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F5F1]">
      {/* HEADER */}
      <section className="border-b border-[#E5E0D8] bg-[#FFF8F0]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="rounded-[26px] border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E67E22] text-white shadow-sm">
                  <Store className="h-7 w-7" />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-[30px] font-bold tracking-tight text-[#1F1F1F]">
                    {shopName}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#5F5850]">
                    <span className="font-semibold text-[#2C2723]">
                      @{shopSlug}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <User2 className="h-4 w-4 text-[#8A8175]" />
                      <span>{sellerName}</span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#E67E22]" />
                      <span>{locationText}</span>
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-sm text-[#7A7268]">
                    <Star className="h-4 w-4 fill-[#EAB308] text-[#EAB308]" />
                    <span>No ratings yet</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl bg-[#FFF4E8] px-4 py-3 text-sm font-bold text-[#A85A17]">
                  {visibleBooks.length} Books
                </div>

                <button
                  type="button"
                  onClick={() => setFollowing((prev) => !prev)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    following
                      ? "border border-[#D9D1C6] bg-[#F3F1EC] text-[#3F3A36] hover:bg-[#EBE7E0]"
                      : "bg-[#E67E22] text-white hover:bg-[#cf6f1c]"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${following ? "fill-current" : ""}`}
                  />
                  {following ? "Following" : "Follow"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SORT / FILTER */}
      <section className="mx-auto max-w-7xl px-6 py-7">
        <div className="mb-7 rounded-[24px] border border-[#E5E0D8] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#1F1F1F]">
                Books in this store
              </h2>
              <p className="mt-1 text-sm text-[#8A8175]">
                Browse all available listings from this seller
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-[180px]">
                <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#DDD6CC] bg-white px-4 py-3 pr-10 text-sm font-semibold text-[#1F1F1F] outline-none transition hover:border-[#c8bfb3] focus:border-[#E67E22] focus:ring-4 focus:ring-[#E67E22]/10"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="title-az">Title: A to Z</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-[42px] h-4 w-4 text-[#6B6258]" />
              </div>

              <div className="relative min-w-[180px]">
                <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                  Condition
                </label>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#DDD6CC] bg-white px-4 py-3 pr-10 text-sm font-semibold text-[#1F1F1F] outline-none transition hover:border-[#c8bfb3] focus:border-[#E67E22] focus:ring-4 focus:ring-[#E67E22]/10"
                >
                  <option value="all">All</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="good">Good</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-[42px] h-4 w-4 text-[#6B6258]" />
              </div>
            </div>
          </div>
        </div>

        {/* EMPTY STATE */}
        {visibleBooks.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#DED5C8] bg-[#FFFCF8] px-6 text-center">
            <SearchX className="mb-3 h-9 w-9 text-[#A79E92]" />
            <h3 className="text-lg font-bold text-[#1F1F1F]">No books found</h3>
            <p className="mt-2 text-sm text-[#6F675D]">
              Try changing the selected filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 pb-6 sm:grid-cols-2 md:grid-cols-3 md:grid-cols-4 md:grid-cols-5">
            {visibleBooks.map((book: Book) => (
              <Link
                key={book.id}
                href={`/book/${book.id}`}
                className="group block rounded-[22px] focus:outline-none"
              >
                <article className="overflow-hidden rounded-[22px] border border-[#E5E0D8] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(31,31,31,0.08)] active:scale-[0.99]">
                  <div className="relative overflow-hidden rounded-2xl bg-[#F7F4EE]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleWishlist(Number(book.id));
                      }}
                      className="absolute right-3 top-3 z-20 rounded-full bg-white/95 p-2 shadow-sm backdrop-blur hover:scale-105"
                    >
                      <Heart
                        className={`h-4 w-4 transition ${
                          wishlistBookIds.includes(Number(book.id))
                            ? "fill-red-500 text-red-500"
                            : "text-[#1F1F1F]"
                        }`}
                      />
                    </button>

                    <img
                      src={book.image_url || fallbackCover}
                      alt={book.title || "Book cover"}
                      className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />

                    {/* desktop hover add to cart */}
                    <div className="absolute inset-x-3 bottom-3 hidden translate-y-3 opacity-0 transition duration-300 md:block group-hover:translate-y-0 group-hover:opacity-100 z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(Number(book.id));
                        }}
                        className="w-full rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#1F1F1F] shadow"
                      >
                        Add to Cart
                      </button>
                    </div>

                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#1F1F1F] shadow-sm backdrop-blur-sm">
                      {book.condition || "Unknown"}
                    </span>

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F1F1F]/18 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                  </div>

                  <div className="pt-4">
                    <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold text-[#1F1F1F] transition group-hover:text-[#2A211B]">
                      {book.title || "Untitled Book"}
                    </h3>

                    <p className="mt-1 line-clamp-1 text-sm text-[#8A8175]">
                      {book.author || "Unknown Author"}
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm text-[#8A8175]">
                          <span className="line-clamp-1">
                            {book.location || locationText}
                          </span>
                        </div>

                        <p className="mt-1 pl-1 text-[11px] font-medium uppercase tracking-wide text-[#6B6B6B]">
                          Available
                        </p>
                      </div>

                      <p className="shrink-0 text-lg font-bold text-[#E67E22]">
                        ₱{Number(book.price || 0).toLocaleString()}
                      </p>
                    </div>

                    {/* mobile add to cart - same pattern as marketplace */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(Number(book.id));
                      }}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#E67E22] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#cf6f1c] md:hidden"
                    >
                      Add to Cart
                    </button>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
