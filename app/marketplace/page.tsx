"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";
import {
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
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
  genre_id: number | null;
  book_type_id: number | null;
  stock_quantity: number | null;
  sold_count: number | null;
  status: string | null;
  created_at?: string | null;
};

type Category = {
  id: number;
  name: string;
};

type Genre = {
  id: number;
  name: string;
};

type BookType = {
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

type ExistingCartItem = {
  id: number;
  quantity: number;
};

const hiddenScrollbarClass =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

const ITEMS_PER_PAGE = 52;
const SEARCH_DEBOUNCE_MS = 1000;

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

function MarketplaceSkeleton() {
  return (
    <main className="bg-[#F7F5F1] lg:h-[calc(100vh-76px)] lg:overflow-hidden">
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[480px]:px-6 min-[768px]:px-8 min-[1024px]:px-10 min-[1280px]:px-20 min-[1440px]:px-0 lg:h-full">
        <div className="grid gap-6 py-4 min-[480px]:gap-6 min-[480px]:py-5 min-[768px]:gap-8 min-[768px]:py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:h-full lg:py-0">
          <aside className="hidden lg:block lg:h-full lg:overflow-hidden lg:border-r lg:border-[#E5E0D8] lg:pr-6 lg:pt-6">
            <div
              className={`h-full overflow-y-auto pr-2 ${hiddenScrollbarClass}`}
            >
              <div className="space-y-8">
                <div>
                  <SkeletonBox className="mb-3 h-4 w-16" />
                  <SkeletonBox className="h-10 w-full" />
                </div>

                <div>
                  <SkeletonBox className="mb-3 h-4 w-24" />
                  <div className="space-y-2">
                    {[...Array(8)].map((_, index) => (
                      <SkeletonBox key={index} className="h-4 w-28" />
                    ))}
                  </div>
                </div>

                <div>
                  <SkeletonBox className="mb-3 h-4 w-20" />
                  <div className="space-y-2">
                    {[...Array(6)].map((_, index) => (
                      <SkeletonBox key={index} className="h-4 w-24" />
                    ))}
                  </div>
                </div>

                <div>
                  <SkeletonBox className="mb-3 h-4 w-24" />
                  <div className="space-y-2">
                    {[...Array(6)].map((_, index) => (
                      <SkeletonBox key={index} className="h-4 w-28" />
                    ))}
                  </div>
                </div>

                <SkeletonBox className="h-10 w-full" />
              </div>
            </div>
          </aside>

          <div
            className={`min-w-0 lg:h-full lg:overflow-y-auto lg:-mr-38 ${hiddenScrollbarClass}`}
          >
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

              <div className="fixed left-0 right-0 top-[120px] z-30 px-4 min-[480px]:px-6 lg:hidden">
                <div className="mx-auto w-full max-w-[1200px]">
                  <div className="rounded-2xl border border-white/20 bg-white/10 py-2 shadow-sm backdrop-blur-md">
                    <div className="flex gap-2">
                      <SkeletonBox className="h-11 flex-1 rounded-full" />
                      <SkeletonBox className="h-11 flex-1 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-6 min-[480px]:gap-4 min-[768px]:grid-cols-3 min-[768px]:gap-5 min-[1024px]:grid-cols-4 min-[1024px]:gap-6">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[20px] border border-[#E5E0D8] bg-white p-3 min-[480px]:p-4 shadow-sm"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-[#F7F4EE]">
                      <SkeletonBox className="h-40 w-full rounded-2xl min-[480px]:h-52 min-[768px]:h-60 min-[1024px]:h-64" />
                      <SkeletonBox className="absolute left-3 top-3 h-7 w-20 rounded-full" />
                      <SkeletonBox className="absolute right-3 top-3 h-8 w-8 rounded-full" />
                    </div>

                    <div className="pt-4">
                      <SkeletonBox className="h-5 w-full" />
                      <SkeletonBox className="mt-2 h-5 w-4/5" />
                      <SkeletonBox className="mt-2 h-4 w-2/3" />
                      <SkeletonBox className="mt-3 h-6 w-20" />

                      <div className="mt-2 flex items-center gap-2">
                        <SkeletonBox className="h-4 w-24" />
                      </div>

                      <SkeletonBox className="mt-2 h-4 w-16" />
                      <SkeletonBox className="mt-4 h-10 w-full rounded-full md:hidden" />
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
  const pathname = usePathname();
  const { showToast } = useToast();
  const supabase = createSupabaseBrowser();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollY = useRef(0);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backToTopTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [bookTypes, setBookTypes] = useState<BookType[]>([]);

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [wishlistBookIds, setWishlistBookIds] = useState<number[]>([]);
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState<number[]>([]);
  const [cartLoadingIds, setCartLoadingIds] = useState<number[]>([]);
  const [cartBookIds, setCartBookIds] = useState<number[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showMobileShortcutBar, setShowMobileShortcutBar] = useState(true);

  const [showCategories, setShowCategories] = useState(true);
  const [showGenres, setShowGenres] = useState(true);
  const [showBookTypes, setShowBookTypes] = useState(true);

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showAllBookTypes, setShowAllBookTypes] = useState(false);

  const [totalBooksCount, setTotalBooksCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  const search = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "";
  const selectedGenre = searchParams.get("genre") || "";
  const selectedBookType = searchParams.get("bookType") || "";
  const selectedCondition = searchParams.get("condition") || "";
  const sortBy = searchParams.get("sort") || "newest";
  const currentPage = Math.max(1, Number(searchParams.get("page") || "1") || 1);

  const getRemainingStock = (book: Book) => {
    return Math.max((book.stock_quantity ?? 0) - (book.sold_count ?? 0), 0);
  };

  const isSoldOut = (book: Book) => {
    const remaining = getRemainingStock(book);
    return remaining <= 0 || (book.status || "").toLowerCase() === "sold";
  };

  const updateUrl = (updates: {
    search?: string;
    category?: string;
    genre?: string;
    bookType?: string;
    condition?: string;
    sort?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    const setOrDelete = (key: string, value?: string) => {
      if (!value || value.trim() === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    };

    if ("search" in updates) setOrDelete("search", updates.search);
    if ("category" in updates) setOrDelete("category", updates.category);
    if ("genre" in updates) setOrDelete("genre", updates.genre);
    if ("bookType" in updates) setOrDelete("bookType", updates.bookType);
    if ("condition" in updates) setOrDelete("condition", updates.condition);

    if ("sort" in updates) {
      if (!updates.sort || updates.sort === "newest") {
        params.delete("sort");
      } else {
        params.set("sort", updates.sort);
      }
    }

    if ("page" in updates) {
      const safePage = updates.page && updates.page > 1 ? updates.page : 1;
      if (safePage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(safePage));
      }
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const handleBackToTop = () => {
    const container = scrollContainerRef.current;
    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop && container) {
      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== search) {
        updateUrl({ search: searchInput, page: 1 });
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput, search]);

  useEffect(() => {
    const fetchLookupsAndUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);

        const [wishlistRes, cartRes] = await Promise.all([
          supabase
            .from("wishlists")
            .select("id, book_id, user_id")
            .eq("user_id", user.id),
          supabase
            .from("cart_items")
            .select("id, book_id, quantity, user_id")
            .eq("user_id", user.id),
        ]);

        if (!wishlistRes.error && wishlistRes.data) {
          setWishlistBookIds(
            (wishlistRes.data as WishlistItem[]).map((item) => item.book_id),
          );
        }

        if (!cartRes.error && cartRes.data) {
          setCartBookIds(
            (cartRes.data as CartItem[]).map((item) => item.book_id),
          );
        }
      }

      const [categoriesRes, genresRes, bookTypesRes] = await Promise.all([
        supabase
          .from("categories")
          .select("id, name")
          .order("name", { ascending: true }),
        supabase
          .from("genres")
          .select("id, name")
          .order("name", { ascending: true }),
        supabase
          .from("book_types")
          .select("id, name")
          .order("name", { ascending: true }),
      ]);

      if (!categoriesRes.error && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      if (!genresRes.error && genresRes.data) {
        setGenres(genresRes.data);
      }

      if (!bookTypesRes.error && bookTypesRes.data) {
        setBookTypes(bookTypesRes.data);
      }
    };

    fetchLookupsAndUser();

    const channel = supabase
      .channel("marketplace-lookups")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        async () => {
          const { data } = await supabase
            .from("categories")
            .select("id, name")
            .order("name", { ascending: true });

          if (data) setCategories(data);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "genres" },
        async () => {
          const { data } = await supabase
            .from("genres")
            .select("id, name")
            .order("name", { ascending: true });

          if (data) setGenres(data);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "book_types" },
        async () => {
          const { data } = await supabase
            .from("book_types")
            .select("id, name")
            .order("name", { ascending: true });

          if (data) setBookTypes(data);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("books")
        .select(
          "id, title, author, price, condition, location, image_url, category_id, genre_id, book_type_id, stock_quantity, sold_count, status, created_at",
          { count: "exact" },
        )
        .neq("status", "hidden");

      if (search.trim()) {
        const keyword = search.trim();
        query = query.or(`title.ilike.%${keyword}%,author.ilike.%${keyword}%`);
      }

      if (selectedCategory) {
        query = query.eq("category_id", Number(selectedCategory));
      }

      if (selectedGenre) {
        query = query.eq("genre_id", Number(selectedGenre));
      }

      if (selectedBookType) {
        query = query.eq("book_type_id", Number(selectedBookType));
      }

      if (selectedCondition) {
        query = query.ilike("condition", selectedCondition);
      }

      if (sortBy === "price-low") {
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price-high") {
        query = query.order("price", { ascending: false });
      } else if (sortBy === "title-az") {
        query = query.order("title", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, count, error } = await query.range(from, to);

      if (!error && data) {
        const filteredBooks = (data as Book[]).filter((book) => {
          const remaining = (book.stock_quantity ?? 0) - (book.sold_count ?? 0);

          return remaining > 0 && (book.status || "").toLowerCase() !== "sold";
        });

        setBooks(filteredBooks);
        setTotalBooksCount(filteredBooks.length);

        const totalPages = Math.max(
          1,
          Math.ceil((count || 0) / ITEMS_PER_PAGE),
        );

        if (currentPage > totalPages) {
          updateUrl({ page: totalPages });
        }
      } else {
        setBooks([]);
        setTotalBooksCount(0);
      }

      setLoading(false);
    };

    fetchBooks();
  }, [
    supabase,
    currentPage,
    search,
    selectedCategory,
    selectedGenre,
    selectedBookType,
    selectedCondition,
    sortBy,
  ]);

  useEffect(() => {
    if (loading) return;

    const container = scrollContainerRef.current;
    const isDesktop = window.innerWidth >= 1024;

    const startHideTimer = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      hideTimerRef.current = setTimeout(() => {
        setShowMobileShortcutBar(false);
      }, 1400);
    };

    const startBackToTopHideTimer = () => {
      if (backToTopTimerRef.current) {
        clearTimeout(backToTopTimerRef.current);
      }

      backToTopTimerRef.current = setTimeout(() => {
        setShowBackToTop(false);
      }, 1200);
    };

    const getCurrentScrollY = () => {
      if (isDesktop && container) {
        return container.scrollTop;
      }
      return window.scrollY;
    };

    const handleScroll = () => {
      const currentY = getCurrentScrollY();

      if (currentY <= 40) {
        setShowMobileShortcutBar(true);
      } else if (currentY > lastScrollY.current) {
        setShowMobileShortcutBar(false);
      } else if (currentY < lastScrollY.current) {
        setShowMobileShortcutBar(true);
      }

      if (currentY > 150) {
        setShowBackToTop(true);
        startBackToTopHideTimer();
      } else {
        setShowBackToTop(false);
        if (backToTopTimerRef.current) {
          clearTimeout(backToTopTimerRef.current);
        }
      }

      lastScrollY.current = currentY;
      startHideTimer();
    };

    const initialY = getCurrentScrollY();

    setShowMobileShortcutBar(true);
    setShowBackToTop(false);
    lastScrollY.current = initialY;
    startHideTimer();

    if (isDesktop && container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (isDesktop && container) {
        container.removeEventListener("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      if (backToTopTimerRef.current) {
        clearTimeout(backToTopTimerRef.current);
      }
    };
  }, [loading]);

  const goToPage = (page: number) => {
    const safePage = Math.max(1, page);
    updateUrl({ page: safePage });

    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const applyCategory = (value: string) => {
    updateUrl({ category: value, page: 1 });
  };

  const applyGenre = (value: string) => {
    updateUrl({ genre: value, page: 1 });
  };

  const applyBookType = (value: string) => {
    updateUrl({ bookType: value, page: 1 });
  };

  const applyCondition = (value: string) => {
    updateUrl({ condition: value, page: 1 });
  };

  const applySort = (value: string) => {
    updateUrl({ sort: value, page: 1 });
  };

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

    const localBook = books.find((book) => book.id === bookId);

    if (!localBook) {
      showToast({
        title: "Book unavailable",
        message: "This book is no longer available.",
        type: "error",
      });
      return;
    }

    if (isSoldOut(localBook)) {
      showToast({
        title: "Out of stock",
        message: `"${localBook.title}" is already sold out.`,
        type: "info",
      });
      return;
    }

    setCartLoadingIds((prev) => [...prev, bookId]);

    try {
      const { data: latestBook, error: latestBookError } = await supabase
        .from("books")
        .select("id, title, stock_quantity, sold_count, status")
        .eq("id", bookId)
        .single();

      if (latestBookError || !latestBook) {
        throw latestBookError || new Error("Book not found.");
      }

      const latestRemaining = Math.max(
        (latestBook.stock_quantity ?? 0) - (latestBook.sold_count ?? 0),
        0,
      );

      if (
        latestRemaining <= 0 ||
        (latestBook.status || "").toLowerCase() === "sold"
      ) {
        showToast({
          title: "Out of stock",
          message: `"${latestBook.title}" is already sold out.`,
          type: "info",
        });
        return;
      }

      const { data: existingItem, error: existingError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("book_id", bookId)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existingItem) {
        const safeExistingItem = existingItem as ExistingCartItem;
        const nextQuantity = safeExistingItem.quantity + 1;

        if (nextQuantity > latestRemaining) {
          showToast({
            title: "Stock limit reached",
            message: `Only ${latestRemaining} item(s) available for "${latestBook.title}".`,
            type: "info",
          });
          return;
        }

        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: nextQuantity })
          .eq("id", safeExistingItem.id);

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

  const resetFilters = () => {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  };

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 8);

  const visibleGenres = showAllGenres ? genres : genres.slice(0, 8);

  const visibleBookTypes = showAllBookTypes ? bookTypes : bookTypes.slice(0, 8);

  const totalPages = Math.max(1, Math.ceil(totalBooksCount / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startResult =
    totalBooksCount === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;
  const endResult = Math.min(safeCurrentPage * ITEMS_PER_PAGE, totalBooksCount);

  const getVisiblePageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, safeCurrentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-xl border border-[#DDD6CC] bg-white px-3 py-2 text-sm text-[#1F1F1F] outline-none placeholder:text-[#9C9489] focus:border-[#E67E22]"
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowCategories((prev) => !prev)}
          className="mb-3 flex w-full items-center justify-between text-left"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1F1F1F]">
            Categories
          </h3>
          {showCategories ? (
            <ChevronUp size={16} className="text-[#6B6B6B]" />
          ) : (
            <ChevronDown size={16} className="text-[#6B6B6B]" />
          )}
        </button>

        {showCategories && (
          <>
            <div className="space-y-2">
              <button
                onClick={() => applyCategory("")}
                className={`block text-left text-sm ${
                  selectedCategory === ""
                    ? "font-semibold text-[#E67E22]"
                    : "text-[#6B6B6B] hover:text-[#1F1F1F]"
                }`}
              >
                All Categories
              </button>

              {visibleCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => applyCategory(String(category.id))}
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

            {categories.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllCategories((prev) => !prev)}
                className="mt-3 text-sm font-semibold text-[#E67E22] transition hover:text-[#cf6f1c]"
              >
                {showAllCategories ? "Show Less" : "Show More"}
              </button>
            )}
          </>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowGenres((prev) => !prev)}
          className="mb-3 flex w-full items-center justify-between text-left"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1F1F1F]">
            Genre
          </h3>
          {showGenres ? (
            <ChevronUp size={16} className="text-[#6B6B6B]" />
          ) : (
            <ChevronDown size={16} className="text-[#6B6B6B]" />
          )}
        </button>

        {showGenres && (
          <>
            <div className="space-y-2">
              <button
                onClick={() => applyGenre("")}
                className={`block text-left text-sm ${
                  selectedGenre === ""
                    ? "font-semibold text-[#E67E22]"
                    : "text-[#6B6B6B] hover:text-[#1F1F1F]"
                }`}
              >
                All Genres
              </button>

              {visibleGenres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => applyGenre(String(genre.id))}
                  className={`block text-left text-sm ${
                    selectedGenre === String(genre.id)
                      ? "font-semibold text-[#E67E22]"
                      : "text-[#6B6B6B] hover:text-[#1F1F1F]"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>

            {genres.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllGenres((prev) => !prev)}
                className="mt-3 text-sm font-semibold text-[#E67E22] transition hover:text-[#cf6f1c]"
              >
                {showAllGenres ? "Show Less" : "Show More"}
              </button>
            )}
          </>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowBookTypes((prev) => !prev)}
          className="mb-3 flex w-full items-center justify-between text-left"
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1F1F1F]">
            Types of Book
          </h3>
          {showBookTypes ? (
            <ChevronUp size={16} className="text-[#6B6B6B]" />
          ) : (
            <ChevronDown size={16} className="text-[#6B6B6B]" />
          )}
        </button>

        {showBookTypes && (
          <>
            <div className="space-y-2">
              <button
                onClick={() => applyBookType("")}
                className={`block text-left text-sm ${
                  selectedBookType === ""
                    ? "font-semibold text-[#E67E22]"
                    : "text-[#6B6B6B] hover:text-[#1F1F1F]"
                }`}
              >
                All Book Types
              </button>

              {visibleBookTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => applyBookType(String(type.id))}
                  className={`block text-left text-sm ${
                    selectedBookType === String(type.id)
                      ? "font-semibold text-[#E67E22]"
                      : "text-[#6B6B6B] hover:text-[#1F1F1F]"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>

            {bookTypes.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllBookTypes((prev) => !prev)}
                className="mt-3 text-sm font-semibold text-[#E67E22] transition hover:text-[#cf6f1c]"
              >
                {showAllBookTypes ? "Show Less" : "Show More"}
              </button>
            )}
          </>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#1F1F1F]">
          Condition
        </h3>
        <div className="space-y-2 pb-6">
          {["", "New", "Good", "Used"].map((condition) => (
            <button
              key={condition || "all"}
              onClick={() => applyCondition(condition)}
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

      <div className="space-y-2">
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
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[480px]:px-6 min-[768px]:px-8 min-[1024px]:px-10 min-[1280px]:px-20 min-[1440px]:px-0 lg:h-full">
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

        <div className="grid gap-6 py-4 min-[480px]:gap-6 min-[480px]:py-5 min-[768px]:gap-8 min-[768px]:py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:h-full lg:py-0">
          <aside className="hidden lg:block lg:h-full lg:overflow-hidden lg:border-r lg:border-[#E5E0D8] lg:pr-6 lg:pt-6">
            <div
              className={`h-full overflow-y-auto pr-2 pb-6 ${hiddenScrollbarClass}`}
            >
              {filterContent}
            </div>
          </aside>

          <div
            ref={scrollContainerRef}
            className={`min-w-0 lg:h-full lg:overflow-y-auto lg:-mr-38 ${hiddenScrollbarClass}`}
          >
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
                    {startResult} - {endResult} of {totalBooksCount} results
                  </p>
                </div>

                <div className="hidden items-center gap-3 lg:flex">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => applySort(e.target.value)}
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
                className={`fixed left-0 right-0 z-30 px-4 min-[480px]:px-6 transition-all duration-300 lg:hidden ${
                  showMobileShortcutBar
                    ? "pointer-events-auto top-[120px] translate-y-0 opacity-100"
                    : "pointer-events-none top-[120px] -translate-y-3 opacity-0"
                }`}
              >
                <div className="mx-auto w-full max-w-[1200px]">
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
                        onChange={(e) => applySort(e.target.value)}
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

              {totalBooksCount === 0 ? (
                <div className="rounded-2xl border border-[#E5E0D8] bg-white p-10 text-center text-[#6B6B6B]">
                  No books found.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 pb-6 min-[480px]:gap-4 min-[768px]:grid-cols-3 min-[768px]:gap-5 min-[1024px]:grid-cols-4 min-[1024px]:gap-6">
                    {books.map((book) => {
                      const isWishlisted = wishlistBookIds.includes(book.id);
                      const isWishlistLoading = wishlistLoadingIds.includes(
                        book.id,
                      );
                      const isCartLoading = cartLoadingIds.includes(book.id);
                      const isAlreadyInCart = cartBookIds.includes(book.id);
                      const soldOut = isSoldOut(book);
                      const remainingStock = getRemainingStock(book);

                      return (
                        <Link
                          key={book.id}
                          href={`/book/${book.id}`}
                          className="group block rounded-[22px] focus:outline-none"
                        >
                          <article className="overflow-hidden rounded-[22px] border border-[#E5E0D8] bg-white p-3 min-[480px]:p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(31,31,31,0.08)] active:scale-[0.99]">
                            <div className="relative overflow-hidden rounded-2xl bg-[#F7F4EE]">
                              {book.image_url ? (
                                <img
                                  src={book.image_url}
                                  alt={book.title}
                                  className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.04] min-[480px]:h-52 min-[768px]:h-60 min-[1024px]:h-64"
                                />
                              ) : (
                                <div className="flex h-40 w-full items-center justify-center bg-[#EEF1F6] text-[#7B8593] min-[480px]:h-52 min-[768px]:h-60 min-[1024px]:h-64">
                                  No Image
                                </div>
                              )}

                              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#1F1F1F] shadow-sm backdrop-blur-sm">
                                {book.condition}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleWishlist(book.id);
                                }}
                                disabled={isWishlistLoading}
                                className="absolute right-3 top-3 rounded-full bg-white/95 p-2.5 shadow-sm backdrop-blur-sm transition duration-200 hover:scale-105 hover:bg-[#F7F4EE] disabled:opacity-50"
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

                              {soldOut ? (
                                <span className="absolute bottom-3 left-3 rounded-full border border-[#D9D2C7] bg-[#F1ECE4]/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#6B6B6B] shadow-sm backdrop-blur-sm">
                                  Sold Out
                                </span>
                              ) : (
                                <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#1F1F1F] shadow-sm backdrop-blur-sm">
                                  {remainingStock} left
                                </span>
                              )}

                              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F1F1F]/18 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                              <div className="absolute inset-x-3 bottom-3 hidden translate-y-3 opacity-0 transition duration-300 md:block group-hover:translate-y-0 group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAddToCart(book.id);
                                  }}
                                  disabled={isCartLoading || soldOut}
                                  className={`w-full rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm transition ${
                                    soldOut
                                      ? "cursor-not-allowed border-[#D9D2C7] bg-[#F1ECE4]/95 text-[#8A8175] opacity-90"
                                      : "border-white/70 bg-white/92 text-[#1F1F1F] hover:bg-white"
                                  } disabled:opacity-60`}
                                >
                                  <span className="inline-flex items-center justify-center gap-2">
                                    <ShoppingCart size={13} />
                                    {soldOut
                                      ? "Sold Out"
                                      : isCartLoading
                                        ? "Adding..."
                                        : isAlreadyInCart
                                          ? "Add Again"
                                          : "Add to Cart"}
                                  </span>
                                </button>
                              </div>
                            </div>

                            <div className="pt-4">
                              <h2 className="line-clamp-2 min-h-[40px] text-[15px] font-semibold leading-tight text-[#1F1F1F] transition group-hover:text-[#2A211B] min-[480px]:min-h-[44px] min-[480px]:text-base min-[768px]:min-h-[48px]">
                                {book.title}
                              </h2>

                              <p className="mt-1 line-clamp-1 text-[12px] text-[#8A8175] min-[480px]:text-sm">
                                {book.author}
                              </p>

                              <div className="mt-3 flex items-end justify-between gap-2 min-[480px]:gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 text-sm text-[#8A8175]">
                                    <span className="line-clamp-1">
                                      {book.location}
                                    </span>
                                  </div>

                                  <p className="mt-1 pl-1 text-[11px] font-medium uppercase tracking-wide text-[#6B6B6B]">
                                    {soldOut ? "Not Available" : "Available"}
                                  </p>
                                </div>

                                <p className="shrink-0 text-base font-bold text-[#E67E22] min-[480px]:text-lg">
                                  ₱{book.price}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAddToCart(book.id);
                                }}
                                disabled={isCartLoading || soldOut}
                                className={`mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition min-[480px]:mt-4 min-[480px]:gap-2 min-[480px]:px-4 min-[480px]:py-2.5 min-[480px]:text-xs md:hidden ${
                                  soldOut
                                    ? "cursor-not-allowed bg-gray-300 text-white"
                                    : "bg-[#E67E22] text-white hover:bg-[#cf6f1c]"
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                              >
                                <ShoppingCart size={14} />
                                {soldOut
                                  ? "Sold Out"
                                  : isCartLoading
                                    ? "Adding..."
                                    : isAlreadyInCart
                                      ? "Add Again"
                                      : "Add to Cart"}
                              </button>
                            </div>
                          </article>
                        </Link>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex flex-row flex-wrap items-center justify-center gap-3 pb-8">
                      <button
                        type="button"
                        onClick={() => goToPage(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                        className="inline-flex items-center gap-2 rounded-full border border-[#D9D1C6] bg-white px-4 py-2 text-sm font-medium text-[#1F1F1F] transition hover:bg-[#F7F4EE] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </button>

                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {getVisiblePageNumbers().map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => goToPage(page)}
                            className={`h-10 min-w-[40px] rounded-full px-3 text-sm font-semibold transition ${
                              safeCurrentPage === page
                                ? "bg-[#E67E22] text-white"
                                : "border border-[#D9D1C6] bg-white text-[#1F1F1F] hover:bg-[#F7F4EE]"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => goToPage(safeCurrentPage + 1)}
                        disabled={safeCurrentPage === totalPages}
                        className="inline-flex items-center gap-2 rounded-full border border-[#D9D1C6] bg-white px-4 py-2 text-sm font-medium text-[#1F1F1F] transition hover:bg-[#F7F4EE] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleBackToTop}
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#E67E22] text-white shadow-lg transition-all duration-300 hover:bg-[#cf6f1c] ${
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
        aria-label="Back to top"
      >
        <ArrowUp size={18} />
      </button>
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
