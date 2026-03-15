"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock3,
  Package,
  Truck,
  House,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type OrderBook = {
  title: string;
  author: string;
  image_url: string | null;
};

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  item_status: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  estimated_delivery_date: string | null;
  received_at: string | null;
  books: OrderBook | OrderBook[] | null;
};

type Order = {
  id: number;
  total_amount: number;
  order_status: string | null;
  payment_status: string | null;
  payment_method: string | null;
  delivery_method: string | null;
  shipping_fee: number | null;
  shipping_note: string | null;
  created_at: string;
  order_items: OrderItem[] | null;
};

type TimelineStep = {
  key:
    | "pending"
    | "confirmed"
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "received";
  label: string;
};

const timelineSteps: TimelineStep[] = [
  { key: "pending", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out" },
  { key: "delivered", label: "Delivered" },
  { key: "received", label: "Received" },
];

const orderTabs = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "received", label: "Received" },
  { key: "cancelled", label: "Cancelled" },
] as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingReceivedId, setMarkingReceivedId] = useState<number | null>(
    null,
  );
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(
    null,
  );
  const [openOrders, setOpenOrders] = useState<number[]>([]);
  const [activeTab, setActiveTab] =
    useState<(typeof orderTabs)[number]["key"]>("all");

  const fetchOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        total_amount,
        order_status,
        payment_status,
        payment_method,
        delivery_method,
        shipping_fee,
        shipping_note,
        created_at,
        order_items (
          id,
          quantity,
          price,
          item_status,
          courier_name,
          tracking_number,
          estimated_delivery_date,
          received_at,
          books (
            title,
            author,
            image_url
          )
        )
        `,
      )
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const nextOrders = (data as unknown as Order[]) || [];
    setOrders(nextOrders);

    if (nextOrders.length > 0 && openOrders.length === 0) {
      setOpenOrders([nextOrders[0].id]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleOpen = (orderId: number) => {
    setOpenOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const getBook = (item: OrderItem): OrderBook | null => {
    if (!item.books) return null;
    return Array.isArray(item.books) ? (item.books[0] ?? null) : item.books;
  };

  const formatStatus = (status: string | null) => {
    if (!status) return "Pending";

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

    return map[status] || status;
  };

  const getOrderBadgeClass = (status: string | null) => {
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
        return "border-green-200 bg-green-50 text-green-700";
      case "received":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "cancelled":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  const getPaymentBadgeClass = (status: string | null) => {
    switch (status) {
      case "paid":
        return "border-green-200 bg-green-50 text-green-700";
      case "pending_verification":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "unpaid":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  const getTimelineIndex = (status: string | null) => {
    const key = status || "pending";
    return timelineSteps.findIndex((step) => step.key === key);
  };

  const getOrderProgressStatus = (order: Order) => {
    if (order.order_status === "cancelled") return "cancelled";
    return order.order_status || "pending";
  };

  const canCancelOrder = (order: Order) => {
    return order.order_status === "pending";
  };

  const handleCancelOrder = async (orderId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) return;

    setCancellingOrderId(orderId);

    const { error: itemsError } = await supabase
      .from("order_items")
      .update({
        item_status: "cancelled",
      })
      .eq("order_id", orderId);

    if (itemsError) {
      setCancellingOrderId(null);
      alert(itemsError.message);
      return;
    }

    const { error: orderError } = await supabase
      .from("orders")
      .update({
        order_status: "cancelled",
      })
      .eq("id", orderId);

    setCancellingOrderId(null);

    if (orderError) {
      alert(orderError.message);
      return;
    }

    fetchOrders();
  };

  const handleMarkReceived = async (orderItemId: number, orderId: number) => {
    setMarkingReceivedId(orderItemId);

    const { error: itemError } = await supabase
      .from("order_items")
      .update({
        item_status: "received",
        received_at: new Date().toISOString(),
      })
      .eq("id", orderItemId);

    if (itemError) {
      setMarkingReceivedId(null);
      alert(itemError.message);
      return;
    }

    const { data: siblingItems, error: siblingError } = await supabase
      .from("order_items")
      .select("item_status")
      .eq("order_id", orderId);

    if (siblingError) {
      setMarkingReceivedId(null);
      alert(siblingError.message);
      return;
    }

    const statuses = (siblingItems || []).map((item) => item.item_status);
    const nextOrderStatus = statuses.every(
      (status) => status === "received" || status === "delivered",
    )
      ? "received"
      : "delivered";

    const { error: orderError } = await supabase
      .from("orders")
      .update({
        order_status: nextOrderStatus,
      })
      .eq("id", orderId);

    setMarkingReceivedId(null);

    if (orderError) {
      alert(orderError.message);
      return;
    }

    fetchOrders();
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter(
      (order) => (order.order_status || "pending") === activeTab,
    );
  }, [orders, activeTab]);

  const totalItemsCount = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + (order.order_items?.length || 0),
      0,
    );
  }, [orders]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5F1] px-6 py-8">
        Loading orders...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E67E22]">
            Purchase Tracking
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1F1F1F]">My Orders</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Track your books from order placement to delivery and receipt.
          </p>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Package className="text-[#E67E22]" size={16} />
              <span className="text-sm text-[#6B6B6B]">Total Orders</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
              {orders.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Truck className="text-[#E67E22]" size={16} />
              <span className="text-sm text-[#6B6B6B]">Books Ordered</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
              {totalItemsCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <House className="text-[#E67E22]" size={16} />
              <span className="text-sm text-[#6B6B6B]">Completed</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
              {
                orders.filter((order) =>
                  ["delivered", "received"].includes(order.order_status || ""),
                ).length
              }
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {orderTabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#E67E22] text-white"
                    : "border border-[#D9D1C6] bg-white text-[#1F1F1F] hover:bg-[#F7F4EE]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <p className="text-[#6B6B6B]">No orders found in this tab.</p>

            <Link
              href="/marketplace"
              className="mt-4 inline-block rounded-full bg-[#E67E22] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#cf6f1c]"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const progressStatus = getOrderProgressStatus(order);
              const currentIndex = getTimelineIndex(progressStatus);
              const isOpen = openOrders.includes(order.id);
              const firstItem = order.order_items?.[0];
              const firstBook = firstItem ? getBook(firstItem) : null;

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      {firstBook?.image_url ? (
                        <img
                          src={firstBook.image_url}
                          alt={firstBook.title}
                          className="h-14 w-11 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-14 w-11 rounded-lg bg-gray-200" />
                      )}

                      <div className="min-w-0">
                        <h2 className="text-xl font-semibold text-[#1F1F1F]">
                          Order #{order.id}
                        </h2>
                        <p className="text-sm text-[#8A8175]">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-[#6B6B6B]">
                          <span>{order.order_items?.length || 0} item(s)</span>
                          <span>•</span>
                          <span>{order.payment_method || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-sm font-semibold ${getOrderBadgeClass(
                          order.order_status,
                        )}`}
                      >
                        {formatStatus(order.order_status)}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-sm font-semibold ${getPaymentBadgeClass(
                          order.payment_status,
                        )}`}
                      >
                        {order.payment_status || "pending"}
                      </span>

                      {canCancelOrder(order) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrderId === order.id}
                          className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {cancellingOrderId === order.id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}

                      <button
                        onClick={() => toggleOpen(order.id)}
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
                    <div className="mt-4 border-t border-[#EEE6DB] pt-4">
                      {order.order_status === "cancelled" ? (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                          This order has been cancelled.
                        </div>
                      ) : (
                        <div className="mb-4 rounded-xl border border-[#E5E0D8] bg-[#FFFDF9] px-3 py-3">
                          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8175]">
                            Order Progress
                          </h3>

                          <div className="mt-3 grid grid-cols-7 items-center text-center">
                            {timelineSteps.map((step, index) => {
                              const isDone = currentIndex >= index;
                              const isCurrent = currentIndex === index;

                              return (
                                <div
                                  key={step.key}
                                  className="relative flex flex-col items-center"
                                >
                                  {index < timelineSteps.length - 1 && (
                                    <div
                                      className={`absolute left-1/2 top-3 hidden h-[2px] w-full md:block ${
                                        currentIndex > index
                                          ? "bg-[#E67E22]"
                                          : "bg-[#E5E0D8]"
                                      }`}
                                    />
                                  )}

                                  <div
                                    className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                                      isDone
                                        ? "border-[#E67E22] bg-[#FFF7EF] text-[#E67E22]"
                                        : "border-[#D9D1C6] bg-white text-[#B9B0A5]"
                                    }`}
                                  >
                                    {isDone ? (
                                      isCurrent ? (
                                        <Clock3 size={10} />
                                      ) : (
                                        <CheckCircle2 size={10} />
                                      )
                                    ) : (
                                      <Circle size={8} />
                                    )}
                                  </div>

                                  <p
                                    className={`mt-1 text-[9px] font-medium leading-tight ${
                                      isDone
                                        ? "text-[#1F1F1F]"
                                        : "text-[#8A8175]"
                                    }`}
                                  >
                                    {step.label}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="mb-4 grid gap-3 rounded-xl bg-[#FFFDF9] p-3 ring-1 ring-[#EDE7DE] sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8175]">
                            Payment Method
                          </p>
                          <p className="mt-1 text-sm text-[#1F1F1F]">
                            {order.payment_method || "Not available"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8175]">
                            Delivery Method
                          </p>
                          <p className="mt-1 text-sm text-[#1F1F1F]">
                            {order.delivery_method || "Not available"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8175]">
                            Shipping Fee
                          </p>
                          <p className="mt-1 text-sm text-[#1F1F1F]">
                            ₱{Number(order.shipping_fee || 0).toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8175]">
                            Shipping Note
                          </p>
                          <p className="mt-1 text-sm text-[#1F1F1F]">
                            {order.shipping_note || "No note provided"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(order.order_items ?? []).map((item) => {
                          const book = getBook(item);

                          return (
                            <div
                              key={item.id}
                              className="rounded-xl border border-[#E5E0D8] bg-[#FFFDF9] p-3"
                            >
                              <div className="flex gap-3">
                                {book?.image_url ? (
                                  <img
                                    src={book.image_url}
                                    alt={book.title}
                                    className="h-16 w-12 rounded object-cover"
                                  />
                                ) : (
                                  <div className="h-16 w-12 rounded bg-gray-200" />
                                )}

                                <div className="flex-1">
                                  <p className="text-base font-semibold text-[#1F1F1F]">
                                    {book?.title || "Book"}
                                  </p>
                                  <p className="text-sm text-[#6B6B6B]">
                                    {book?.author || "Unknown Author"}
                                  </p>

                                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-[#6B6B6B]">
                                    <span>Qty: {item.quantity}</span>
                                    <span>₱{item.price}</span>
                                    <span className="font-semibold text-[#E67E22]">
                                      {formatStatus(item.item_status)}
                                    </span>
                                  </div>

                                  <div className="mt-2 grid gap-1 text-sm text-[#6B6B6B] sm:grid-cols-2">
                                    <p>
                                      Courier:{" "}
                                      <span className="font-medium text-[#1F1F1F]">
                                        {item.courier_name ||
                                          "Waiting for seller"}
                                      </span>
                                    </p>
                                    <p>
                                      Tracking:{" "}
                                      <span className="font-medium text-[#1F1F1F]">
                                        {item.tracking_number ||
                                          "Not assigned yet"}
                                      </span>
                                    </p>
                                    <p>
                                      ETA:{" "}
                                      <span className="font-medium text-[#1F1F1F]">
                                        {item.estimated_delivery_date ||
                                          "Not set yet"}
                                      </span>
                                    </p>
                                    <p>
                                      Received:{" "}
                                      <span className="font-medium text-[#1F1F1F]">
                                        {item.received_at
                                          ? new Date(
                                              item.received_at,
                                            ).toLocaleDateString()
                                          : "Not yet"}
                                      </span>
                                    </p>
                                  </div>

                                  {item.item_status === "delivered" &&
                                    !item.received_at && (
                                      <button
                                        onClick={() =>
                                          handleMarkReceived(item.id, order.id)
                                        }
                                        disabled={markingReceivedId === item.id}
                                        className="mt-3 rounded-full bg-[#E67E22] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-50"
                                      >
                                        {markingReceivedId === item.id
                                          ? "Updating..."
                                          : "Mark as Received"}
                                      </button>
                                    )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex justify-between border-t pt-3">
                        <span className="font-semibold text-[#1F1F1F]">
                          Total
                        </span>
                        <span className="text-lg font-bold text-[#E67E22]">
                          ₱{Number(order.total_amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
