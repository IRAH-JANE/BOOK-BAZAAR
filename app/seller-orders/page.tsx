"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Package,
  Truck,
  CheckCircle2,
} from "lucide-react";

type SellerBook = {
  title: string;
  author: string;
  image_url: string | null;
};

type SellerOrderInfo = {
  id: number;
  created_at: string;
  payment_method: string | null;
  payment_status: string | null;
  delivery_method: string | null;
  shipping_address: string | null;
  shipping_note: string | null;
};

type SellerOrderItem = {
  id: number;
  quantity: number;
  price: number;
  item_status: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  estimated_delivery_date: string | null;
  books: SellerBook | SellerBook[] | null;
  orders: SellerOrderInfo | SellerOrderInfo[] | null;
};

type GroupedOrder = {
  order: SellerOrderInfo;
  items: SellerOrderItem[];
};

export default function SellerOrdersPage() {
  const router = useRouter();

  const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [openOrders, setOpenOrders] = useState<number[]>([]);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [courierInputs, setCourierInputs] = useState<Record<number, string>>({});
  const [trackingInputs, setTrackingInputs] = useState<Record<number, string>>(
    {},
  );
  const [etaInputs, setEtaInputs] = useState<Record<number, string>>({});

  const getBook = (item: SellerOrderItem): SellerBook | null => {
    if (!item.books) return null;
    return Array.isArray(item.books) ? (item.books[0] ?? null) : item.books;
  };

  const getOrder = (item: SellerOrderItem): SellerOrderInfo | null => {
    if (!item.orders) return null;
    return Array.isArray(item.orders) ? (item.orders[0] ?? null) : item.orders;
  };

  const formatStatus = (status: string | null) => {
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
        return "border-green-200 bg-green-50 text-green-700";
      case "received":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "cancelled":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  const fetchSellerOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
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
        books (
          title,
          author,
          image_url
        ),
        orders (
          id,
          created_at,
          payment_method,
          payment_status,
          delivery_method,
          shipping_address,
          shipping_note
        )
        `,
      )
      .eq("seller_id", user.id)
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const items = (data as unknown as SellerOrderItem[]) || [];
    const groupedMap = new Map<number, GroupedOrder>();

    items.forEach((item) => {
      const order = getOrder(item);
      if (!order) return;

      if (!groupedMap.has(order.id)) {
        groupedMap.set(order.id, {
          order,
          items: [],
        });
      }

      groupedMap.get(order.id)?.items.push(item);
    });

    const grouped = Array.from(groupedMap.values()).sort(
      (a, b) =>
        new Date(b.order.created_at).getTime() -
        new Date(a.order.created_at).getTime(),
    );

    setGroupedOrders(grouped);

    if (grouped.length > 0 && openOrders.length === 0) {
      setOpenOrders([grouped[0].order.id]);
    }

    const nextCourier: Record<number, string> = {};
    const nextTracking: Record<number, string> = {};
    const nextEta: Record<number, string> = {};

    items.forEach((item) => {
      nextCourier[item.id] = item.courier_name || "";
      nextTracking[item.id] = item.tracking_number || "";
      nextEta[item.id] = item.estimated_delivery_date || "";
    });

    setCourierInputs(nextCourier);
    setTrackingInputs(nextTracking);
    setEtaInputs(nextEta);

    setLoading(false);
  };

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  const toggleOrderOpen = (orderId: number) => {
    setOpenOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const syncParentOrderStatus = async (orderId: number) => {
    const { data: siblingItems, error: siblingError } = await supabase
      .from("order_items")
      .select("item_status")
      .eq("order_id", orderId);

    if (siblingError) {
      throw new Error(siblingError.message);
    }

    const statuses = (siblingItems || []).map((item) => item.item_status);

    let overallOrderStatus = "pending";

    if (statuses.every((s) => s === "delivered" || s === "received")) {
      overallOrderStatus = "delivered";
    } else if (statuses.some((s) => s === "out_for_delivery")) {
      overallOrderStatus = "out_for_delivery";
    } else if (statuses.some((s) => s === "shipped")) {
      overallOrderStatus = "shipped";
    } else if (statuses.some((s) => s === "packed")) {
      overallOrderStatus = "packed";
    } else if (statuses.some((s) => s === "confirmed")) {
      overallOrderStatus = "confirmed";
    } else if (statuses.every((s) => s === "cancelled")) {
      overallOrderStatus = "cancelled";
    }

    const { error: orderError } = await supabase
      .from("orders")
      .update({
        order_status: overallOrderStatus,
      })
      .eq("id", orderId);

    if (orderError) {
      throw new Error(orderError.message);
    }
  };

  const saveShippingInfo = async (itemId: number) => {
    setSavingId(itemId);

    const courier = courierInputs[itemId] || null;
    const tracking = trackingInputs[itemId] || null;
    const eta = etaInputs[itemId] || null;

    const { error } = await supabase
      .from("order_items")
      .update({
        courier_name: courier,
        tracking_number: tracking,
        estimated_delivery_date: eta,
      })
      .eq("id", itemId);

    setSavingId(itemId);

    if (error) {
      setSavingId(null);
      alert(error.message);
      return;
    }

    setSavingId(null);
    alert("Shipping info saved.");
    fetchSellerOrders();
  };

  const updateItemStatus = async (
    itemId: number,
    orderId: number,
    nextStatus:
      | "confirmed"
      | "packed"
      | "shipped"
      | "out_for_delivery"
      | "delivered"
      | "cancelled",
  ) => {
    setSavingId(itemId);

    const courier = courierInputs[itemId] || null;
    const tracking = trackingInputs[itemId] || null;

    if (
      ["shipped", "out_for_delivery", "delivered"].includes(nextStatus) &&
      (!courier || !tracking)
    ) {
      setSavingId(null);
      alert(
        "Please fill in and save courier and tracking number first before updating this status.",
      );
      return;
    }

    const { error: itemError } = await supabase
      .from("order_items")
      .update({
        item_status: nextStatus,
      })
      .eq("id", itemId);

    if (itemError) {
      setSavingId(null);
      alert(itemError.message);
      return;
    }

    try {
      await syncParentOrderStatus(orderId);
    } catch (error) {
      setSavingId(null);
      alert(error instanceof Error ? error.message : "Failed to sync order.");
      return;
    }

    setSavingId(null);
    fetchSellerOrders();
  };

  const filteredOrders = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return groupedOrders.filter((group) => {
      const orderMatches =
        String(group.order.id).includes(query) ||
        (group.order.shipping_address || "").toLowerCase().includes(query) ||
        (group.order.payment_method || "").toLowerCase().includes(query);

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
        group.items.some(
          (item) => (item.item_status || "pending") === statusFilter,
        );

      const searchMatches = !query || orderMatches || itemMatches;

      return searchMatches && statusMatches;
    });
  }, [groupedOrders, searchText, statusFilter]);

  const totalOrders = groupedOrders.length;
  const pendingOrders = groupedOrders.filter((group) =>
    group.items.some((item) => (item.item_status || "pending") === "pending"),
  ).length;
  const shippedOrders = groupedOrders.filter((group) =>
    group.items.some((item) =>
      ["shipped", "out_for_delivery"].includes(item.item_status || ""),
    ),
  ).length;
  const deliveredOrders = groupedOrders.filter((group) =>
    group.items.every((item) =>
      ["delivered", "received"].includes(item.item_status || ""),
    ),
  ).length;

  const actionButtonClass =
    "rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F5F1] px-6 py-8">
        Loading seller orders...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E67E22]">
            Seller Fulfillment
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1F1F1F]">
            Seller Orders
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Scan, filter, and update customer orders faster.
          </p>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Package className="text-[#E67E22]" size={16} />
              <span className="text-sm text-[#6B6B6B]">Total Orders</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Package className="text-[#E67E22]" size={16} />
              <span className="text-sm text-[#6B6B6B]">Pending</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
              {pendingOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Truck className="text-[#E67E22]" size={16} />
              <span className="text-sm text-[#6B6B6B]">In Transit</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
              {shippedOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-[#E67E22]" size={16} />
              <span className="text-sm text-[#6B6B6B]">Delivered</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[#1F1F1F]">
              {deliveredOrders}
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_200px]">
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
                className="w-full rounded-xl border border-[#DED8CF] bg-white py-2.5 pl-10 pr-4 text-sm text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-[#DED8CF] bg-white px-3 py-2.5 text-sm text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm text-[#6B6B6B]">
            No matching seller orders found.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((group) => {
              const isOpen = openOrders.includes(group.order.id);
              const firstItem = group.items[0];
              const firstBook = firstItem ? getBook(firstItem) : null;

              return (
                <div
                  key={group.order.id}
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
                        <div className="flex h-14 w-11 items-center justify-center rounded-lg bg-[#F1ECE4] text-[10px] text-[#8A8175]">
                          No Image
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="text-xl font-semibold text-[#1F1F1F]">
                          Order #{group.order.id}
                        </h2>
                        <p className="text-sm text-[#6B6B6B]">
                          {new Date(group.order.created_at).toLocaleDateString()}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-[#6B6B6B]">
                          <span>{group.items.length} item(s)</span>
                          <span>•</span>
                          <span>{group.order.payment_method || "N/A"}</span>
                          <span>•</span>
                          <span>{group.order.delivery_method || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#E5E0D8] bg-[#FFFDF9] px-3 py-1 text-sm font-medium text-[#1F1F1F]">
                        Payment: {group.order.payment_status || "N/A"}
                      </span>

                      <button
                        onClick={() => toggleOrderOpen(group.order.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#D9D1C6] bg-white px-3 py-1.5 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
                      >
                        {isOpen ? "Hide" : "View"}
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4 border-t border-[#EEE6DB] pt-4">
                      <div className="mb-4 rounded-xl bg-[#FFFDF9] p-3 ring-1 ring-[#EDE7DE]">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8175]">
                          Buyer Shipping Address
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#1F1F1F]">
                          {group.order.shipping_address || "No shipping address"}
                        </p>

                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#8A8175]">
                          Shipping Note
                        </p>
                        <p className="mt-1 text-sm text-[#1F1F1F]">
                          {group.order.shipping_note || "No shipping note"}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {group.items.map((item) => {
                          const book = getBook(item);
                          const currentStatus = item.item_status || "pending";

                          return (
                            <div
                              key={item.id}
                              className="rounded-xl border border-[#E5E0D8] bg-[#FFFDF9] p-3"
                            >
                              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                  {book?.image_url ? (
                                    <img
                                      src={book.image_url}
                                      alt={book.title}
                                      className="h-14 w-12 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-14 w-12 items-center justify-center rounded-lg bg-[#F1ECE4] text-[10px] text-[#8A8175]">
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

                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                                    currentStatus,
                                  )}`}
                                >
                                  {formatStatus(currentStatus)}
                                </span>
                              </div>

                              <div className="grid gap-3 md:grid-cols-3">
                                <input
                                  value={courierInputs[item.id] || ""}
                                  onChange={(e) =>
                                    setCourierInputs((prev) => ({
                                      ...prev,
                                      [item.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Courier"
                                  className="w-full rounded-xl border border-[#DED8CF] bg-white px-3 py-2.5 text-sm text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]"
                                />

                                <input
                                  value={trackingInputs[item.id] || ""}
                                  onChange={(e) =>
                                    setTrackingInputs((prev) => ({
                                      ...prev,
                                      [item.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Tracking Number"
                                  className="w-full rounded-xl border border-[#DED8CF] bg-white px-3 py-2.5 text-sm text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]"
                                />

                                <input
                                  type="date"
                                  value={etaInputs[item.id] || ""}
                                  onChange={(e) =>
                                    setEtaInputs((prev) => ({
                                      ...prev,
                                      [item.id]: e.target.value,
                                    }))
                                  }
                                  className="w-full rounded-xl border border-[#DED8CF] bg-white px-3 py-2.5 text-sm text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]"
                                />
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => saveShippingInfo(item.id)}
                                  disabled={savingId === item.id}
                                  className="rounded-full border border-[#E67E22] bg-white px-3 py-1.5 text-xs font-semibold text-[#E67E22] transition hover:bg-[#FFF7EF] disabled:opacity-50"
                                >
                                  Save Shipping
                                </button>

                                <button
                                  onClick={() =>
                                    updateItemStatus(
                                      item.id,
                                      group.order.id,
                                      "confirmed",
                                    )
                                  }
                                  disabled={
                                    savingId === item.id ||
                                    !["pending"].includes(currentStatus)
                                  }
                                  className={`${actionButtonClass} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
                                >
                                  Confirm
                                </button>

                                <button
                                  onClick={() =>
                                    updateItemStatus(
                                      item.id,
                                      group.order.id,
                                      "packed",
                                    )
                                  }
                                  disabled={
                                    savingId === item.id ||
                                    !["confirmed"].includes(currentStatus)
                                  }
                                  className={`${actionButtonClass} border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100`}
                                >
                                  Packed
                                </button>

                                <button
                                  onClick={() =>
                                    updateItemStatus(
                                      item.id,
                                      group.order.id,
                                      "shipped",
                                    )
                                  }
                                  disabled={
                                    savingId === item.id ||
                                    !["packed"].includes(currentStatus)
                                  }
                                  className={`${actionButtonClass} border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100`}
                                >
                                  Shipped
                                </button>

                                <button
                                  onClick={() =>
                                    updateItemStatus(
                                      item.id,
                                      group.order.id,
                                      "out_for_delivery",
                                    )
                                  }
                                  disabled={
                                    savingId === item.id ||
                                    !["shipped"].includes(currentStatus)
                                  }
                                  className={`${actionButtonClass} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`}
                                >
                                  Out for Delivery
                                </button>

                                <button
                                  onClick={() =>
                                    updateItemStatus(
                                      item.id,
                                      group.order.id,
                                      "delivered",
                                    )
                                  }
                                  disabled={
                                    savingId === item.id ||
                                    !["out_for_delivery"].includes(currentStatus)
                                  }
                                  className={`${actionButtonClass} border-green-200 bg-green-50 text-green-700 hover:bg-green-100`}
                                >
                                  Delivered
                                </button>

                                <button
                                  onClick={() =>
                                    updateItemStatus(
                                      item.id,
                                      group.order.id,
                                      "cancelled",
                                    )
                                  }
                                  disabled={
                                    savingId === item.id ||
                                    ["delivered", "received", "cancelled"].includes(
                                      currentStatus,
                                    )
                                  }
                                  className={`${actionButtonClass} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
                                >
                                  Cancel
                                </button>
                              </div>

                              {savingId === item.id && (
                                <p className="mt-2 text-xs text-[#6B6B6B]">
                                  Saving update...
                                </p>
                              )}
                            </div>
                          );
                        })}
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