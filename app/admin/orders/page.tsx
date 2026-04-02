"use client";

import AdminDashboardSkeleton from "@/components/AdminDashboardSkeleton";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { Search, ShoppingBag, CircleDollarSign, Truck } from "lucide-react";

type Order = {
  id: number;
  buyer_id: string | null;
  total_amount: number | null;
  payment_status: string | null;
  order_status: string | null;
  delivery_method: string | null;
  created_at: string | null;
};

type Profile = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
};

function formatCurrency(value: number | null) {
  return `₱${(value || 0).toFixed(2)}`;
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString();
}

function getName(id: string | null, map: Record<string, string>) {
  if (!id) return "Unknown";
  return map[id] || "Unknown";
}

function getPaymentBadge(status: string | null) {
  const value = (status || "").toLowerCase();

  if (value === "paid") {
    return (
      <span className="inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
        Paid
      </span>
    );
  }

  if (value === "pending_verification") {
    return (
      <span className="inline-flex rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
      Unpaid
    </span>
  );
}

function getOrderBadge(status: string | null) {
  const value = (status || "").toLowerCase();

  if (value === "delivered") {
    return (
      <span className="inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
        Delivered
      </span>
    );
  }

  if (value === "shipped") {
    return (
      <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
        Shipped
      </span>
    );
  }

  if (value === "pending") {
    return (
      <span className="inline-flex rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
        Pending
      </span>
    );
  }

  if (value === "received") {
    return (
      <span className="inline-flex rounded-full bg-[#2A2622] px-3 py-1 text-xs font-medium text-[#F7F5F1]">
        Received
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-[#2A2622] px-3 py-1 text-xs font-medium text-[#D6CEC4]">
      {status || "Unknown"}
    </span>
  );
}

function HoverText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      title={text}
      className={`truncate transition-all duration-200 hover:text-[#FFFDF9] ${className}`}
    >
      {text}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "paid" | "delivered"
  >("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const supabase = createSupabaseBrowser();

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);

      const [ordersRes, profilesRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("id, full_name, first_name, last_name"),
      ]);

      if (!ordersRes.error) {
        setOrders(ordersRes.data || []);
      }

      if (!profilesRes.error) {
        const map = (profilesRes.data || []).reduce(
          (acc: Record<string, string>, p: Profile) => {
            acc[p.id] =
              p.full_name ||
              `${p.first_name || ""} ${p.last_name || ""}`.trim() ||
              "User";
            return acc;
          },
          {},
        );
        setProfilesMap(map);
      }

      setLoading(false);
    };

    loadOrders();
  }, []);

  const filtered = useMemo(() => {
    let result = [...orders];

    if (filter === "pending") {
      result = result.filter(
        (o) => (o.order_status || "").toLowerCase() === "pending",
      );
    }

    if (filter === "paid") {
      result = result.filter(
        (o) => (o.payment_status || "").toLowerCase() === "paid",
      );
    }

    if (filter === "delivered") {
      result = result.filter(
        (o) => (o.order_status || "").toLowerCase() === "delivered",
      );
    }

    const keyword = search.trim().toLowerCase();

    if (!keyword) return result;

    return result.filter((o) => {
      const buyer = getName(o.buyer_id, profilesMap).toLowerCase();
      const delivery = (o.delivery_method || "").toLowerCase();
      const payment = (o.payment_status || "").toLowerCase();
      const status = (o.order_status || "").toLowerCase();

      return (
        o.id.toString().includes(keyword) ||
        buyer.includes(keyword) ||
        delivery.includes(keyword) ||
        payment.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [orders, search, filter, profilesMap]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const total = orders.length;
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.total_amount || 0),
    0,
  );
  const deliveries = orders.filter(
    (o) => (o.delivery_method || "").trim() !== "",
  ).length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedOrders = filtered.slice(startIndex, endIndex);

  const visibleStart = filtered.length === 0 ? 0 : startIndex + 1;
  const visibleEnd = Math.min(endIndex, filtered.length);

  if (loading) {
    return <AdminDashboardSkeleton type="orders" />;
  }

  return (
    <main className="ml-[240px] min-h-screen bg-[#181614] p-6 text-[#F7F5F1]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#FFFDF9]">
              Orders Management
            </h1>
            <p className="mt-2 text-sm text-[#9A9187]">
              Monitor all transactions and delivery progress
            </p>
          </div>

          <div className="flex w-full max-w-md items-center rounded-xl border border-[#312B26] bg-[#211D1A] px-4 py-3">
            <Search size={18} className="mr-2 text-[#8E857B]" />
            <input
              type="text"
              placeholder="Search order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-[#F7F5F1] placeholder:text-[#8E857B] focus:outline-none"
            />
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total Orders"
            value={total}
            icon={ShoppingBag}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
          <SummaryCard
            title="Total Revenue"
            value={`₱${totalRevenue.toFixed(2)}`}
            icon={CircleDollarSign}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
          <SummaryCard
            title="Deliveries"
            value={deliveries}
            icon={Truck}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
        </section>

        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-4">
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "paid", label: "Paid" },
              { key: "delivered", label: "Delivered" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as typeof filter)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === item.key
                    ? "bg-[#E67E22] text-white"
                    : "bg-[#181614] text-[#D6CEC4] hover:bg-[#2A2622]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#FFFDF9]">
                Orders List
              </h3>
              <p className="text-sm text-[#9A9187]">
                All visible orders based on your selected filter
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[#9A9187]">
              <span>
                Showing {visibleStart}-{visibleEnd} of {filtered.length}
              </span>

              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-[#312B26] bg-[#181614] px-3 py-2 text-sm text-[#F7F5F1] outline-none"
              >
                <option value={5}>5 rows</option>
                <option value={8}>8 rows</option>
                <option value={10}>10 rows</option>
                <option value={15}>15 rows</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#2A2622]">
            <table className="w-full min-w-[980px] table-fixed text-left">
              <colgroup>
                <col className="w-[8%]" />
                <col className="w-[20%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
                <col className="w-[16%]" />
                <col className="w-[18%]" />
              </colgroup>

              <thead className="sticky top-0 z-10 bg-[#1C1917]">
                <tr className="border-b border-[#2A2622] text-sm text-[#9A9187]">
                  <th className="px-4 py-4 font-medium">ID</th>
                  <th className="px-4 py-4 font-medium">Buyer</th>
                  <th className="px-4 py-4 text-right font-medium">Total</th>
                  <th className="px-4 py-4 font-medium">Payment</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">Delivery</th>
                  <th className="px-4 py-4 font-medium">Date</th>
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-[#9A9187]"
                    >
                      No orders found for this filter.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((o) => {
                    const buyer = getName(o.buyer_id, profilesMap);
                    const delivery = o.delivery_method || "—";
                    const date = formatDate(o.created_at);

                    return (
                      <tr
                        key={o.id}
                        className="border-b border-[#2A2622] text-sm text-[#E6DFD5] transition hover:bg-[#1A1715]"
                      >
                        <td className="px-4 py-4 align-middle font-medium text-[#FFFDF9]">
                          #{o.id}
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <HoverText text={buyer} className="max-w-[220px]" />
                        </td>

                        <td className="px-4 py-4 text-right align-middle font-medium whitespace-nowrap text-[#FFFDF9]">
                          {formatCurrency(o.total_amount)}
                        </td>

                        <td className="px-4 py-4 align-middle whitespace-nowrap">
                          {getPaymentBadge(o.payment_status)}
                        </td>

                        <td className="px-4 py-4 align-middle whitespace-nowrap">
                          {getOrderBadge(o.order_status)}
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <HoverText
                            text={delivery}
                            className="max-w-[170px]"
                          />
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <HoverText
                            text={date}
                            className="max-w-[190px] whitespace-nowrap text-[#D6CEC4]"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#9A9187]">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border border-[#312B26] bg-[#181614] px-4 py-2 text-sm text-[#F7F5F1] transition hover:bg-[#2A2622] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-[#312B26] bg-[#181614] px-4 py-2 text-sm text-[#F7F5F1] transition hover:bg-[#2A2622] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number }>;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#9A9187]">{title}</p>
          <h2 className="mt-2 text-2xl font-bold text-[#FFFDF9]">{value}</h2>
        </div>

        <div className={`rounded-xl p-3 ${tone}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
