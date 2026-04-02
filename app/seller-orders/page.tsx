"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import SellerNavbar from "@/components/SellerNavbar";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import {
  Search,
  ShoppingBag,
  CheckCircle2,
  Package,
  Truck,
  Clock3,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  MapPin,
  Filter,
  ArrowRight,
} from "lucide-react";

type SellerOrder = {
  id: number;
  created_at: string | null;
  total_amount: number | null;
  shipping_address: string | null;
  payment_method: string | null;
  payment_status: string | null;
  delivery_method: string | null;
  shipping_fee: number | null;
  shipping_note: string | null;
  order_status: string | null;
};

type SellerBook = {
  id: number;
  title: string | null;
  author: string | null;
  image_url: string | null;
};

type SellerOrderItem = {
  id: number;
  quantity: number | null;
  price: number | null;
  item_status: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  estimated_delivery_date: string | null;
  seller_id: string | null;
  order_id: number;
  books: SellerBook | SellerBook[] | null;
};

type SellerOrderGroup = {
  order: SellerOrder;
  items: SellerOrderItem[];
};

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

function SellerOrdersSkeleton() {
  return (
    <>
      <SellerNavbar />
      <main className="min-h-screen bg-[#F7F4EE] px-4 py-6 sm:px-6 lg:px-10 xl:px-20 md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px]">
          <section className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6 lg:p-8">
            <SkeletonBox className="h-5 w-36" />
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
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <SkeletonBox className="h-12 w-full rounded-2xl" />
              <SkeletonBox className="h-12 w-full rounded-2xl" />
            </div>
          </section>

          <section className="mt-6 space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="rounded-[28px] border border-[#E5E0D8] bg-white p-5"
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_120px]">
                  <div>
                    <SkeletonBox className="h-6 w-40" />
                    <SkeletonBox className="mt-3 h-4 w-60" />
                    <SkeletonBox className="mt-3 h-4 w-44" />
                  </div>
                  <div className="flex items-start justify-end">
                    <SkeletonBox className="h-10 w-24 rounded-2xl" />
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

function formatCurrency(value: number | null | undefined) {
  return `₱${Number(value || 0).toFixed(2)}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function getBook(item: SellerOrderItem): SellerBook | null {
  if (!item.books) return null;
  return Array.isArray(item.books) ? item.books[0] || null : item.books;
}

function getOrderGroupStatus(group: SellerOrderGroup) {
  const statuses = group.items.map((item) =>
    (item.item_status || "").toLowerCase(),
  );

  if (statuses.some((status) => status === "pending")) return "pending";
  if (statuses.some((status) => status === "confirmed")) return "confirmed";
  if (statuses.some((status) => status === "packed")) return "packed";
  if (statuses.some((status) => status === "shipped")) return "shipped";
  if (statuses.some((status) => status === "out_for_delivery"))
    return "out_for_delivery";
  if (statuses.some((status) => status === "cancelled")) return "cancelled";
  if (statuses.every((status) => status === "received")) return "received";

  return group.order.order_status || "pending";
}

function statusLabel(status: string) {
  const safe = status.toLowerCase();

  if (safe === "out_for_delivery") return "Out for Delivery";
  return safe.charAt(0).toUpperCase() + safe.slice(1).replace(/_/g, " ");
}

function statusTone(status: string) {
  const safe = status.toLowerCase();

  if (safe === "pending")
    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  if (safe === "confirmed") return "border-blue-200 bg-blue-50 text-blue-700";
  if (safe === "packed")
    return "border-purple-200 bg-purple-50 text-purple-700";
  if (safe === "shipped" || safe === "out_for_delivery")
    return "border-sky-200 bg-sky-50 text-sky-700";
  if (safe === "received") return "border-green-200 bg-green-50 text-green-700";
  if (safe === "cancelled") return "border-red-200 bg-red-50 text-red-700";

  return "border-[#E5DED2] bg-[#F6EFE6] text-[#8A8175]";
}

export default function SellerOrdersPage() {
  const supabase = createSupabaseBrowser();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [orders, setOrders] = useState<SellerOrderGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openOrders, setOpenOrders] = useState<number[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

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
          seller_id,
          order_id,
          books (
            id,
            title,
            author,
            image_url
          )
        `,
        )
        .eq("seller_id", user.id)
        .order("id", { ascending: false });

      if (itemsError) throw itemsError;

      const sellerItems = (orderItemsData || []) as SellerOrderItem[];

      if (sellerItems.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const orderIds = [...new Set(sellerItems.map((item) => item.order_id))];

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(
          "id, created_at, total_amount, shipping_address, payment_method, payment_status, delivery_method, shipping_fee, shipping_note, order_status",
        )
        .in("id", orderIds)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const orderList = (ordersData as SellerOrder[]) || [];

      const grouped = orderList.map((order) => ({
        order,
        items: sellerItems.filter((item) => item.order_id === order.id),
      }));

      setOrders(grouped);

      if (grouped.length > 0) {
        setOpenOrders([grouped[0].order.id]);
      }
    } catch (error) {
      console.error(
        "Failed to load seller orders:",
        JSON.stringify(error, null, 2),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
      const groupStatus = getOrderGroupStatus(group).toLowerCase();

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
        statusFilter === "all" || groupStatus === statusFilter;

      if (!query) return statusMatches;
      return statusMatches && (orderMatches || itemMatches);
    });
  }, [orders, searchText, statusFilter]);

  const totalOrders = orders.length;
  const pendingCount = orders.filter(
    (group) => getOrderGroupStatus(group).toLowerCase() === "pending",
  ).length;
  const completedCount = orders.filter(
    (group) => getOrderGroupStatus(group).toLowerCase() === "received",
  ).length;
  const revenueEstimate = orders.reduce(
    (sum, group) =>
      sum +
      group.items.reduce(
        (inner, item) => inner + (item.price || 0) * (item.quantity || 0),
        0,
      ),
    0,
  );

  const updateItemStatus = async (
    itemId: number,
    nextStatus: "confirmed" | "packed" | "shipped" | "out_for_delivery",
  ) => {
    const confirmed = await confirm({
      title: "Update order item status?",
      message: `Change this order item to ${statusLabel(nextStatus)}?`,
      confirmText: "Update",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    try {
      setActionLoadingId(itemId);

      const { error } = await supabase
        .from("order_items")
        .update({ item_status: nextStatus })
        .eq("id", itemId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((group) => ({
          ...group,
          items: group.items.map((item) =>
            item.id === itemId ? { ...item, item_status: nextStatus } : item,
          ),
        })),
      );

      showToast({
        title: "Status updated",
        message: `Item marked as ${statusLabel(nextStatus)}.`,
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update seller item status:", error);
      showToast({
        title: "Update failed",
        message: "Failed to update item status.",
        type: "error",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return <SellerOrdersSkeleton />;
  }

  return (
    <>
      <SellerNavbar />

      <main className="min-h-screen bg-[#F7F4EE] px-4 py-6 sm:px-6 lg:px-10 xl:px-20 md:ml-[240px]">
        <div className="mx-auto w-full max-w-[1200px]">
          <section className="rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6 lg:p-8">
            <p className="inline-flex rounded-full bg-[#FFF3E7] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#C96A16]">
              Seller Dashboard
            </p>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
              Seller Orders
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5F5A52] sm:text-base">
              Review incoming orders, update item progress, and track buyer
              delivery details in one cleaner seller order space.
            </p>
          </section>

          <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Orders"
              value={totalOrders}
              subtitle="All orders linked to you"
              icon={ShoppingBag}
            />
            <SummaryCard
              title="Pending"
              value={pendingCount}
              subtitle="Needs seller attention"
              icon={Clock3}
              warn={pendingCount > 0}
            />
            <SummaryCard
              title="Completed"
              value={completedCount}
              subtitle="Buyer confirmed receipt"
              icon={CheckCircle2}
            />
            <SummaryCard
              title="Revenue Estimate"
              value={formatCurrency(revenueEstimate)}
              subtitle="Based on your sold items"
              icon={CircleDollarSign}
            />
          </section>

          <section className="mt-6 rounded-[28px] border border-[#E5E0D8] bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Filter size={18} className="text-[#8A8175]" />
              <p className="text-sm font-semibold text-[#1F1F1F]">
                Search and filter seller orders
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8175]"
                />
                <input
                  type="text"
                  placeholder="Search order ID, title, address, courier, tracking"
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
            <section className="mt-6 rounded-[28px] border border-[#E5E0D8] bg-white p-10 text-center">
              <p className="text-lg font-semibold text-[#1F1F1F]">
                No matching seller orders found
              </p>
              <p className="mt-2 text-sm text-[#5F5A52]">
                Try adjusting your search or status filter.
              </p>
            </section>
          ) : (
            <section className="mt-6 space-y-4">
              {filteredOrders.map((group) => {
                const isOpen = openOrders.includes(group.order.id);
                const groupStatus = getOrderGroupStatus(group);
                const firstItem = group.items[0];
                const firstBook = firstItem ? getBook(firstItem) : null;

                return (
                  <article
                    key={group.order.id}
                    className="overflow-hidden rounded-[28px] border border-[#E5E0D8] bg-white"
                  >
                    <button
                      onClick={() => toggleOrderOpen(group.order.id)}
                      className="flex w-full items-start justify-between gap-4 p-5 text-left transition hover:bg-[#FFFDF9] sm:p-6"
                    >
                      <div className="flex min-w-0 flex-1 gap-4">
                        <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#EEE6DB] bg-[#F7F4EE]">
                          {firstBook?.image_url ? (
                            <img
                              src={firstBook.image_url}
                              alt={firstBook.title || "Book image"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-[#9C9489]">
                              <Package size={18} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold text-[#1F1F1F]">
                              Order #{group.order.id}
                            </h2>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusTone(
                                groupStatus,
                              )}`}
                            >
                              {statusLabel(groupStatus)}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-[#5F5A52]">
                            {firstBook?.title || "Order items"}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#8A8175]">
                            <span>
                              Placed {formatDate(group.order.created_at)}
                            </span>
                            <span>•</span>
                            <span>{group.items.length} item(s)</span>
                            <span>•</span>
                            <span>
                              {group.order.payment_method || "Payment not set"}
                            </span>
                          </div>

                          <div className="mt-3 flex items-start gap-2 text-sm text-[#6B6B6B]">
                            <MapPin
                              size={15}
                              className="mt-0.5 shrink-0 text-[#8A8175]"
                            />
                            <span className="line-clamp-2">
                              {group.order.shipping_address ||
                                "No shipping address"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <div className="hidden text-right sm:block">
                          <p className="text-lg font-bold text-[#E67E22]">
                            {formatCurrency(
                              group.items.reduce(
                                (sum, item) =>
                                  sum +
                                  (item.price || 0) * (item.quantity || 0),
                                0,
                              ),
                            )}
                          </p>
                          <p className="mt-1 text-xs text-[#9C9489]">
                            Seller item value
                          </p>
                        </div>

                        <div className="rounded-full bg-[#F7F4EE] p-2 text-[#8A8175]">
                          {isOpen ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-[#ECE5DA] bg-[#FFFDF9] px-5 py-5 sm:px-6">
                        <div className="space-y-4">
                          {group.items.map((item) => {
                            const book = getBook(item);
                            const currentStatus = (
                              item.item_status || "pending"
                            ).toLowerCase();

                            return (
                              <div
                                key={item.id}
                                className="rounded-[24px] border border-[#E5E0D8] bg-white p-4"
                              >
                                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-lg font-bold text-[#1F1F1F]">
                                        {book?.title || "Book item"}
                                      </p>
                                      <span
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusTone(
                                          currentStatus,
                                        )}`}
                                      >
                                        {statusLabel(currentStatus)}
                                      </span>
                                    </div>

                                    <p className="mt-1 text-sm text-[#5F5A52]">
                                      {book?.author || "Unknown author"}
                                    </p>

                                    <div className="mt-4 grid gap-2 text-sm text-[#5F5A52] sm:grid-cols-2">
                                      <p>
                                        Quantity:{" "}
                                        <span className="font-semibold text-[#1F1F1F]">
                                          {item.quantity || 0}
                                        </span>
                                      </p>
                                      <p>
                                        Item Value:{" "}
                                        <span className="font-semibold text-[#E67E22]">
                                          {formatCurrency(
                                            (item.price || 0) *
                                              (item.quantity || 0),
                                          )}
                                        </span>
                                      </p>
                                      <p>
                                        Courier:{" "}
                                        <span className="font-semibold text-[#1F1F1F]">
                                          {item.courier_name || "Not set"}
                                        </span>
                                      </p>
                                      <p>
                                        Tracking:{" "}
                                        <span className="font-semibold text-[#1F1F1F]">
                                          {item.tracking_number || "Not set"}
                                        </span>
                                      </p>
                                      <p className="sm:col-span-2">
                                        Estimated Delivery:{" "}
                                        <span className="font-semibold text-[#1F1F1F]">
                                          {formatDate(
                                            item.estimated_delivery_date,
                                          )}
                                        </span>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-3">
                                    {currentStatus === "pending" && (
                                      <ActionButton
                                        label="Confirm"
                                        icon={CheckCircle2}
                                        loading={actionLoadingId === item.id}
                                        onClick={() =>
                                          updateItemStatus(item.id, "confirmed")
                                        }
                                      />
                                    )}

                                    {currentStatus === "confirmed" && (
                                      <ActionButton
                                        label="Mark Packed"
                                        icon={Package}
                                        loading={actionLoadingId === item.id}
                                        onClick={() =>
                                          updateItemStatus(item.id, "packed")
                                        }
                                      />
                                    )}

                                    {currentStatus === "packed" && (
                                      <ActionButton
                                        label="Mark Shipped"
                                        icon={Truck}
                                        loading={actionLoadingId === item.id}
                                        onClick={() =>
                                          updateItemStatus(item.id, "shipped")
                                        }
                                      />
                                    )}

                                    {currentStatus === "shipped" && (
                                      <ActionButton
                                        label="Out for Delivery"
                                        icon={ArrowRight}
                                        loading={actionLoadingId === item.id}
                                        onClick={() =>
                                          updateItemStatus(
                                            item.id,
                                            "out_for_delivery",
                                          )
                                        }
                                      />
                                    )}

                                    {(currentStatus === "out_for_delivery" ||
                                      currentStatus === "received" ||
                                      currentStatus === "cancelled") && (
                                      <div className="rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] px-4 py-3 text-center text-sm font-semibold text-[#6B6B6B]">
                                        {currentStatus === "received"
                                          ? "Buyer already confirmed receipt"
                                          : currentStatus === "out_for_delivery"
                                            ? "Waiting for buyer confirmation"
                                            : "No more actions"}
                                      </div>
                                    )}
                                  </div>
                                </div>
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

function ActionButton({
  label,
  icon: Icon,
  onClick,
  loading,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#F0B27A] bg-[#FFF7EF] px-4 py-3 text-sm font-semibold text-[#E67E22] transition hover:bg-[#FFEBD8] disabled:opacity-60"
    >
      <Icon size={16} />
      {loading ? "Updating..." : label}
    </button>
  );
}
