"use client";

import AdminDashboardSkeleton from "@/components/AdminDashboardSkeleton";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Clock3,
} from "lucide-react";

type UserProfile = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string | null;
  is_admin: boolean | null;
  admin_status: string | null;
  created_at: string | null;
};

function getDisplayName(profile: UserProfile) {
  return (
    profile.full_name ||
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
    "Unnamed User"
  );
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString();
}

function getAccountType(profile: UserProfile) {
  if (profile.role === "admin") return "Main Admin";
  if (profile.is_admin && profile.admin_status === "approved") {
    return "Approved Admin";
  }
  if (profile.admin_status === "pending") return "Pending Admin Request";
  if (profile.admin_status === "rejected") return "Rejected Admin Request";
  return "User";
}

function getStatusBadge(profile: UserProfile) {
  if (profile.role === "admin") {
    return (
      <span className="rounded-full bg-[#E67E22]/15 px-3 py-1 text-xs font-medium text-[#F5A65B]">
        Main Admin
      </span>
    );
  }

  if (profile.is_admin && profile.admin_status === "approved") {
    return (
      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
        Approved Admin
      </span>
    );
  }

  if (profile.admin_status === "pending") {
    return (
      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
        Pending
      </span>
    );
  }

  if (profile.admin_status === "rejected") {
    return (
      <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
        Rejected
      </span>
    );
  }

  return (
    <span className="rounded-full bg-[#2A2622] px-3 py-1 text-xs font-medium text-[#D6CEC4]">
      User
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "users" | "main_admins" | "approved_admins" | "pending" | "rejected"
  >("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const supabase = createSupabaseBrowser();

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, first_name, last_name, email, role, is_admin, admin_status, created_at",
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load users:", error);
      } else {
        setUsers(data || []);
      }

      setLoading(false);
    };

    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (filter === "users") {
      result = result.filter(
        (user) =>
          user.role !== "admin" &&
          !(user.is_admin && user.admin_status === "approved") &&
          user.admin_status !== "pending" &&
          user.admin_status !== "rejected",
      );
    }

    if (filter === "main_admins") {
      result = result.filter((user) => user.role === "admin");
    }

    if (filter === "approved_admins") {
      result = result.filter(
        (user) =>
          user.role !== "admin" &&
          user.is_admin &&
          user.admin_status === "approved",
      );
    }

    if (filter === "pending") {
      result = result.filter((user) => user.admin_status === "pending");
    }

    if (filter === "rejected") {
      result = result.filter((user) => user.admin_status === "rejected");
    }

    const keyword = search.trim().toLowerCase();

    if (!keyword) return result;

    return result.filter((user) => {
      const name = getDisplayName(user).toLowerCase();
      const email = (user.email || "").toLowerCase();
      const role = (user.role || "").toLowerCase();
      const accountType = getAccountType(user).toLowerCase();

      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        role.includes(keyword) ||
        accountType.includes(keyword)
      );
    });
  }, [users, search, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const totalUsers = users.length;
  const totalMainAdmins = users.filter((user) => user.role === "admin").length;
  const totalApprovedAdmins = users.filter(
    (user) =>
      user.role !== "admin" &&
      user.is_admin &&
      user.admin_status === "approved",
  ).length;
  const totalPending = users.filter(
    (user) => user.admin_status === "pending",
  ).length;
  const totalRejected = users.filter(
    (user) => user.admin_status === "rejected",
  ).length;

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const visibleStart = filteredUsers.length === 0 ? 0 : startIndex + 1;
  const visibleEnd = Math.min(endIndex, filteredUsers.length);

  if (loading) {
    return <AdminDashboardSkeleton type="users" />;
  }

  return (
    <main className="ml-[240px] min-h-screen bg-[#181614] p-6 text-[#F7F5F1]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#FFFDF9]">
              Users Management
            </h1>
            <p className="mt-2 text-sm text-[#9A9187]">
              View and monitor all registered users and admin-related accounts.
            </p>
          </div>

          <div className="flex w-full max-w-md items-center rounded-xl border border-[#312B26] bg-[#211D1A] px-4 py-3">
            <Search size={18} className="mr-2 text-[#8E857B]" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-[#F7F5F1] placeholder:text-[#8E857B] focus:outline-none"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
          <SummaryCard
            title="Main Admins"
            value={totalMainAdmins}
            icon={Crown}
            tone="text-[#F5A65B] bg-[#E67E22]/10"
          />
          <SummaryCard
            title="Approved Admins"
            value={totalApprovedAdmins}
            icon={Shield}
            tone="text-green-400 bg-green-500/10"
          />
          <SummaryCard
            title="Pending Requests"
            value={totalPending}
            icon={Clock3}
            tone="text-blue-400 bg-blue-500/10"
          />
          <SummaryCard
            title="Rejected Requests"
            value={totalRejected}
            icon={UserX}
            tone="text-red-400 bg-red-500/10"
          />
        </section>

        {/* Filters */}
        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-4">
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "All" },
              { key: "users", label: "Users" },
              { key: "main_admins", label: "Main Admins" },
              { key: "approved_admins", label: "Approved Admins" },
              { key: "pending", label: "Pending" },
              { key: "rejected", label: "Rejected" },
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

        {/* Users Table */}
        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#FFFDF9]">
                User List
              </h3>
              <p className="text-sm text-[#9A9187]">
                All visible accounts based on your selected filter
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[#9A9187]">
              <span>
                Showing {visibleStart}-{visibleEnd} of {filteredUsers.length}
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
            <table className="w-full min-w-[1100px] table-fixed text-left">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[21%]" />
                <col className="w-[8%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
              </colgroup>

              <thead className="sticky top-0 z-10 bg-[#1C1917]">
                <tr className="border-b border-[#2A2622] text-sm text-[#9A9187]">
                  <th className="px-4 py-4 font-medium">Name</th>
                  <th className="px-4 py-4 font-medium">Email</th>
                  <th className="px-4 py-4 font-medium">Role</th>
                  <th className="px-4 py-4 font-medium">Account Type</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">Created</th>
                  <th className="px-4 py-4 font-medium">User ID</th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-[#9A9187]"
                    >
                      No users found for this filter.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const name = getDisplayName(user);
                    const email = user.email || "No email";
                    const role = user.role || "user";
                    const accountType = getAccountType(user);
                    const created = formatDate(user.created_at);

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-[#2A2622] text-sm text-[#E6DFD5] transition hover:bg-[#1A1715]"
                      >
                        <td className="px-4 py-4 align-middle">
                          <HoverText
                            text={name}
                            className="max-w-[220px] font-medium text-[#FFFDF9]"
                          />
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <HoverText text={email} className="max-w-[260px]" />
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <HoverText
                            text={role}
                            className="max-w-[90px] capitalize"
                          />
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <HoverText
                            text={accountType}
                            className="max-w-[160px]"
                          />
                        </td>

                        <td className="px-4 py-4 align-middle whitespace-nowrap">
                          {getStatusBadge(user)}
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <HoverText
                            text={created}
                            className="max-w-[180px] whitespace-nowrap text-[#D6CEC4]"
                          />
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <HoverText
                            text={user.id}
                            className="max-w-[140px] text-xs text-[#9A9187]"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredUsers.length > 0 && (
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

        {/* Bottom insight panels */}
        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
            <h3 className="text-lg font-semibold text-[#FFFDF9]">
              Users Overview
            </h3>
            <div className="mt-4 space-y-3">
              <InsightRow
                icon={Users}
                label="Regular Users"
                value={users
                  .filter(
                    (user) =>
                      user.role !== "admin" &&
                      !(user.is_admin && user.admin_status === "approved") &&
                      user.admin_status !== "pending" &&
                      user.admin_status !== "rejected",
                  )
                  .length.toString()}
              />
              <InsightRow
                icon={Crown}
                label="Main Admins"
                value={totalMainAdmins.toString()}
              />
              <InsightRow
                icon={UserCheck}
                label="Approved Admins"
                value={totalApprovedAdmins.toString()}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
            <h3 className="text-lg font-semibold text-[#FFFDF9]">
              Admin Request Overview
            </h3>
            <div className="mt-4 space-y-3">
              <InsightRow
                icon={Clock3}
                label="Pending Requests"
                value={totalPending.toString()}
              />
              <InsightRow
                icon={UserX}
                label="Rejected Requests"
                value={totalRejected.toString()}
              />
              <InsightRow
                icon={Shield}
                label="Total Admin-Related Accounts"
                value={(
                  totalMainAdmins +
                  totalApprovedAdmins +
                  totalPending +
                  totalRejected
                ).toString()}
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
