"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";

import {
  Heart,
  MapPin,
  ShoppingCart,
  Eye,
  SlidersHorizontal,
  X,
} from "lucide-react";

type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  condition: string;
  location: string;
  image_url: string | null;
  category_id: number | null;
};

type Category = {
  id: number;
  name: string;
};

type WishlistItem = {
  id: number;
  book_id: number;
  user_id: string;
};

type CartItem = {
  id: number;
  book_id: number;
  quantity: number;
  user_id: string;
};

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

function MarketplaceSkeleton() {
  return (
    <main className="bg-[#F7F5F1] lg:h-[calc(100vh-76px)] lg:overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:h-full">
        <div className="grid gap-8 py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:h-full lg:py-0">
          <aside className="hidden lg:block lg:h-full lg:overflow-hidden lg:border-r lg:border-[#E5E0D8] lg:pr-6 lg:pt-6">
            <div className="sticky top-0 space-y-8">
              <div>
                <SkeletonBox className="mb-3 h-4 w-16" />
                <SkeletonBox className="h-10 w-full" />
              </div>

              <div>
                <SkeletonBox className="mb-3 h-4 w-24" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, index) => (
                    <SkeletonBox key={index} className="h-4 w-28" />
                  ))}
                </div>
              </div>

              <div>
                <SkeletonBox className="mb-3 h-4 w-20" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, index) => (
                    <SkeletonBox key={index} className="h-4 w-24" />
                  ))}
                </div>
              </div>

              <SkeletonBox className="h-10 w-full" />
            </div>
          </aside>

          <div className="min-w-0 lg:h-full lg:overflow-y-auto lg:-mr-38">
            <section className="min-w-0 lg:pr-10 lg:pt-6 lg:pb-6">
              <div className="mb-6 flex flex-col gap-4 border-b border-[#E5E0D8] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <SkeletonBox className="h-8 w-48" />
                  <SkeletonBox className="mt-2 h-4 w-72 max-w-full" />
                  <SkeletonBox className="mt-2 h-4 w-40" />
                </div>

                <div className="hidden items-center gap-3 lg:flex">
                  <SkeletonBox className="h-4 w-14" />
                  <SkeletonBox className="h-10 w-40" />
                </div>
              </div>

              <div className="fixed left-0 right-0 top-[120px] z-30 px-6 lg:hidden">
                <div className="mx-auto max-w-7xl">
                  <div className="rounded-2xl border border-white/20 bg-white/10 py-2 shadow-sm backdrop-blur-md">
                    <div className="flex gap-2">
                      <SkeletonBox className="h-11 flex-1 rounded-full" />
                      <SkeletonBox className="h-11 flex-1 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 pb-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="group rounded-[20px] border border-[#E5E0D8] bg-white p-4 shadow-sm"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-[#F7F4EE]">
                      <SkeletonBox className="h-64 w-full rounded-2xl" />
                      <SkeletonBox className="absolute left-3 top-3 h-7 w-20 rounded-full" />
                      <SkeletonBox className="absolute right-3 top-3 h-8 w-8 rounded-full" />
                    </div>

                    <div className="pt-4">
                      <SkeletonBox className="h-5 w-full" />
                      <SkeletonBox className="mt-2 h-5 w-4/5" />
                      <SkeletonBox className="mt-2 h-4 w-2/3" />
                      <SkeletonBox className="mt-3 h-6 w-20" />

                      <div className="mt-2 flex items-center gap-2">
                        <SkeletonBox className="h-4 w-4 rounded-full" />
                        <SkeletonBox className="h-4 w-24" />
                      </div>

                      <SkeletonBox className="mt-2 h-4 w-16" />

                      <div className="mt-4 space-y-2">
                        <SkeletonBox className="h-10 w-full rounded-full" />
                        <SkeletonBox className="h-10 w-full rounded-full" />
                        <SkeletonBox className="h-10 w-full rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [wishlistBookIds, setWishlistBookIds] = useState<number[]>([]);
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState<number[]>([]);
  const [cartLoadingIds, setCartLoadingIds] = useState<number[]>([]);
  const [buyNowLoadingIds, setBuyNowLoadingIds] = useState<number[]>([]);
  const [cartBookIds, setCartBookIds] = useState<number[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showMobileShortcutBar, setShowMobileShortcutBar] = useState(true);

  const lastScrollY = useRef(0);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const searchFromUrl = searchParams.get("search") || "";
    setSearch(searchFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
      }

      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select(
          "id, title, author, price, condition, location, image_url, category_id, created_at",
        )
        .order("created_at", { ascending: false });

      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (!booksError && booksData) {
        setBooks(booksData as Book[]);
        setFilteredBooks(booksData as Book[]);
      }

      if (!categoriesError && categoriesData) {
        setCategories(categoriesData);
      }

      if (user) {
        const { data: wishlistData, error: wishlistError } = await supabase
          .from("wishlists")
          .select("id, book_id, user_id")
          .eq("user_id", user.id);

        if (!wishlistError && wishlistData) {
          setWishlistBookIds(
            (wishlistData as WishlistItem[]).map((item) => item.book_id),
          );
        }

        const { data: cartData, error: cartError } = await supabase
          .from("cart_items")
          .select("id, book_id, quantity, user_id")
          .eq("user_id", user.id);

        if (!cartError && cartData) {
          setCartBookIds((cartData as CartItem[]).map((item) => item.book_id));
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = [...books];

    if (search.trim()) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(search.toLowerCase()) ||
          book.author.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (selectedCategory) {
      result = result.filter(
        (book) => String(book.category_id) === selectedCategory,
      );
    }

    if (selectedCondition) {
      result = result.filter(
        (book) =>
          book.condition.toLowerCase() === selectedCondition.toLowerCase(),
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "title-az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredBooks(result);
  }, [books, search, selectedCategory, selectedCondition, sortBy]);

  useEffect(() => {
    const startHideTimer = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      hideTimerRef.current = setTimeout(() => {
        setShowMobileShortcutBar(false);
      }, 1400);
    };

    const handleScroll = () => {
      const currentY = window.scrollY;

      if (currentY <= 40) {
        setShowMobileShortcutBar(true);
      } else if (currentY > lastScrollY.current) {
        setShowMobileShortcutBar(false);
      } else if (currentY < lastScrollY.current) {
        setShowMobileShortcutBar(true);
      }

      lastScrollY.current = currentY;
      startHideTimer();
    };

    setShowMobileShortcutBar(true);
    lastScrollY.current = window.scrollY;
    startHideTimer();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const toggleWishlist = async (bookId: number) => {
    if (!userId) {
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
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", userId)
        .eq("book_id", bookId);

      if (error) {
        showToast({
          title: "Wishlist update failed",
          message: error.message,
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
      const { error } = await supabase.from("wishlists").insert([
        {
          user_id: userId,
          book_id: bookId,
        },
      ]);

      if (error) {
        showToast({
          title: "Wishlist update failed",
          message: error.message,
          type: "error",
        });
      } else {
        setWishlistBookIds((prev) => [...prev, bookId]);
        showToast({
          title: "Saved to wishlist",
          message: "The book was added to your wishlist.",
          type: "success",
        });
      }
    }

    setWishlistLoadingIds((prev) => prev.filter((id) => id !== bookId));
  };

  const handleAddToCart = async (bookId: number) => {
    if (!userId) {
      showToast({
        title: "Login required",
        message: "Please log in first to add books to your cart.",
        type: "info",
      });
      return;
    }

    if (cartLoadingIds.includes(bookId)) return;

    setCartLoadingIds((prev) => [...prev, bookId]);

    try {
      const { data: existingItem, error: existingError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("book_id", bookId)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existingItem) {
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert([
            {
              user_id: userId,
              book_id: bookId,
              quantity: 1,
            },
          ]);

        if (insertError) throw insertError;

        setCartBookIds((prev) => [...prev, bookId]);
      }

      showToast({
        title: "Added to cart",
        message: "Book added to cart.",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Add to cart failed",
        message: "Failed to add book to cart.",
        type: "error",
      });
    } finally {
      setCartLoadingIds((prev) => prev.filter((id) => id !== bookId));
    }
  };

  const handleBuyNow = async (bookId: number) => {
    if (!userId) {
      showToast({
        title: "Login required",
        message: "Please log in first to buy this book.",
        type: "info",
      });
      return;
    }

    if (buyNowLoadingIds.includes(bookId)) return;

    setBuyNowLoadingIds((prev) => [...prev, bookId]);

    try {
      const { data: existingItem, error: existingError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("book_id", bookId)
        .maybeSingle();

      if (existingError) throw existingError;

      let cartItemId: number | null = null;

      if (existingItem) {
        cartItemId = existingItem.id;
      } else {
        const { data: insertedItem, error: insertError } = await supabase
          .from("cart_items")
          .insert([
            {
              user_id: userId,
              book_id: bookId,
              quantity: 1,
            },
          ])
          .select("id, book_id")
          .single();

        if (insertError) throw insertError;

        if (insertedItem) {
          cartItemId = insertedItem.id;
          setCartBookIds((prev) => [...prev, bookId]);
        }
      }

      if (!cartItemId) {
        showToast({
          title: "Checkout failed",
          message: "Failed to continue to checkout.",
          type: "error",
        });
        return;
      }

      router.push(`/checkout?items=${cartItemId}`);
    } catch (error) {
      console.error(error);
      showToast({
        title: "Buy now failed",
        message: "Failed to process Buy Now.",
        type: "error",
      });
    } finally {
      setBuyNowLoadingIds((prev) => prev.filter((id) => id !== bookId));
    }
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedCondition("");
    setSortBy("newest");
  };

  const filterContent = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#1F1F1F]">
          Search
        </h3>
        <input
          type="text"
          placeholder="Search title or author"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#DDD6CC] bg-white px-3 py-2 text-sm text-[#1F1F1F] outline-none placeholder:text-[#9C9489] focus:border-[#E67E22]"
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#1F1F1F]">
          Categories
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory("")}
            className={`block text-left text-sm ${
              selectedCategory === ""
                ? "font-semibold text-[#E67E22]"
                : "text-[#6B6B6B] hover:text-[#1F1F1F]"
            }`}
          >
            All Categories
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(String(category.id))}
              className={`block text-left text-sm ${
                selectedCategory === String(category.id)
                  ? "font-semibold text-[#E67E22]"
                  : "text-[#6B6B6B] hover:text-[#1F1F1F]"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#1F1F1F]">
          Condition
        </h3>
        <div className="space-y-2">
          {["", "New", "Good", "Used"].map((condition) => (
            <button
              key={condition || "all"}
              onClick={() => setSelectedCondition(condition)}
              className={`block text-left text-sm ${
                selectedCondition === condition
                  ? "font-semibold text-[#E67E22]"
                  : "text-[#6B6B6B] hover:text-[#1F1F1F]"
              }`}
            >
              {condition || "All Conditions"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <button
          onClick={() => {
            resetFilters();
            setMobileFiltersOpen(false);
          }}
          className="w-full rounded-xl border border-[#D9D1C6] bg-white px-4 py-2 text-sm font-medium text-[#1F1F1F] transition hover:bg-[#F1ECE4]"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <MarketplaceSkeleton />;
  }

  return (
    <main className="bg-[#F7F5F1] lg:h-[calc(100vh-76px)] lg:overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:h-full">
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-[#F7F5F1] p-5 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1F1F1F]">Filters</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-full border border-[#D9D1C6] bg-white p-2 text-[#1F1F1F]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4">
                {filterContent}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:h-full lg:py-0">
          <aside className="hidden lg:block lg:h-full lg:overflow-hidden lg:border-r lg:border-[#E5E0D8] lg:pr-6 lg:pt-6">
            <div className="sticky top-0">{filterContent}</div>
          </aside>

          <div className="min-w-0 lg:h-full lg:overflow-y-auto lg:-mr-38">
            <section className="min-w-0 lg:pr-10 lg:pt-6 lg:pb-6">
              <div className="mb-6 flex flex-col gap-4 border-b border-[#E5E0D8] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-[#1F1F1F]">
                    Books for Sale
                  </h1>
                  <p className="mt-1 text-sm text-[#8A8175]">
                    Find affordable books from readers and student sellers.
                  </p>
                  <p className="mt-1 text-sm text-[#8A8175]">
                    1 - {filteredBooks.length} of {filteredBooks.length} results
                  </p>
                </div>

                <div className="hidden items-center gap-3 lg:flex">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border border-[#DDD6CC] bg-white px-3 py-2 text-sm text-[#1F1F1F] outline-none focus:border-[#E67E22]"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="title-az">Title: A to Z</option>
                  </select>
                </div>
              </div>

              <div
                className={`fixed left-0 right-0 z-30 px-6 transition-all duration-300 lg:hidden ${
                  showMobileShortcutBar
                    ? "pointer-events-auto top-[120px] translate-y-0 opacity-100"
                    : "pointer-events-none top-[120px] -translate-y-3 opacity-0"
                }`}
              >
                <div className="mx-auto max-w-7xl">
                  <div className="rounded-2xl border border-white/20 bg-white/10 py-2 shadow-sm backdrop-blur-md">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMobileFiltersOpen(true)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#D9D1C6] bg-white px-4 py-2.5 text-sm font-semibold text-[#1F1F1F] shadow-sm transition hover:bg-[#F7F4EE]"
                      >
                        <SlidersHorizontal size={16} />
                        Filters
                      </button>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="min-w-0 flex-1 rounded-full border border-[#DDD6CC] bg-white px-4 py-2.5 text-sm font-semibold text-[#1F1F1F] outline-none focus:border-[#E67E22]"
                      >
                        <option value="newest">Newest</option>
                        <option value="price-low">Low to High</option>
                        <option value="price-high">High to Low</option>
                        <option value="title-az">A to Z</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {filteredBooks.length === 0 ? (
                <div className="rounded-2xl border border-[#E5E0D8] bg-white p-10 text-center text-[#6B6B6B]">
                  No books found.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 pb-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {filteredBooks.map((book) => {
                    const isWishlisted = wishlistBookIds.includes(book.id);
                    const isWishlistLoading = wishlistLoadingIds.includes(
                      book.id,
                    );
                    const isCartLoading = cartLoadingIds.includes(book.id);
                    const isBuyNowLoading = buyNowLoadingIds.includes(book.id);
                    const isAlreadyInCart = cartBookIds.includes(book.id);

                    return (
                      <div
                        key={book.id}
                        className="group rounded-[20px] border border-[#E5E0D8] bg-white p-4 shadow-sm transition hover:shadow-md"
                      >
                        <div className="relative overflow-hidden rounded-2xl bg-[#F7F4EE]">
                          <Link href={`/book/${book.id}`}>
                            {book.image_url ? (
                              <img
                                src={book.image_url}
                                alt={book.title}
                                className="h-64 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                              />
                            ) : (
                              <div className="flex h-64 w-full items-center justify-center bg-[#EEF1F6] text-[#7B8593]">
                                No Image
                              </div>
                            )}
                          </Link>

                          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#1F1F1F] shadow-sm">
                            {book.condition}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleWishlist(book.id)}
                            disabled={isWishlistLoading}
                            className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-sm transition hover:bg-[#F7F4EE] disabled:opacity-50"
                            aria-label="Toggle wishlist"
                          >
                            <Heart
                              size={16}
                              className={`transition ${
                                isWishlisted
                                  ? "fill-red-500 text-red-500"
                                  : "text-[#1F1F1F]"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="pt-4">
                          <Link href={`/book/${book.id}`}>
                            <h2 className="line-clamp-2 min-h-[48px] text-base font-semibold text-[#1F1F1F]">
                              {book.title}
                            </h2>
                          </Link>

                          <p className="mt-1 line-clamp-1 text-sm text-[#8A8175]">
                            {book.author}
                          </p>

                          <p className="mt-3 text-lg font-bold text-[#E67E22]">
                            ₱{book.price}
                          </p>

                          <div className="mt-2 flex items-center gap-2 text-sm text-[#8A8175]">
                            <MapPin size={14} />
                            <span className="line-clamp-1">
                              {book.location}
                            </span>
                          </div>

                          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[#6B6B6B]">
                            Available
                          </p>

                          <div className="mt-4 space-y-2">
                            <button
                              type="button"
                              onClick={() => handleAddToCart(book.id)}
                              disabled={isCartLoading}
                              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#E67E22] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#cf6f1c] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <ShoppingCart size={14} />
                              {isCartLoading
                                ? "Adding..."
                                : isAlreadyInCart
                                  ? "Add Again"
                                  : "Add to Cart"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleBuyNow(book.id)}
                              disabled={isBuyNowLoading}
                              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E67E22] bg-[#FFF7EF] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#E67E22] transition hover:bg-[#E67E22] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <ShoppingCart size={14} />
                              {isBuyNowLoading ? "Processing..." : "Buy Now"}
                            </button>

                            <Link
                              href={`/book/${book.id}`}
                              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E8A16A] px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-[#E67E22] transition hover:bg-[#E67E22] hover:text-white"
                            >
                              <Eye size={14} />
                              View Book
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      <MarketplaceContent />
    </Suspense>
  );
}
