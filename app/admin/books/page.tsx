"use client";

import AdminDashboardSkeleton from "@/components/AdminDashboardSkeleton";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { Search, BookOpen, Boxes, AlertTriangle, Tags } from "lucide-react";

type BookRow = {
  id: number;
  title: string | null;
  author: string | null;
  price: number | null;
  stock_quantity: number | null;
  status: string | null;
  category_id: number | null;
  seller_id: string | null;
  created_at: string | null;
};

type CategoryRow = {
  id: number;
  name: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
};

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString();
}

function formatCurrency(value: number | null) {
  return `₱${(value || 0).toFixed(2)}`;
}

function getSellerName(
  sellerId: string | null,
  profilesMap: Record<string, string>,
) {
  if (!sellerId) return "Unknown Seller";
  return profilesMap[sellerId] || "Unknown Seller";
}

function getCategoryName(
  categoryId: number | null,
  categoriesMap: Record<number, string>,
) {
  if (!categoryId) return "Uncategorized";
  return categoriesMap[categoryId] || "Unknown Category";
}

function getStockBadge(stock: number | null) {
  const qty = stock ?? 0;

  if (qty === 0) {
    return (
      <span className="inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
        Out of Stock
      </span>
    );
  }

  if (qty <= 2) {
    return (
      <span className="inline-flex rounded-full bg-[#E67E22]/10 px-3 py-1 text-xs font-medium text-[#F5A65B]">
        Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
      In Stock
    </span>
  );
}

function getStatusBadge(status: string | null) {
  const value = (status || "unknown").toLowerCase();

  if (value === "active") {
    return (
      <span className="inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
        Active
      </span>
    );
  }

  if (value === "reserved") {
    return (
      <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
        Reserved
      </span>
    );
  }

  if (value === "sold") {
    return (
      <span className="inline-flex rounded-full bg-[#E67E22]/10 px-3 py-1 text-xs font-medium text-[#F5A65B]">
        Sold
      </span>
    );
  }

  if (value === "hidden") {
    return (
      <span className="inline-flex rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
        Hidden
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

export default function AdminBooksPage() {
  const [books, setBooks] = useState<BookRow[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Record<number, string>>(
    {},
  );
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "low_stock" | "out_of_stock" | "uncategorized" | "active" | "sold"
  >("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const supabase = createSupabaseBrowser();

  useEffect(() => {
    const loadBooksPage = async () => {
      setLoading(true);

      try {
        const [booksRes, categoriesRes, profilesRes] = await Promise.all([
          supabase
            .from("books")
            .select(
              "id, title, author, price, stock_quantity, status, category_id, seller_id, created_at",
            )
            .order("created_at", { ascending: false }),

          supabase.from("categories").select("id, name"),

          supabase
            .from("profiles")
            .select("id, full_name, first_name, last_name"),
        ]);

        if (booksRes.error) {
          console.error("Failed to load books:", booksRes.error);
        } else {
          setBooks((booksRes.data as BookRow[]) || []);
        }

        if (categoriesRes.error) {
          console.error("Failed to load categories:", categoriesRes.error);
        } else {
          const mappedCategories = (
            (categoriesRes.data || []) as CategoryRow[]
          ).reduce<Record<number, string>>((acc, category) => {
            acc[category.id] = category.name;
            return acc;
          }, {});
          setCategoriesMap(mappedCategories);
        }

        if (profilesRes.error) {
          console.error("Failed to load profiles:", profilesRes.error);
        } else {
          const mappedProfiles = (
            (profilesRes.data || []) as ProfileRow[]
          ).reduce<Record<string, string>>((acc, profile) => {
            const displayName =
              profile.full_name ||
              `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
              "Unnamed User";

            acc[profile.id] = displayName;
            return acc;
          }, {});
          setProfilesMap(mappedProfiles);
        }
      } catch (error) {
        console.error("Failed to load books page:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBooksPage();
  }, []);

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (filter === "low_stock") {
      result = result.filter((book) => {
        const stock = book.stock_quantity ?? 0;
        return stock > 0 && stock <= 2;
      });
    }

    if (filter === "out_of_stock") {
      result = result.filter((book) => (book.stock_quantity ?? 0) === 0);
    }

    if (filter === "uncategorized") {
      result = result.filter((book) => !book.category_id);
    }

    if (filter === "active") {
      result = result.filter(
        (book) => (book.status || "").toLowerCase() === "active",
      );
    }

    if (filter === "sold") {
      result = result.filter(
        (book) => (book.status || "").toLowerCase() === "sold",
      );
    }

    const keyword = search.trim().toLowerCase();

    if (!keyword) return result;

    return result.filter((book) => {
      const title = (book.title || "").toLowerCase();
      const author = (book.author || "").toLowerCase();
      const seller = getSellerName(book.seller_id, profilesMap).toLowerCase();
      const category = getCategoryName(
        book.category_id,
        categoriesMap,
      ).toLowerCase();
      const status = (book.status || "").toLowerCase();

      return (
        title.includes(keyword) ||
        author.includes(keyword) ||
        seller.includes(keyword) ||
        category.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [books, search, filter, profilesMap, categoriesMap]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const totalBooks = books.length;
  const lowStockCount = books.filter((book) => {
    const stock = book.stock_quantity ?? 0;
    return stock > 0 && stock <= 2;
  }).length;
  const outOfStockCount = books.filter(
    (book) => (book.stock_quantity ?? 0) === 0,
  ).length;
  const uncategorizedCount = books.filter((book) => !book.category_id).length;
  const activeCount = books.filter(
    (book) => (book.status || "").toLowerCase() === "active",
  ).length;

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  const visibleStart = filteredBooks.length === 0 ? 0 : startIndex + 1;
  const visibleEnd = Math.min(endIndex, filteredBooks.length);

  if (loading) {
    return <AdminDashboardSkeleton type="books" />;
  }

  return (
    <main className="ml-[240px] min-h-screen bg-[#181614] p-6 text-[#F7F5F1]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#FFFDF9]">
              Books Management
            </h1>
            <p className="mt-2 text-sm text-[#9A9187]">
              Monitor listings, stock levels, seller ownership, and category
              health.
            </p>
          </div>

          <div className="flex w-full max-w-md items-center rounded-xl border border-[#312B26] bg-[#211D1A] px-4 py-3">
            <Search size={18} className="mr-2 text-[#8E857B]" />
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-[#F7F5F1] placeholder:text-[#8E857B] focus:outline-none"
            />
          </div>
        </div>

        {/* Summary cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            title="Total Books"
            value={totalBooks}
            icon={BookOpen}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
          <SummaryCard
            title="Active Listings"
            value={activeCount}
            icon={Boxes}
            tone="text-green-400 bg-green-500/10"
          />
          <SummaryCard
            title="Low Stock"
            value={lowStockCount}
            icon={AlertTriangle}
            tone="text-[#F5A65B] bg-[#E67E22]/10"
          />
          <SummaryCard
            title="Out of Stock"
            value={outOfStockCount}
            icon={AlertTriangle}
            tone="text-red-400 bg-red-500/10"
          />
          <SummaryCard
            title="Uncategorized"
            value={uncategorizedCount}
            icon={Tags}
            tone="text-blue-400 bg-blue-500/10"
          />
        </section>

        {/* Filters */}
        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-4">
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "low_stock", label: "Low Stock" },
              { key: "out_of_stock", label: "Out of Stock" },
              { key: "uncategorized", label: "Uncategorized" },
              { key: "sold", label: "Sold" },
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

        {/* Books table */}
        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#FFFDF9]">
                Books List
              </h3>
              <p className="text-sm text-[#9A9187]">
                All visible listings based on your selected filter
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[#9A9187]">
              <span>
                Showing {visibleStart}-{visibleEnd} of {filteredBooks.length}
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
            <table className="w-full min-w-[1320px] table-fixed text-left">
              <colgroup>
                <col className="w-[28%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
                <col className="w-[6%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[13%]" />
                <col className="w-[6%]" />
              </colgroup>

              <thead className="sticky top-0 z-10 bg-[#1C1917]">
                <tr className="border-b border-[#2A2622] text-sm text-[#9A9187]">
                  <th className="px-4 py-4 font-medium">Title</th>
                  <th className="px-4 py-4 font-medium">Author</th>
                  <th className="px-4 py-4 font-medium">Seller</th>
                  <th className="px-4 py-4 font-medium">Category</th>
                  <th className="px-4 py-4 text-right font-medium">Price</th>
                  <th className="px-4 py-4 text-center font-medium">Stock</th>
                  <th className="px-4 py-4 font-medium">Stock Status</th>
                  <th className="px-4 py-4 font-medium">Listing Status</th>
                  <th className="px-4 py-4 font-medium">Created</th>
                  <th className="px-4 py-4 text-center font-medium">ID</th>
                </tr>
              </thead>

              <tbody>
                {paginatedBooks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-10 text-center text-sm text-[#9A9187]"
                    >
                      No books found for this filter.
                    </td>
                  </tr>
                ) : (
                  paginatedBooks.map((book) => {
                    const title = book.title || "Untitled Book";
                    const author = book.author || "Unknown Author";
                    const seller = getSellerName(book.seller_id, profilesMap);
                    const category = getCategoryName(
                      book.category_id,
                      categoriesMap,
                    );
                    const created = formatDate(book.created_at);

                    return (
                      <tr
                        key={book.id}
                        className="border-b border-[#2A2622] text-sm text-[#E6DFD5] transition hover:bg-[#1A1715]"
                      >
                        <td className="px-4 py-4 align-middle">
                          <HoverText
                            text={title}
                            className="max-w-[360px] font-medium text-[#FFFDF9]"
                          />
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <HoverText text={author} className="max-w-[170px]" />
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <HoverText text={seller} className="max-w-[190px]" />
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <HoverText
                            text={category}
                            className="max-w-[150px]"
                          />
                        </td>

                        <td className="px-4 py-4 text-right align-middle font-medium whitespace-nowrap text-[#FFFDF9]">
                          {formatCurrency(book.price)}
                        </td>

                        <td className="px-4 py-4 text-center align-middle font-medium">
                          {book.stock_quantity ?? 0}
                        </td>

                        <td className="px-4 py-4 align-middle whitespace-nowrap">
                          {getStockBadge(book.stock_quantity)}
                        </td>

                        <td className="px-4 py-4 align-middle whitespace-nowrap">
                          {getStatusBadge(book.status)}
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <HoverText
                            text={created}
                            className="max-w-[180px] whitespace-nowrap text-[#D6CEC4]"
                          />
                        </td>

                        <td className="px-4 py-4 text-center align-middle text-xs whitespace-nowrap text-[#9A9187]">
                          #{book.id}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredBooks.length > 0 && (
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

        {/* Insights */}
        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
            <h3 className="text-lg font-semibold text-[#FFFDF9]">
              Stock Overview
            </h3>
            <div className="mt-4 space-y-3">
              <InsightRow
                icon={Boxes}
                label="Healthy Stock Listings"
                value={(
                  totalBooks -
                  lowStockCount -
                  outOfStockCount
                ).toString()}
              />
              <InsightRow
                icon={AlertTriangle}
                label="Low Stock Listings"
                value={lowStockCount.toString()}
              />
              <InsightRow
                icon={AlertTriangle}
                label="Out of Stock Listings"
                value={outOfStockCount.toString()}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
            <h3 className="text-lg font-semibold text-[#FFFDF9]">
              Listing Quality Overview
            </h3>
            <div className="mt-4 space-y-3">
              <InsightRow
                icon={BookOpen}
                label="Total Listings"
                value={totalBooks.toString()}
              />
              <InsightRow
                icon={Tags}
                label="Uncategorized Books"
                value={uncategorizedCount.toString()}
              />
              <InsightRow
                icon={Boxes}
                label="Active Listings"
                value={activeCount.toString()}
              />
            </div>
          </div>
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

function InsightRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#2A2622] bg-[#181614] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#E67E22]/10 p-2 text-[#E67E22]">
          <Icon size={16} />
        </div>
        <span className="text-sm text-[#E6DFD5]">{label}</span>
      </div>

      <span className="text-sm font-medium text-[#FFFDF9]">{value}</span>
    </div>
  );
}
