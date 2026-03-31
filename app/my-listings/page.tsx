"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { useRouter } from "next/navigation";
import {
  Eye,
  Pencil,
  Trash2,
  MapPin,
  BookOpen,
  Search,
  CircleDollarSign,
  AlertTriangle,
  CheckCircle2,
  Archive,
  Plus,
  Package2,
} from "lucide-react";

type BookStatus = "active" | "reserved" | "sold" | "hidden";

type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  condition: string;
  location: string;
  image_url: string | null;
  status: string | null;
  stock_quantity: number | null;
  sold_count: number | null;
  created_at?: string | null;
};

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

function MyListingsPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[32px] border border-[#EEE7DC] bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F9F4EC] px-6 py-8 shadow-[0_12px_40px_rgba(31,31,31,0.06)] sm:px-8 sm:py-10">
          <SkeletonBox className="h-5 w-36 rounded-full" />
          <SkeletonBox className="mt-4 h-12 w-64" />
          <SkeletonBox className="mt-3 h-5 w-80 max-w-full" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)]"
            >
              <SkeletonBox className="h-4 w-28" />
              <SkeletonBox className="mt-4 h-8 w-16" />
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_8px_24px_rgba(31,31,31,0.05)]">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
            <SkeletonBox className="h-12 w-full rounded-2xl" />
            <SkeletonBox className="h-12 w-full rounded-2xl" />
            <SkeletonBox className="h-12 w-full rounded-2xl" />
            <SkeletonBox className="h-12 w-full rounded-2xl" />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-[30px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)]"
            >
              <div className="grid gap-5 lg:grid-cols-[110px_minmax(0,1fr)_180px] lg:items-center">
                <SkeletonBox className="h-40 w-28 rounded-[24px]" />

                <div className="min-w-0">
                  <SkeletonBox className="h-9 w-72" />
                  <SkeletonBox className="mt-3 h-5 w-40" />
                  <SkeletonBox className="mt-3 h-4 w-32" />
                  <div className="mt-4 flex gap-3">
                    <SkeletonBox className="h-10 w-24 rounded-full" />
                    <SkeletonBox className="h-10 w-20 rounded-full" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <SkeletonBox className="h-10 w-24 rounded-full" />
                    <SkeletonBox className="h-10 w-24 rounded-full" />
                    <SkeletonBox className="h-10 w-28 rounded-full" />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <SkeletonBox className="h-12 w-full rounded-2xl" />
                  <SkeletonBox className="h-12 w-full rounded-2xl" />
                  <SkeletonBox className="h-12 w-full rounded-2xl" />
                  <SkeletonBox className="h-12 w-full rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function MyListingsPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const isMountedRef = useRef(true);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const supabase = createSupabaseBrowser();

  const router = useRouter();

  const getBaseStatus = (status: string | null): BookStatus => {
    const safe = (status || "active").toLowerCase();
    if (
      safe === "active" ||
      safe === "reserved" ||
      safe === "sold" ||
      safe === "hidden"
    ) {
      return safe;
    }
    return "active";
  };

  const getRemainingStock = (book: Book) => {
    return Math.max((book.stock_quantity ?? 0) - (book.sold_count ?? 0), 0);
  };

  const getEffectiveStatus = (book: Book): BookStatus => {
    const baseStatus = getBaseStatus(book.status);
    const remaining = getRemainingStock(book);

    if (baseStatus === "hidden") return "hidden";
    if (remaining <= 0) return "sold";

    return baseStatus === "sold" ? "active" : baseStatus;
  };

  const fetchMyBooks = useCallback(async () => {
    try {
      if (isMountedRef.current) setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        if (isMountedRef.current) {
          setBooks([]);
          setFilteredBooks([]);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("books")
        .select(
          "id, title, author, price, condition, location, image_url, status, stock_quantity, sold_count, created_at",
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const safeBooks = (data || []).map((book) => ({
        ...book,
        status: book.status || "active",
        stock_quantity: book.stock_quantity ?? 1,
        sold_count: book.sold_count ?? 0,
      })) as Book[];

      if (isMountedRef.current) {
        setBooks(safeBooks);
        setFilteredBooks(safeBooks);
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      if (isMountedRef.current) {
        setBooks([]);
        setFilteredBooks([]);
        showToast({
          title: "Load failed",
          message: "Failed to load your listings.",
          type: "error",
        });
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [supabase, showToast]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchMyBooks();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchMyBooks]);

  useEffect(() => {
    let result = [...books];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          book.location.toLowerCase().includes(q),
      );
    }

    if (selectedStatus) {
      result = result.filter(
        (book) => getEffectiveStatus(book) === selectedStatus,
      );
    }

    if (selectedCondition) {
      result = result.filter(
        (book) =>
          book.condition.toLowerCase() === selectedCondition.toLowerCase(),
      );
    }

    if (sortBy === "oldest") {
      result.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return aTime - bTime;
      });
    } else if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "title-az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });
    }

    setFilteredBooks(result);
  }, [books, search, selectedStatus, selectedCondition, sortBy]);

  const summary = useMemo(() => {
    const totalListings = books.length;
    const activeListings = books.filter(
      (book) => getEffectiveStatus(book) === "active",
    ).length;
    const soldListings = books.filter(
      (book) => getEffectiveStatus(book) === "sold",
    ).length;
    const lowStockListings = books.filter((book) => {
      const remaining = getRemainingStock(book);
      const status = getEffectiveStatus(book);
      return (
        status !== "sold" &&
        status !== "hidden" &&
        remaining > 0 &&
        remaining <= 2
      );
    }).length;

    return {
      totalListings,
      activeListings,
      soldListings,
      lowStockListings,
    };
  }, [books]);

  const updateBookStatus = async (
    bookId: number,
    status: "active" | "hidden",
  ) => {
    const statusConfig = {
      active: {
        title: "Unhide Listing?",
        message: "This listing will become visible to buyers again.",
        confirmText: "Unhide",
        cancelText: "Cancel",
        successTitle: "Listing unhidden",
        successMessage: "The listing is visible again.",
      },
      hidden: {
        title: "Hide Listing?",
        message:
          "This listing will be hidden from buyers, but it will stay in your dashboard.",
        confirmText: "Hide",
        cancelText: "Cancel",
        successTitle: "Listing hidden",
        successMessage: "The listing has been hidden.",
      },
    } as const;

    const config = statusConfig[status];

    const confirmed = await confirm({
      title: config.title,
      message: config.message,
      confirmText: config.confirmText,
      cancelText: config.cancelText,
      danger: status === "hidden",
    });

    if (!confirmed) return;

    try {
      setActionLoadingId(bookId);

      const { error } = await supabase
        .from("books")
        .update({ status })
        .eq("id", bookId);

      if (error) throw error;

      setBooks((prev) =>
        prev.map((book) => (book.id === bookId ? { ...book, status } : book)),
      );

      showToast({
        title: config.successTitle,
        message: config.successMessage,
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      showToast({
        title: "Update failed",
        message: "Failed to update listing status.",
        type: "error",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDelete = async (book: Book) => {
    const confirmed = await confirm({
      title: "Delete Listing?",
      message: `Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      danger: true,
    });

    if (!confirmed) return;

    try {
      setActionLoadingId(book.id);

      const { error } = await supabase.from("books").delete().eq("id", book.id);

      if (error) throw error;

      setBooks((prev) => prev.filter((item) => item.id !== book.id));

      showToast({
        title: "Listing deleted",
        message: "The listing has been deleted successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to delete listing:", error);
      showToast({
        title: "Delete failed",
        message: "Failed to delete listing.",
        type: "error",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusStyles = (status: BookStatus) => {
    switch (status) {
      case "active":
        return "border-green-200 bg-green-50 text-green-700";
      case "reserved":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
      case "sold":
        return "border-[#D9D2C7] bg-[#F1ECE4] text-[#6B6B6B]";
      case "hidden":
        return "border-[#E5DED2] bg-[#F6EFE6] text-[#8A8175]";
      default:
        return "border-[#E5DED2] bg-[#F6EFE6] text-[#8A8175]";
    }
  };

  if (loading) {
    return <MyListingsPageSkeleton />;
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[32px] border border-[#EEE7DC] bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F9F4EC] px-6 py-8 shadow-[0_12px_40px_rgba(31,31,31,0.06)] sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#E67E22]/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#F3C998]/20 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex rounded-full bg-[#E67E22]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#C96A16]">
                Seller Dashboard
              </p>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl lg:text-5xl">
                My Listings
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#6B6B6B] sm:text-base">
                Manage your posted books, monitor stock, and keep your seller
                space clean and professional.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/sell"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E67E22] px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#cf6f1c]"
              >
                <Plus size={16} />
                Add New Listing
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)]">
            <div className="flex items-center gap-3 text-[#6B6B6B]">
              <BookOpen size={18} />
              <span className="text-sm font-medium">Total Listings</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-[#1F1F1F]">
              {summary.totalListings}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)]">
            <div className="flex items-center gap-3 text-[#6B6B6B]">
              <CheckCircle2 size={18} />
              <span className="text-sm font-medium">Active Listings</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-[#1F1F1F]">
              {summary.activeListings}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)]">
            <div className="flex items-center gap-3 text-[#6B6B6B]">
              <CircleDollarSign size={18} />
              <span className="text-sm font-medium">Sold Out</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-[#1F1F1F]">
              {summary.soldListings}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)]">
            <div className="flex items-center gap-3 text-[#6B6B6B]">
              <AlertTriangle size={18} />
              <span className="text-sm font-medium">Low Stock</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-[#1F1F1F]">
              {summary.lowStockListings}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_8px_24px_rgba(31,31,31,0.05)]">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8175]"
              />
              <input
                type="text"
                placeholder="Search title, author, or location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#D9D2C7] bg-white py-3 pl-11 pr-4 text-[#1F1F1F] outline-none transition focus:border-[#E67E22]"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-2xl border border-[#D9D2C7] bg-white px-4 py-3 text-[#1F1F1F] outline-none transition focus:border-[#E67E22]"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="sold">Sold Out</option>
              <option value="hidden">Hidden</option>
            </select>

            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="rounded-2xl border border-[#D9D2C7] bg-white px-4 py-3 text-[#1F1F1F] outline-none transition focus:border-[#E67E22]"
            >
              <option value="">All Conditions</option>
              <option value="New">New</option>
              <option value="Good">Good</option>
              <option value="Used">Used</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-2xl border border-[#D9D2C7] bg-white px-4 py-3 text-[#1F1F1F] outline-none transition focus:border-[#E67E22]"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="title-az">Title: A to Z</option>
            </select>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#8A8175]">
              Showing {filteredBooks.length} of {books.length} listings
            </p>

            <button
              onClick={() => {
                setSearch("");
                setSelectedStatus("");
                setSelectedCondition("");
                setSortBy("newest");
              }}
              className="w-full rounded-full border border-[#D9D2C7] px-4 py-2 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE] sm:w-auto"
            >
              Reset Filters
            </button>
          </div>
        </section>

        {books.length === 0 ? (
          <section className="mt-8 overflow-hidden rounded-[32px] border border-[#E8E1D7] bg-[#FFFDF9] p-8 text-center shadow-[0_12px_30px_rgba(31,31,31,0.05)] sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF3E7] text-[#E67E22] shadow-sm">
              <Package2 size={30} />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-[#1F1F1F]">
              You have not posted any books yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#6B6B6B] sm:text-base">
              Start building your seller space by posting your first listing.
            </p>

            <Link
              href="/sell"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#E67E22] px-7 py-3 font-semibold text-white transition duration-200 hover:bg-[#cf6f1c]"
            >
              Post Your First Book
            </Link>
          </section>
        ) : filteredBooks.length === 0 ? (
          <section className="mt-8 rounded-[32px] border border-[#E8E1D7] bg-[#FFFDF9] p-10 text-center text-[#6B6B6B] shadow-[0_12px_30px_rgba(31,31,31,0.05)]">
            No listings match your filters.
          </section>
        ) : (
          <section className="mt-8 space-y-5">
            {filteredBooks.map((book) => {
              const status = getEffectiveStatus(book);
              const remainingStock = getRemainingStock(book);
              const isLowStock =
                status !== "sold" &&
                status !== "hidden" &&
                remainingStock > 0 &&
                remainingStock <= 2;

              return (
                <article
                  key={book.id}
                  className="overflow-hidden rounded-[30px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)] transition duration-300 hover:shadow-[0_16px_36px_rgba(31,31,31,0.08)]"
                >
                  <div className="grid gap-5 lg:grid-cols-[110px_minmax(0,1fr)_170px] lg:items-center">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/book/${book.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/book/${book.id}`);
                        }
                      }}
                      className="grid min-w-0 cursor-pointer gap-5 lg:col-span-2 lg:grid-cols-[110px_minmax(0,1fr)] lg:items-center"
                    >
                      <div className="mx-auto h-40 w-28 overflow-hidden rounded-[24px] bg-[#F7F4EE] sm:mx-0">
                        {book.image_url ? (
                          <img
                            src={book.image_url}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-[#8A8175]">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-start gap-2">
                          <h2 className="break-words text-[28px] font-bold leading-tight text-[#1F1F1F] transition hover:text-[#C96A16]">
                            {book.title}
                          </h2>

                          <span
                            className={`mt-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusStyles(
                              status,
                            )}`}
                          >
                            {status === "sold" ? "Sold Out" : status}
                          </span>

                          {isLowStock && (
                            <span className="mt-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600">
                              Low Stock
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-[17px] text-[#6B6B6B]">
                          {book.author}
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-sm text-[#8A8175]">
                          <MapPin size={15} className="shrink-0" />
                          <span className="break-words">{book.location}</span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="rounded-full bg-[#FFF3E7] px-4 py-2 text-lg font-semibold text-[#C96A16]">
                            ₱{book.price}
                          </span>

                          <span className="rounded-full bg-[#F3EEE7] px-4 py-2 text-sm font-medium text-[#6B6B6B]">
                            {book.condition}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2.5">
                          <span className="rounded-full bg-[#F3EEE7] px-4 py-2 text-sm text-[#3B342C]">
                            Stock: <strong>{book.stock_quantity ?? 0}</strong>
                          </span>
                          <span className="rounded-full bg-[#F3EEE7] px-4 py-2 text-sm text-[#3B342C]">
                            Sold: <strong>{book.sold_count ?? 0}</strong>
                          </span>
                          <span className="rounded-full bg-[#F3EEE7] px-4 py-2 text-sm text-[#3B342C]">
                            Remaining: <strong>{remainingStock}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:items-stretch">
                      <Link
                        href={`/edit-listing/${book.id}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#F0B27A] bg-[#FFF7EF] px-4 py-3 text-sm font-semibold text-[#E67E22] transition hover:bg-[#FFEBD8]"
                      >
                        <Pencil size={16} />
                        Edit
                      </Link>

                      {status !== "sold" &&
                        (status !== "hidden" ? (
                          <button
                            onClick={() => updateBookStatus(book.id, "hidden")}
                            disabled={actionLoadingId === book.id}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#DDD5C8] bg-[#FAF7F2] px-4 py-3 text-sm font-semibold text-[#6B6B6B] transition hover:bg-[#F3EEE7] disabled:opacity-60"
                          >
                            <Archive size={16} />
                            Hide
                          </button>
                        ) : (
                          <button
                            onClick={() => updateBookStatus(book.id, "active")}
                            disabled={actionLoadingId === book.id}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
                          >
                            <CheckCircle2 size={16} />
                            Unhide
                          </button>
                        ))}

                      <button
                        onClick={() => confirmDelete(book)}
                        disabled={actionLoadingId === book.id}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
