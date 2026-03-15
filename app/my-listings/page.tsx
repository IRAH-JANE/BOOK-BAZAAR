"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Eye,
  Pencil,
  Trash2,
  MapPin,
  BookOpen,
  Search,
  CircleDollarSign,
  AlertTriangle,
  Copy,
  CheckCircle2,
  Archive,
  XCircle,
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

export default function MyListingsPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);

  const isMountedRef = useRef(true);

  const getSafeStatus = (status: string | null): BookStatus => {
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

  const fetchMyBooks = useCallback(async () => {
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }

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
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

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
        (book) => getSafeStatus(book.status) === selectedStatus,
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
      (book) => getSafeStatus(book.status) === "active",
    ).length;
    const soldListings = books.filter(
      (book) => getSafeStatus(book.status) === "sold",
    ).length;
    const lowStockListings = books.filter((book) => {
      const remaining = (book.stock_quantity ?? 0) - (book.sold_count ?? 0);
      return (
        getSafeStatus(book.status) !== "sold" && remaining > 0 && remaining <= 2
      );
    }).length;

    return {
      totalListings,
      activeListings,
      soldListings,
      lowStockListings,
    };
  }, [books]);

  const updateBookStatus = async (bookId: number, status: BookStatus) => {
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
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update listing status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const duplicateBook = async (book: Book) => {
    try {
      setActionLoadingId(book.id);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        alert("Please log in again.");
        return;
      }

      const { error } = await supabase.from("books").insert({
        seller_id: user.id,
        title: `${book.title} (Copy)`,
        author: book.author,
        price: book.price,
        condition: book.condition,
        location: book.location,
        image_url: book.image_url,
        status: "hidden",
        stock_quantity: book.stock_quantity ?? 1,
        sold_count: 0,
      });

      if (error) throw error;

      await fetchMyBooks();
    } catch (error) {
      console.error("Failed to duplicate listing:", error);
      alert("Failed to duplicate listing.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setActionLoadingId(deleteTarget.id);

      const { error } = await supabase
        .from("books")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) throw error;

      setBooks((prev) => prev.filter((book) => book.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete listing:", error);
      alert("Failed to delete listing.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusStyles = (status: BookStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "reserved":
        return "bg-yellow-100 text-yellow-700";
      case "sold":
        return "bg-gray-200 text-gray-700";
      case "hidden":
        return "bg-[#F1ECE4] text-[#8A8175]";
      default:
        return "bg-[#F1ECE4] text-[#8A8175]";
    }
  };

  const getRemainingStock = (book: Book) => {
    return Math.max((book.stock_quantity ?? 0) - (book.sold_count ?? 0), 0);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-7xl text-[#6B6B6B]">
          Loading your listings...
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E67E22] sm:text-sm">
                Seller Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[#1F1F1F] sm:text-4xl">
                My Listings
              </h1>
              <p className="mt-2 text-sm text-[#6B6B6B] sm:text-base">
                Manage the books you posted for sale.
              </p>
            </div>

            <Link
              href="/sell"
              className="inline-flex items-center justify-center rounded-full bg-[#E67E22] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#cf6f1c] sm:text-base"
            >
              Add New Listing
            </Link>
          </div>

          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
              <div className="flex items-center gap-3 text-[#6B6B6B]">
                <BookOpen size={18} />
                <span className="text-sm font-medium">Total Listings</span>
              </div>
              <p className="mt-4 text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
                {summary.totalListings}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
              <div className="flex items-center gap-3 text-[#6B6B6B]">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Active Listings</span>
              </div>
              <p className="mt-4 text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
                {summary.activeListings}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
              <div className="flex items-center gap-3 text-[#6B6B6B]">
                <CircleDollarSign size={18} />
                <span className="text-sm font-medium">Sold Listings</span>
              </div>
              <p className="mt-4 text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
                {summary.soldListings}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
              <div className="flex items-center gap-3 text-[#6B6B6B]">
                <AlertTriangle size={18} />
                <span className="text-sm font-medium">Low Stock</span>
              </div>
              <p className="mt-4 text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
                {summary.lowStockListings}
              </p>
            </div>
          </section>

          <section className="mb-8 rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
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
                  className="w-full rounded-2xl border border-[#D9D2C7] bg-white py-3 pl-11 pr-4 text-[#1F1F1F] outline-none focus:border-[#E67E22]"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-2xl border border-[#D9D2C7] bg-white px-4 py-3 text-[#1F1F1F] outline-none focus:border-[#E67E22]"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="hidden">Hidden</option>
              </select>

              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="rounded-2xl border border-[#D9D2C7] bg-white px-4 py-3 text-[#1F1F1F] outline-none focus:border-[#E67E22]"
              >
                <option value="">All Conditions</option>
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Used">Used</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-2xl border border-[#D9D2C7] bg-white px-4 py-3 text-[#1F1F1F] outline-none focus:border-[#E67E22]"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title-az">Title: A to Z</option>
              </select>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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
            <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
              <div className="flex items-center gap-3 text-[#8A8175]">
                <BookOpen size={20} />
                <p>You have not posted any books yet.</p>
              </div>

              <Link
                href="/sell"
                className="mt-5 inline-block rounded-full bg-[#E67E22] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#cf6f1c] sm:text-base"
              >
                Post Your First Book
              </Link>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E0D8] bg-white p-8 text-center text-[#6B6B6B] shadow-sm sm:rounded-3xl sm:p-10">
              No listings match your filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBooks.map((book) => {
                const status = getSafeStatus(book.status);
                const remainingStock = getRemainingStock(book);
                const isLowStock =
                  status !== "sold" &&
                  remainingStock > 0 &&
                  remainingStock <= 2;

                return (
                  <div
                    key={book.id}
                    className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
                        <div className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#F7F4EE]">
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
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="break-words text-xl font-bold text-[#1F1F1F] sm:text-2xl">
                              {book.title}
                            </h2>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusStyles(
                                status,
                              )}`}
                            >
                              {status}
                            </span>

                            {isLowStock && (
                              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600">
                                Low Stock
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-[#6B6B6B]">{book.author}</p>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-[#E67E22]">
                              ₱{book.price}
                            </span>

                            <span className="rounded-full bg-[#F7F4EE] px-3 py-1 text-sm font-medium text-[#6B6B6B]">
                              {book.condition}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-2 text-sm text-[#8A8175]">
                            <MapPin size={15} className="shrink-0" />
                            <span className="break-words">{book.location}</span>
                          </div>

                          <div className="mt-4 grid gap-2 text-sm sm:flex sm:flex-wrap sm:gap-3">
                            <span className="rounded-2xl bg-[#F7F4EE] px-3 py-2 text-[#1F1F1F]">
                              Stock: <strong>{book.stock_quantity ?? 0}</strong>
                            </span>
                            <span className="rounded-2xl bg-[#F7F4EE] px-3 py-2 text-[#1F1F1F]">
                              Sold: <strong>{book.sold_count ?? 0}</strong>
                            </span>
                            <span className="rounded-2xl bg-[#F7F4EE] px-3 py-2 text-[#1F1F1F]">
                              Remaining: <strong>{remainingStock}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 xl:max-w-[360px] xl:justify-end">
                        <Link
                          href={`/book/${book.id}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-4 py-2 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE] sm:flex-none"
                        >
                          <Eye size={16} />
                          View
                        </Link>

                        <Link
                          href={`/edit-listing/${book.id}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#E8A16A] px-4 py-2 text-sm font-semibold text-[#E67E22] transition hover:bg-[#E67E22] hover:text-white sm:flex-none"
                        >
                          <Pencil size={16} />
                          Edit
                        </Link>

                        <button
                          onClick={() => duplicateBook(book)}
                          disabled={actionLoadingId === book.id}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#E5E0D8] px-4 py-2 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE] disabled:opacity-60 sm:flex-none"
                        >
                          <Copy size={16} />
                          Duplicate
                        </button>

                        {status !== "sold" && (
                          <button
                            onClick={() => updateBookStatus(book.id, "sold")}
                            disabled={actionLoadingId === book.id}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-green-300 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50 disabled:opacity-60 sm:flex-none"
                          >
                            <CheckCircle2 size={16} />
                            Mark Sold
                          </button>
                        )}

                        {status !== "hidden" ? (
                          <button
                            onClick={() => updateBookStatus(book.id, "hidden")}
                            disabled={actionLoadingId === book.id}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#D9D2C7] px-4 py-2 text-sm font-semibold text-[#6B6B6B] transition hover:bg-[#F7F4EE] disabled:opacity-60 sm:flex-none"
                          >
                            <Archive size={16} />
                            Hide
                          </button>
                        ) : (
                          <button
                            onClick={() => updateBookStatus(book.id, "active")}
                            disabled={actionLoadingId === book.id}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60 sm:flex-none"
                          >
                            <CheckCircle2 size={16} />
                            Unhide
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteTarget(book)}
                          disabled={actionLoadingId === book.id}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-60 sm:flex-none"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-100 p-2 text-red-500">
                <XCircle size={20} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#1F1F1F] sm:text-xl">
                  Delete Listing
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-[#1F1F1F]">
                    {deleteTarget.title}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-2xl border border-[#D9D2C7] px-5 py-3 font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={actionLoadingId === deleteTarget.id}
                className="rounded-2xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {actionLoadingId === deleteTarget.id
                  ? "Deleting..."
                  : "Delete Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
