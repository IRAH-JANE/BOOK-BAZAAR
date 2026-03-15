"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
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

function MarketplaceContent() {
  const searchParams = useSearchParams();

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
  const [cartBookIds, setCartBookIds] = useState<number[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  const toggleWishlist = async (bookId: number) => {
    if (!userId) {
      alert("Please log in first to save books to your wishlist.");
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
        alert(error.message);
      } else {
        setWishlistBookIds((prev) => prev.filter((id) => id !== bookId));
      }
    } else {
      const { error } = await supabase.from("wishlists").insert([
        {
          user_id: userId,
          book_id: bookId,
        },
      ]);

      if (error) {
        alert(error.message);
      } else {
        setWishlistBookIds((prev) => [...prev, bookId]);
      }
    }

    setWishlistLoadingIds((prev) => prev.filter((id) => id !== bookId));
  };

  const handleAddToCart = async (bookId: number) => {
    if (!userId) {
      alert("Please log in first to add books to your cart.");
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

      if (existingError) {
        throw existingError;
      }

      if (existingItem) {
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);

        if (updateError) {
          throw updateError;
        }
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

        if (insertError) {
          throw insertError;
        }

        setCartBookIds((prev) => [...prev, bookId]);
      }

      alert("Book added to cart.");
    } catch (error) {
      console.error(error);
      alert("Failed to add book to cart.");
    } finally {
      setCartLoadingIds((prev) => prev.filter((id) => id !== bookId));
    }
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedCondition("");
    setSortBy("newest");
  };

  const closeMobileFilters = () => {
    setMobileFiltersOpen(false);
  };

  const filterContent = (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#1F1F1F]">
          Search
        </h3>
        <input
          type="text"
          placeholder="Search title or author"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#DDD6CC] bg-white px-3 py-2.5 text-sm text-[#1F1F1F] outline-none placeholder:text-[#9C9489] focus:border-[#E67E22]"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
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
      </div>

      <div>
        <button
          onClick={() => {
            resetFilters();
            closeMobileFilters();
          }}
          className="w-full rounded-xl border border-[#D9D1C6] bg-white px-4 py-2.5 text-sm font-medium text-[#1F1F1F] transition hover:bg-[#F1ECE4]"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 text-[#6B6B6B] sm:px-6 sm:py-10">
        Loading marketplace...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8">
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={closeMobileFilters}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-[#F7F5F1] p-5 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1F1F1F]">Filters</h2>
                <button
                  type="button"
                  onClick={closeMobileFilters}
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

        <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-8">
          <aside className="hidden border-r border-[#E5E0D8] pr-6 lg:block">
            {filterContent}
          </aside>

          <section>
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
                Books for Sale
              </h1>
              <p className="mt-1 text-sm text-[#8A8175]">
                Find affordable books from readers and student sellers.
              </p>
              <p className="mt-1 text-sm text-[#8A8175]">
                1 - {filteredBooks.length} of {filteredBooks.length} results
              </p>
            </div>

            <div className="sticky top-[76px] z-20 -mx-4 mb-5 bg-[#F7F5F1]/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-[#F7F5F1]/80 sm:static sm:mx-0 sm:mb-6 sm:bg-transparent sm:px-0 sm:py-0">
              <div className="flex gap-2 sm:hidden">
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

              <div className="hidden w-full flex-col gap-2 sm:flex sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-xl border border-[#DDD6CC] bg-white px-3 py-2 text-sm text-[#1F1F1F] outline-none focus:border-[#E67E22] sm:w-auto"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="title-az">Title: A to Z</option>
                </select>
              </div>
            </div>

            {filteredBooks.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E0D8] bg-white p-8 text-center text-sm text-[#6B6B6B] sm:p-10 sm:text-base">
                No books found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
                {filteredBooks.map((book) => {
                  const isWishlisted = wishlistBookIds.includes(book.id);
                  const isWishlistLoading = wishlistLoadingIds.includes(
                    book.id,
                  );
                  const isCartLoading = cartLoadingIds.includes(book.id);
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
                              className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-64"
                            />
                          ) : (
                            <div className="flex h-52 w-full items-center justify-center bg-[#EEF1F6] text-[#7B8593] sm:h-64">
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
                          <MapPin size={14} className="shrink-0" />
                          <span className="line-clamp-1">{book.location}</span>
                        </div>

                        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[#6B6B6B]">
                          Available
                        </p>

                        <div className="mt-4 space-y-2">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(book.id)}
                            disabled={isCartLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#E67E22] px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#cf6f1c] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <ShoppingCart size={14} />
                            {isCartLoading
                              ? "Adding..."
                              : isAlreadyInCart
                                ? "Add Again"
                                : "Add to Cart"}
                          </button>

                          <Link
                            href={`/book/${book.id}`}
                            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E8A16A] px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-[#E67E22] transition hover:bg-[#E67E22] hover:text-white"
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
    </main>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl px-4 py-8 text-[#6B6B6B] sm:px-6 sm:py-10">
          Loading marketplace...
        </main>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
