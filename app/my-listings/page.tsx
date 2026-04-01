"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { useRouter } from "next/navigation";
import SellerNavbar from "@/components/SellerNavbar";
import {
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
  ChevronRight,
  SlidersHorizontal,
  Boxes,
  EyeOff,
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
    <>
      <SellerNavbar />

      <main className="min-h-screen bg-[#F7F4EE] px-4 py-6 sm:px-6 lg:px-10 xl:px-20 md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px]">
          <section className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6 lg:p-8">
            <SkeletonBox className="h-5 w-32" />
            <SkeletonBox className="mt-4 h-10 w-64 max-w-full" />
            <SkeletonBox className="mt-3 h-5 w-[420px] max-w-full" />
          </section>

          <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-[#E5E0D8] bg-white p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="mt-4 h-8 w-16" />
                    <SkeletonBox className="mt-2 h-4 w-28" />
                  </div>
                  <SkeletonBox className="h-11 w-11" />
                </div>
              </div>
            ))}
          </section>

          <section className="mt-6 rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
              <SkeletonBox className="h-12 w-full rounded-2xl" />
              <SkeletonBox className="h-12 w-full rounded-2xl" />
              <SkeletonBox className="h-12 w-full rounded-2xl" />
              <SkeletonBox className="h-12 w-full rounded-2xl" />
            </div>
          </section>

          <section className="mt-6 space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="rounded-[28px] border border-[#E5E0D8] bg-white p-4 sm:p-5"
              >
                <div className="grid gap-4 lg:grid-cols-[100px_minmax(0,1fr)_170px] lg:items-center">
                  <SkeletonBox className="h-28 w-20 rounded-2xl" />

                  <div className="min-w-0">
                    <SkeletonBox className="h-7 w-52 max-w-full" />
                    <SkeletonBox className="mt-2 h-4 w-32" />
                    <SkeletonBox className="mt-3 h-4 w-28" />
                    <div className="mt-4 flex gap-2">
                      <SkeletonBox className="h-7 w-20 rounded-full" />
                      <SkeletonBox className="h-7 w-20 rounded-full" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <SkeletonBox className="h-11 w-full rounded-2xl" />
                    <SkeletonBox className="h-11 w-full rounded-2xl" />
                    <SkeletonBox className="h-11 w-full rounded-2xl" />
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </>
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
    <>
      <SellerNavbar />

      <main className="min-h-screen bg-[#F7F4EE] px-4 py-6 sm:px-6 lg:px-10 xl:px-20 md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px]">
          <section className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="inline-flex rounded-full bg-[#FFF3E7] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#C96A16]">
                  Seller Dashboard
                </p>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
                  My Listings
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5F5A52] sm:text-base">
                  Manage your posted books, monitor stock, and keep your seller
                  space clean without repeating unnecessary actions.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Listings"
              value={summary.totalListings}
              subtitle="All books in your store"
              icon={BookOpen}
            />
            <SummaryCard
              title="Active Listings"
              value={summary.activeListings}
              subtitle="Visible to buyers"
              icon={CheckCircle2}
            />
            <SummaryCard
              title="Sold Out"
              value={summary.soldListings}
              subtitle="No stock left"
              icon={CircleDollarSign}
            />
            <SummaryCard
              title="Low Stock"
              value={summary.lowStockListings}
              subtitle="Needs attention soon"
              icon={AlertTriangle}
              warn={summary.lowStockListings > 0}
            />
          </section>

          <section className="mt-6 rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-[#8A8175]" />
              <p className="text-sm font-semibold text-[#1F1F1F]">
                Filter and organize your listings
              </p>
            </div>

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
                <option value="reserved">Reserved</option>
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
            <section className="mt-6 rounded-[28px] border border-[#E5E0D8] bg-white p-10 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF3E7] text-[#E67E22]">
                <Package2 size={30} />
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[#1F1F1F]">
                You have not posted any books yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#5F5A52] sm:text-base">
                Start building your seller space by posting your first listing.
              </p>

              <Link
                href="/sell"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#E67E22] px-7 py-3 font-semibold text-white transition hover:bg-[#cf6f1c]"
              >
                Post Your First Book
              </Link>
            </section>
          ) : filteredBooks.length === 0 ? (
            <section className="mt-6 rounded-[28px] border border-[#E5E0D8] bg-white p-10 text-center">
              <p className="text-lg font-semibold text-[#1F1F1F]">
                No listings match your filters
              </p>
              <p className="mt-2 text-sm text-[#5F5A52]">
                Try adjusting the status, condition, or search term.
              </p>
            </section>
          ) : (
            <section className="mt-6 space-y-4">
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
                    className="overflow-hidden rounded-[28px] border border-[#E5E0D8] bg-white p-4 transition hover:shadow-md sm:p-5"
                  >
                    <div className="grid gap-4 lg:grid-cols-[96px_minmax(0,1fr)_170px] lg:items-center">
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
                        className="grid cursor-pointer gap-4 lg:col-span-2 lg:grid-cols-[96px_minmax(0,1fr)] lg:items-center"
                      >
                        <div className="mx-auto flex h-28 w-20 items-center justify-center overflow-hidden rounded-2xl border border-[#EEE6DB] bg-[#F7F4EE] sm:mx-0">
                          {book.image_url ? (
                            <img
                              src={book.image_url}
                              alt={book.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-[#9C9489]">
                              <Boxes size={18} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-start gap-2">
                            <h2 className="break-words text-2xl font-bold leading-tight text-[#1F1F1F]">
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

                          <p className="mt-1 text-[16px] text-[#5F5A52]">
                            {book.author}
                          </p>

                          <div className="mt-3 flex items-center gap-2 text-sm text-[#8A8175]">
                            <MapPin size={15} className="shrink-0" />
                            <span className="break-words">{book.location}</span>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-[#FFF3E7] px-4 py-2 text-base font-semibold text-[#C96A16]">
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

                      <div className="flex flex-col gap-3">
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
                              onClick={() =>
                                updateBookStatus(book.id, "hidden")
                              }
                              disabled={actionLoadingId === book.id}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#DDD5C8] bg-[#FAF7F2] px-4 py-3 text-sm font-semibold text-[#6B6B6B] transition hover:bg-[#F3EEE7] disabled:opacity-60"
                            >
                              <EyeOff size={16} />
                              Hide
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                updateBookStatus(book.id, "active")
                              }
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
    </>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  warn = false,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ size?: number }>;
  warn?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-[#E5E0D8] bg-white p-5 transition hover:shadow-sm sm:rounded-[28px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#9C9489]">{title}</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1F1F1F]">{value}</h2>
          <p className="mt-2 text-sm text-[#5F5A52]">{subtitle}</p>
        </div>

        <div
          className={`rounded-2xl p-3 ${
            warn ? "bg-[#FFF1E8] text-[#E67E22]" : "bg-[#FFF3E7] text-[#E67E22]"
          }`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
