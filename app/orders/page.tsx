"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  Search,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock3,
  Star,
} from "lucide-react";

type OrderItemBook = {
  id: number;
  title: string;
  author: string;
  image_url: string | null;
};

type BuyerOrderItem = {
  id: number;
  quantity: number;
  price: number;
  item_status: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  estimated_delivery_date: string | null;
  received_at?: string | null;
  books: OrderItemBook | OrderItemBook[] | null;
};

type BuyerOrder = {
  id: number;
  created_at: string;
  total_amount: number | null;
  shipping_address: string | null;
  payment_method: string | null;
  payment_status: string | null;
  delivery_method: string | null;
  shipping_fee: number | null;
  shipping_note: string | null;
  order_status: string | null;
};

type GroupedBuyerOrder = {
  order: BuyerOrder;
  items: (BuyerOrderItem & { order_id: number })[];
};

type ExistingReview = {
  id: number;
  book_id: number;
  rating: number;
  review_text: string | null;
};

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

function OrdersPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[32px] border border-[#EEE7DC] bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F9F4EC] px-6 py-8 shadow-[0_12px_40px_rgba(31,31,31,0.06)] sm:px-8 sm:py-10">
          <SkeletonBox className="h-5 w-32 rounded-full" />
          <SkeletonBox className="mt-4 h-12 w-56" />
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
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <SkeletonBox className="h-12 w-full rounded-2xl" />
            <SkeletonBox className="h-12 w-full rounded-2xl" />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)]"
            >
              <SkeletonBox className="h-8 w-40" />
              <SkeletonBox className="mt-3 h-4 w-32" />
              <SkeletonBox className="mt-5 h-24 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [orders, setOrders] = useState<GroupedBuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [openOrders, setOpenOrders] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [reviewMap, setReviewMap] = useState<Record<number, ExistingReview>>(
    {},
  );
  const [openReviewBookId, setOpenReviewBookId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState<Record<number, number>>({});
  const [reviewHover, setReviewHover] = useState<Record<number, number>>({});
  const [reviewText, setReviewText] = useState<Record<number, string>>({});
  const [reviewSavingBookId, setReviewSavingBookId] = useState<number | null>(
    null,
  );
  const [reviewDeletingBookId, setReviewDeletingBookId] = useState<
    number | null
  >(null);

  const getBook = (item: BuyerOrderItem): OrderItemBook | null => {
    if (!item.books) return null;
    return Array.isArray(item.books) ? (item.books[0] ?? null) : item.books;
  };

  const formatItemStatus = (status: string | null) => {
    const map: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      packed: "Packed",
      shipped: "Shipped",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      received: "Received",
      cancelled: "Cancelled",
    };

    return map[status || "pending"] || status || "Pending";
  };

  const formatOrderStatus = (status: string | null) => {
    const map: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      packed: "Packed",
      shipped: "Shipped",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      received: "Received",
      cancelled: "Cancelled",
    };

    return map[status || "pending"] || status || "Pending";
  };

  const getStatusBadgeClass = (status: string | null) => {
    switch (status) {
      case "confirmed":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "packed":
        return "border-purple-200 bg-purple-50 text-purple-700";
      case "shipped":
        return "border-orange-200 bg-orange-50 text-orange-700";
      case "out_for_delivery":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "delivered":
      case "received":
        return "border-green-200 bg-green-50 text-green-700";
      case "cancelled":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  const fetchReviewsForReceivedBooks = async (
    userId: string,
    groupedOrders: GroupedBuyerOrder[],
  ) => {
    const receivedBookIds = Array.from(
      new Set(
        groupedOrders.flatMap(
          (group) =>
            group.items
              .filter(
                (item) => (item.item_status || "").toLowerCase() === "received",
              )
              .map((item) => {
                const book = getBook(item);
                return book?.id || null;
              })
              .filter(Boolean) as number[],
        ),
      ),
    );

    if (receivedBookIds.length === 0) {
      setReviewMap({});
      return;
    }

    const { data, error } = await supabase
      .from("book_reviews")
      .select("id, book_id, rating, review_text")
      .eq("user_id", userId)
      .in("book_id", receivedBookIds);

    if (error) {
      console.error("Failed to load existing reviews:", error);
      return;
    }

    const reviewLookup: Record<number, ExistingReview> = {};
    (data || []).forEach((review) => {
      reviewLookup[review.book_id] = review as ExistingReview;
    });

    setReviewMap(reviewLookup);

    const initialRatings: Record<number, number> = {};
    const initialTexts: Record<number, string> = {};

    (data || []).forEach((review) => {
      initialRatings[review.book_id] = review.rating || 0;
      initialTexts[review.book_id] = review.review_text || "";
    });

    setReviewRating((prev) => ({ ...prev, ...initialRatings }));
    setReviewText((prev) => ({ ...prev, ...initialTexts }));
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(
          "id, created_at, total_amount, shipping_address, payment_method, payment_status, delivery_method, shipping_fee, shipping_note, order_status",
        )
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const orderList = (ordersData as BuyerOrder[]) || [];

      if (orderList.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const orderIds = orderList.map((order) => order.id);

      const { data: orderItemsData, error: itemsError } = await supabase
        .from("order_items")
        .select(
          `
          id,
          quantity,
          price,
          item_status,
          courier_name,
          tracking_number,
          estimated_delivery_date,
          received_at,
          order_id,
          books (
            id,
            title,
            author,
            image_url
          )
          `,
        )
        .in("order_id", orderIds)
        .order("id", { ascending: false });

      if (itemsError) throw itemsError;

      const items = (orderItemsData || []) as (BuyerOrderItem & {
        order_id: number;
      })[];

      const grouped = orderList.map((order) => ({
        order,
        items: items.filter((item) => item.order_id === order.id),
      }));

      setOrders(grouped);

      if (grouped.length > 0) {
        setOpenOrders([grouped[0].order.id]);
      }

      await fetchReviewsForReceivedBooks(user.id, grouped);
    } catch (error) {
      console.error("Failed to load buyer orders:", error);
      showToast({
        title: "Load failed",
        message: "Failed to load your orders.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleMarkAsReceived = async (itemId: number) => {
    const confirmed = await confirm({
      title: "Confirm receipt?",
      message:
        "Click this only if you already received the book. After this, you can rate the product.",
      confirmText: "Mark as Received",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      setActionLoadingId(itemId);

      const { error } = await supabase
        .from("order_items")
        .update({
          item_status: "received",
          received_at: new Date().toISOString(),
        })
        .eq("id", itemId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((group) => ({
          ...group,
          items: group.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  item_status: "received",
                  received_at: new Date().toISOString(),
                }
              : item,
          ),
        })),
      );

      showToast({
        title: "Marked as received",
        message: "You can now rate this book.",
        type: "success",
      });

      router.refresh();
    } catch (error) {
      console.error("Failed to confirm item receipt:", error);
      showToast({
        title: "Update failed",
        message: "Failed to mark this item as received.",
        type: "error",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const openReviewEditor = (bookId: number) => {
    setOpenReviewBookId((prev) => (prev === bookId ? null : bookId));

    if (!reviewRating[bookId]) {
      setReviewRating((prev) => ({
        ...prev,
        [bookId]: reviewMap[bookId]?.rating || 0,
      }));
    }

    if (reviewText[bookId] === undefined) {
      setReviewText((prev) => ({
        ...prev,
        [bookId]: reviewMap[bookId]?.review_text || "",
      }));
    }
  };

  const submitReview = async (bookId: number) => {
    const rating = reviewRating[bookId] || 0;
    const text = reviewText[bookId] || "";
    const existing = reviewMap[bookId];

    if (!rating) {
      showToast({
        title: "Rating required",
        message: "Please choose a star rating first.",
        type: "info",
      });
      return;
    }

    try {
      setReviewSavingBookId(bookId);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast({
          title: "Login required",
          message: "Please log in first.",
          type: "info",
        });
        return;
      }

      if (existing) {
        const { error } = await supabase
          .from("book_reviews")
          .update({
            rating,
            review_text: text.trim() || null,
          })
          .eq("id", existing.id);

        if (error) throw error;

        setReviewMap((prev) => ({
          ...prev,
          [bookId]: {
            ...existing,
            rating,
            review_text: text.trim() || null,
          },
        }));

        showToast({
          title: "Review updated",
          message: "Your review was updated successfully.",
          type: "success",
        });
      } else {
        const { data, error } = await supabase
          .from("book_reviews")
          .insert([
            {
              book_id: bookId,
              user_id: user.id,
              rating,
              review_text: text.trim() || null,
            },
          ])
          .select("id, book_id, rating, review_text")
          .single();

        if (error) throw error;

        setReviewMap((prev) => ({
          ...prev,
          [bookId]: data as ExistingReview,
        }));

        showToast({
          title: "Review submitted",
          message: "Thank you for rating this book.",
          type: "success",
        });
      }

      setOpenReviewBookId(null);
      router.refresh();
    } catch (error: any) {
      showToast({
        title: "Review failed",
        message:
          error?.message || "Something went wrong while saving your review.",
        type: "error",
      });
    } finally {
      setReviewSavingBookId(null);
    }
  };

  const deleteReview = async (bookId: number) => {
    const existing = reviewMap[bookId];
    if (!existing) return;

    try {
      setReviewDeletingBookId(bookId);

      const { error } = await supabase
        .from("book_reviews")
        .delete()
        .eq("id", existing.id);

      if (error) throw error;

      setReviewMap((prev) => {
        const next = { ...prev };
        delete next[bookId];
        return next;
      });

      setReviewRating((prev) => ({
        ...prev,
        [bookId]: 0,
      }));

      setReviewText((prev) => ({
        ...prev,
        [bookId]: "",
      }));

      setOpenReviewBookId(null);

      showToast({
        title: "Review removed",
        message: "Your review was deleted.",
        type: "success",
      });

      router.refresh();
    } catch (error: any) {
      showToast({
        title: "Delete failed",
        message: error?.message || "Could not delete your review.",
        type: "error",
      });
    } finally {
      setReviewDeletingBookId(bookId);
      setReviewDeletingBookId(null);
    }
  };

  const toggleOrderOpen = (orderId: number) => {
    setOpenOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const filteredOrders = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return orders.filter((group) => {
      const orderMatches =
        String(group.order.id).includes(query) ||
        (group.order.shipping_address || "").toLowerCase().includes(query) ||
        (group.order.payment_method || "").toLowerCase().includes(query) ||
        (group.order.delivery_method || "").toLowerCase().includes(query);

      const itemMatches = group.items.some((item) => {
        const book = getBook(item);
        return (
          (book?.title || "").toLowerCase().includes(query) ||
          (book?.author || "").toLowerCase().includes(query) ||
          (item.courier_name || "").toLowerCase().includes(query) ||
          (item.tracking_number || "").toLowerCase().includes(query)
        );
      });

      const statusMatches =
        statusFilter === "all" ||
        (group.order.order_status || "pending") === statusFilter ||
        group.items.some(
          (item) => (item.item_status || "pending") === statusFilter,
        );

      const searchMatches = !query || orderMatches || itemMatches;

      return searchMatches && statusMatches;
    });
  }, [orders, searchText, statusFilter]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((group) =>
    group.items.some((item) =>
      ["pending", "confirmed", "packed"].includes(item.item_status || ""),
    ),
  ).length;
  const inTransitOrders = orders.filter((group) =>
    group.items.some((item) =>
      ["shipped", "out_for_delivery"].includes(item.item_status || ""),
    ),
  ).length;
  const completedOrders = orders.filter((group) =>
    group.items.every((item) => (item.item_status || "") === "received"),
  ).length;

  if (loading) {
    return <OrdersPageSkeleton />;
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[32px] border border-[#EEE7DC] bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F9F4EC] px-6 py-8 shadow-[0_12px_40px_rgba(31,31,31,0.06)] sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#E67E22]/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#F3C998]/20 blur-2xl" />

          <div className="relative z-10 max-w-2xl">
            <p className="inline-flex rounded-full bg-[#E67E22]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#C96A16]">
              Buyer Dashboard
            </p>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl lg:text-5xl">
              My Orders
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#6B6B6B] sm:text-base">
              Track your placed orders, review delivery details, and check the
              progress of every purchased book.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-[#E67E22]" size={16} />
              <span className="text-sm text-[#6B6B6B]">Total Orders</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#1F1F1F]">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)]">
            <div className="flex items-center gap-2">
              <Clock3 className="text-[#E67E22]" size={16} />
              <span className="text-sm text-[#6B6B6B]">Pending</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#1F1F1F]">
              {pendingOrders}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)]">
            <div className="flex items-center gap-2">
              <Truck className="text-[#E67E22]" size={16} />
              <span className="text-sm text-[#6B6B6B]">In Transit</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#1F1F1F]">
              {inTransitOrders}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-[#E67E22]" size={16} />
              <span className="text-sm text-[#6B6B6B]">Completed</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#1F1F1F]">
              {completedOrders}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_8px_24px_rgba(31,31,31,0.05)]">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8175]"
              />
              <input
                type="text"
                placeholder="Search order ID, title, address, courier, tracking..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full rounded-2xl border border-[#DED8CF] bg-white py-3 pl-10 pr-4 text-sm text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-2xl border border-[#DED8CF] bg-white px-4 py-3 text-sm text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </section>

        {filteredOrders.length === 0 ? (
          <section className="mt-8 overflow-hidden rounded-[32px] border border-[#E8E1D7] bg-[#FFFDF9] p-8 text-center shadow-[0_12px_30px_rgba(31,31,31,0.05)] sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF3E7] text-[#E67E22] shadow-sm">
              <ShoppingBag size={30} />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-[#1F1F1F]">
              No orders found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#6B6B6B] sm:text-base">
              You have no matching orders yet. Start browsing books and place
              your first order.
            </p>

            <Link
              href="/marketplace"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#E67E22] px-7 py-3 font-semibold text-white transition duration-200 hover:bg-[#cf6f1c]"
            >
              Browse Books
            </Link>
          </section>
        ) : (
          <section className="mt-8 space-y-4">
            {filteredOrders.map((group) => {
              const isOpen = openOrders.includes(group.order.id);
              const firstItem = group.items[0];
              const firstBook = firstItem ? getBook(firstItem) : null;

              return (
                <article
                  key={group.order.id}
                  className="overflow-hidden rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_10px_28px_rgba(31,31,31,0.05)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      {firstBook?.image_url ? (
                        <img
                          src={firstBook.image_url}
                          alt={firstBook.title}
                          className="h-16 w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-12 items-center justify-center rounded-xl bg-[#F1ECE4] text-[10px] text-[#8A8175]">
                          No Image
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="text-xl font-bold text-[#1F1F1F]">
                          Order #{group.order.id}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6B6B6B]">
                          <span>
                            {new Date(
                              group.order.created_at,
                            ).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>{group.items.length} item(s)</span>
                          <span>•</span>
                          <span>
                            {formatOrderStatus(group.order.order_status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium ${getStatusBadgeClass(
                          group.order.order_status,
                        )}`}
                      >
                        {formatOrderStatus(group.order.order_status)}
                      </span>

                      <button
                        onClick={() => toggleOrderOpen(group.order.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#D9D1C6] bg-white px-3 py-1.5 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
                      >
                        {isOpen ? "Hide" : "View"}
                        {isOpen ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-5 border-t border-[#EEE6DB] pt-5">
                      <div className="mb-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-2xl bg-[#FFFDF9] p-4 ring-1 ring-[#EDE7DE]">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8175]">
                            Shipping Address
                          </p>
                          <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-[#1F1F1F]">
                            <MapPin
                              size={16}
                              className="mt-1 shrink-0 text-[#E67E22]"
                            />
                            <span>
                              {group.order.shipping_address ||
                                "No shipping address"}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-[#FFFDF9] p-4 ring-1 ring-[#EDE7DE]">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8175]">
                            Payment & Delivery
                          </p>
                          <div className="mt-3 space-y-2 text-sm text-[#1F1F1F]">
                            <div className="flex items-start gap-2">
                              <CreditCard
                                size={15}
                                className="mt-0.5 shrink-0 text-[#E67E22]"
                              />
                              <span>{group.order.payment_method || "N/A"}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Truck
                                size={15}
                                className="mt-0.5 shrink-0 text-[#E67E22]"
                              />
                              <span>
                                {group.order.delivery_method || "N/A"}
                              </span>
                            </div>
                            <p className="text-[#6B6B6B]">
                              Payment Status:{" "}
                              {group.order.payment_status || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 rounded-2xl bg-[#FCF7F0] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium text-[#6B6B6B]">
                            Shipping Fee
                          </span>
                          <span className="font-semibold text-[#1F1F1F]">
                            ₱{Number(group.order.shipping_fee || 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-4 border-t border-[#EADFD0] pt-3">
                          <span className="text-base font-semibold text-[#1F1F1F]">
                            Order Total
                          </span>
                          <span className="text-xl font-bold text-[#E67E22]">
                            ₱{Number(group.order.total_amount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {group.order.shipping_note && (
                        <div className="mb-4 rounded-2xl bg-[#FFFDF9] p-4 ring-1 ring-[#EDE7DE]">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8175]">
                            Shipping Note
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#1F1F1F]">
                            {group.order.shipping_note}
                          </p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {group.items.map((item) => {
                          const book = getBook(item);
                          const currentStatus = (
                            item.item_status || "pending"
                          ).toLowerCase();
                          const canConfirmReceipt =
                            currentStatus === "out_for_delivery";
                          const bookId = book?.id || 0;
                          const existingReview = bookId
                            ? reviewMap[bookId]
                            : null;
                          const isReviewOpen = openReviewBookId === bookId;
                          const currentRating =
                            reviewRating[bookId] ?? existingReview?.rating ?? 0;
                          const currentHover = reviewHover[bookId] || 0;
                          const currentReviewText =
                            reviewText[bookId] ??
                            existingReview?.review_text ??
                            "";

                          return (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                  {book?.image_url ? (
                                    <img
                                      src={book.image_url}
                                      alt={book.title}
                                      className="h-16 w-12 rounded-xl object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-16 w-12 items-center justify-center rounded-xl bg-[#F1ECE4] text-[10px] text-[#8A8175]">
                                      No Image
                                    </div>
                                  )}

                                  <div className="min-w-0">
                                    <h3 className="truncate text-base font-semibold text-[#1F1F1F]">
                                      {book?.title || "Book"}
                                    </h3>
                                    <p className="text-sm text-[#6B6B6B]">
                                      {book?.author || "Unknown Author"}
                                    </p>
                                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-[#6B6B6B]">
                                      <span>Qty: {item.quantity}</span>
                                      <span>₱{item.price}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col items-start gap-2 sm:items-end">
                                  <span
                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                                      item.item_status,
                                    )}`}
                                  >
                                    {formatItemStatus(item.item_status)}
                                  </span>

                                  {canConfirmReceipt && (
                                    <button
                                      onClick={() =>
                                        handleMarkAsReceived(item.id)
                                      }
                                      disabled={actionLoadingId === item.id}
                                      className="inline-flex items-center justify-center rounded-full bg-[#E67E22] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-50"
                                    >
                                      {actionLoadingId === item.id
                                        ? "Updating..."
                                        : "Mark as Received"}
                                    </button>
                                  )}

                                  {currentStatus === "received" &&
                                    bookId > 0 && (
                                      <>
                                        <button
                                          onClick={() =>
                                            openReviewEditor(bookId)
                                          }
                                          className="inline-flex items-center justify-center rounded-full border border-[#F0B27A] bg-[#FFF7EF] px-4 py-2 text-xs font-semibold text-[#E67E22] transition hover:bg-[#FFEBD8]"
                                        >
                                          {existingReview
                                            ? "Edit Review"
                                            : "Rate this Book"}
                                        </button>

                                        <span className="text-xs font-medium text-[#6B6B6B]">
                                          You can now rate this book
                                        </span>
                                      </>
                                    )}
                                </div>
                              </div>

                              {(item.courier_name ||
                                item.tracking_number ||
                                item.estimated_delivery_date) && (
                                <div className="mt-4 grid gap-3 md:grid-cols-3">
                                  <div className="rounded-xl bg-[#F7F4EE] px-3 py-3 text-sm text-[#1F1F1F]">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8175]">
                                      Courier
                                    </p>
                                    <p className="mt-1">
                                      {item.courier_name || "N/A"}
                                    </p>
                                  </div>

                                  <div className="rounded-xl bg-[#F7F4EE] px-3 py-3 text-sm text-[#1F1F1F]">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8175]">
                                      Tracking Number
                                    </p>
                                    <p className="mt-1 break-all">
                                      {item.tracking_number || "N/A"}
                                    </p>
                                  </div>

                                  <div className="rounded-xl bg-[#F7F4EE] px-3 py-3 text-sm text-[#1F1F1F]">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8175]">
                                      Estimated Delivery
                                    </p>
                                    <p className="mt-1">
                                      {item.estimated_delivery_date || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {currentStatus === "received" &&
                                bookId > 0 &&
                                isReviewOpen && (
                                  <div className="mt-4 rounded-2xl border border-[#E5E0D8] bg-[#FFFCF8] p-4">
                                    <h4 className="text-sm font-bold text-[#1F1F1F]">
                                      {existingReview
                                        ? "Edit your review"
                                        : "Rate this book"}
                                    </h4>

                                    <p className="mt-1 text-sm text-[#6B6B6B]">
                                      Share your feedback without leaving this
                                      page.
                                    </p>

                                    <div className="mt-4 flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((value) => {
                                        const active =
                                          (currentHover || currentRating) >=
                                          value;

                                        return (
                                          <button
                                            key={value}
                                            type="button"
                                            onMouseEnter={() =>
                                              setReviewHover((prev) => ({
                                                ...prev,
                                                [bookId]: value,
                                              }))
                                            }
                                            onMouseLeave={() =>
                                              setReviewHover((prev) => ({
                                                ...prev,
                                                [bookId]: 0,
                                              }))
                                            }
                                            onClick={() =>
                                              setReviewRating((prev) => ({
                                                ...prev,
                                                [bookId]: value,
                                              }))
                                            }
                                            className="rounded-full p-1"
                                          >
                                            <Star
                                              size={24}
                                              className={
                                                active
                                                  ? "fill-[#E67E22] text-[#E67E22]"
                                                  : "text-[#D6CEC2]"
                                              }
                                            />
                                          </button>
                                        );
                                      })}
                                    </div>

                                    <textarea
                                      value={currentReviewText}
                                      onChange={(e) =>
                                        setReviewText((prev) => ({
                                          ...prev,
                                          [bookId]: e.target.value,
                                        }))
                                      }
                                      rows={4}
                                      placeholder="Share your experience with this book..."
                                      className="mt-4 w-full rounded-2xl border border-[#DED8CF] bg-white px-4 py-3 text-sm text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]"
                                    />

                                    <div className="mt-4 flex flex-wrap gap-3">
                                      <button
                                        type="button"
                                        onClick={() => submitReview(bookId)}
                                        disabled={reviewSavingBookId === bookId}
                                        className="inline-flex items-center justify-center rounded-full bg-[#E67E22] px-5 py-3 font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-50"
                                      >
                                        {reviewSavingBookId === bookId
                                          ? "Saving..."
                                          : existingReview
                                            ? "Update Review"
                                            : "Submit Review"}
                                      </button>

                                      {existingReview && (
                                        <button
                                          type="button"
                                          onClick={() => deleteReview(bookId)}
                                          disabled={
                                            reviewDeletingBookId === bookId
                                          }
                                          className="inline-flex items-center justify-center rounded-full border border-[#D9D1C6] bg-white px-5 py-3 font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE] disabled:opacity-50"
                                        >
                                          {reviewDeletingBookId === bookId
                                            ? "Deleting..."
                                            : "Delete Review"}
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setOpenReviewBookId(null)
                                        }
                                        className="inline-flex items-center justify-center rounded-full border border-[#D9D1C6] bg-white px-5 py-3 font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
