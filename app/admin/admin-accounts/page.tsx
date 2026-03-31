"use client";

import AdminDashboardSkeleton from "@/components/AdminDashboardSkeleton";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock3,
  Search,
  Plus,
  Mail,
  Crown,
} from "lucide-react";

type AdminProfile = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string | null;
  is_admin: boolean | null;
  admin_status: string | null;
  approved_by: string | null;
  approved_at: string | null;
  admin_requested_at: string | null;
};

function getDisplayName(profile: AdminProfile) {
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

function isMainAdmin(profile: AdminProfile) {
  return profile.role === "admin";
}

function isApprovedAdmin(profile: AdminProfile) {
  return (
    profile.role !== "admin" &&
    profile.is_admin === true &&
    profile.admin_status === "approved"
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

export default function AdminAccountsPage() {
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<
    "approve" | "reject" | "create" | null
  >(null);
  const [search, setSearch] = useState("");

  const [requestEmail, setRequestEmail] = useState("");
  const [requestingAdmin, setRequestingAdmin] = useState(false);

  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error" | "";
    text: string;
  }>({ type: "", text: "" });

  const [approvedPage, setApprovedPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  const rowsPerPage = 5;

  const supabase = createSupabaseBrowser();

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setCurrentAdminId(user.id);
      await reloadProfiles();
      setLoading(false);
    };

    loadPage();
  }, []);

  const reloadProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, first_name, last_name, email, role, created_at, is_admin, admin_status, approved_by, approved_at, admin_requested_at",
      )
      .or(
        "role.eq.admin,is_admin.eq.true,admin_status.eq.pending,admin_status.eq.rejected",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to reload admin accounts:", error);
      return;
    }

    setProfiles(data || []);
  };

  const handleApprove = async (profileId: string) => {
    if (!currentAdminId) return;

    const target = profiles.find((profile) => profile.id === profileId);
    if (!target || isMainAdmin(target)) return;

    setProcessingId(profileId);
    setProcessingAction("approve");
    setActionMessage({ type: "", text: "" });

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_admin: true,
          admin_status: "approved",
          approved_by: currentAdminId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", profileId);

      if (error) {
        console.error("Approve failed:", error);
        setActionMessage({
          type: "error",
          text: error.message || "Failed to approve admin.",
        });
        return;
      }

      await reloadProfiles();

      setActionMessage({
        type: "success",
        text: "Admin approved successfully.",
      });
    } catch (error) {
      console.error(error);
      setActionMessage({
        type: "error",
        text: "Unexpected error during approval.",
      });
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleReject = async (profileId: string) => {
    const target = profiles.find((profile) => profile.id === profileId);
    if (!target || isMainAdmin(target)) return;

    setProcessingId(profileId);
    setProcessingAction("reject");
    setActionMessage({ type: "", text: "" });

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_admin: false,
          admin_status: "rejected",
          approved_by: null,
          approved_at: null,
        })
        .eq("id", profileId);

      if (error) {
        console.error("Reject failed:", error);
        setActionMessage({
          type: "error",
          text: error.message || "Failed to reject admin request.",
        });
        return;
      }

      await reloadProfiles();

      setActionMessage({
        type: "success",
        text: "Admin request rejected successfully.",
      });
    } catch (error) {
      console.error(error);
      setActionMessage({
        type: "error",
        text: "Unexpected error during rejection.",
      });
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleCreateAdminRequest = async () => {
    const email = requestEmail.trim().toLowerCase();

    if (!email) {
      setActionMessage({
        type: "error",
        text: "Please enter the user's email address.",
      });
      return;
    }

    setRequestingAdmin(true);
    setProcessingAction("create");
    setActionMessage({ type: "", text: "" });

    try {
      const { data: targetUser, error: findError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, first_name, last_name, email, role, is_admin, admin_status",
        )
        .eq("email", email)
        .maybeSingle();

      if (findError) {
        console.error(findError);
        setActionMessage({
          type: "error",
          text: "Failed to search for that user.",
        });
        return;
      }

      if (!targetUser) {
        setActionMessage({
          type: "error",
          text: "No registered user found with that email.",
        });
        return;
      }

      if (targetUser.role === "admin") {
        setActionMessage({
          type: "error",
          text: "That account is already a main admin.",
        });
        return;
      }

      if (targetUser.is_admin && targetUser.admin_status === "approved") {
        setActionMessage({
          type: "error",
          text: "That user is already an approved admin.",
        });
        return;
      }

      if (targetUser.admin_status === "pending") {
        setActionMessage({
          type: "error",
          text: "That user already has a pending admin request.",
        });
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          is_admin: true,
          admin_status: "pending",
          admin_requested_at: new Date().toISOString(),
          approved_by: null,
          approved_at: null,
        })
        .eq("id", targetUser.id);

      if (updateError) {
        console.error(updateError);
        setActionMessage({
          type: "error",
          text: "Failed to create admin request.",
        });
        return;
      }

      setRequestEmail("");
      setActionMessage({
        type: "success",
        text: "Admin request created successfully.",
      });

      await reloadProfiles();
    } catch (error) {
      console.error(error);
      setActionMessage({
        type: "error",
        text: "Something went wrong while creating the request.",
      });
    } finally {
      setRequestingAdmin(false);
      setProcessingAction(null);
    }
  };

  const filteredProfiles = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return profiles;

    return profiles.filter((profile) => {
      const name = getDisplayName(profile).toLowerCase();
      const email = (profile.email || "").toLowerCase();
      const status = (profile.admin_status || "").toLowerCase();
      const role = (profile.role || "").toLowerCase();

      return (
        name.includes(keyword) ||
        email.includes(keyword) ||
        status.includes(keyword) ||
        role.includes(keyword)
      );
    });
  }, [profiles, search]);

  useEffect(() => {
    setApprovedPage(1);
    setRejectedPage(1);
  }, [search]);

  const mainAdmins = filteredProfiles.filter(isMainAdmin);

  const pendingAdmins = filteredProfiles.filter(
    (profile) => !isMainAdmin(profile) && profile.admin_status === "pending",
  );

  const approvedAdmins = filteredProfiles.filter(isApprovedAdmin);

  const rejectedAdmins = filteredProfiles.filter(
    (profile) => !isMainAdmin(profile) && profile.admin_status === "rejected",
  );

  const totalMainAdmins = profiles.filter(isMainAdmin).length;
  const totalApprovedAdmins = profiles.filter(isApprovedAdmin).length;

  const approvedTotalPages = Math.max(
    1,
    Math.ceil(approvedAdmins.length / rowsPerPage),
  );
  const rejectedTotalPages = Math.max(
    1,
    Math.ceil(rejectedAdmins.length / rowsPerPage),
  );

  const paginatedApprovedAdmins = approvedAdmins.slice(
    (approvedPage - 1) * rowsPerPage,
    approvedPage * rowsPerPage,
  );

  const paginatedRejectedAdmins = rejectedAdmins.slice(
    (rejectedPage - 1) * rowsPerPage,
    rejectedPage * rowsPerPage,
  );

  if (loading) {
    return <AdminDashboardSkeleton type="accounts" />;
  }

  return (
    <main className="ml-[240px] min-h-screen bg-[#181614] p-6 text-[#F7F5F1]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#FFFDF9]">
              Admin Accounts
            </h1>
            <p className="mt-2 text-sm text-[#9A9187]">
              Manage main admins, approved admins, and pending admin requests.
            </p>
          </div>

          <div className="flex w-full max-w-md items-center rounded-xl border border-[#312B26] bg-[#211D1A] px-4 py-3">
            <Search size={18} className="mr-2 text-[#8E857B]" />
            <input
              type="text"
              placeholder="Search admin accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-[#F7F5F1] placeholder:text-[#8E857B] focus:outline-none"
            />
          </div>
        </div>

        {actionMessage.text && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              actionMessage.type === "success"
                ? "border-green-500/20 bg-green-500/10 text-green-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {actionMessage.text}
          </div>
        )}

        {/* Summary cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
          <SummaryCard
            title="Pending Requests"
            value={pendingAdmins.length}
            icon={Clock3}
            tone="text-[#60A5FA] bg-[#3B82F6]/10"
          />
          <SummaryCard
            title="Rejected Requests"
            value={rejectedAdmins.length}
            icon={XCircle}
            tone="text-[#F87171] bg-[#EF4444]/10"
          />
        </section>

        {/* Create admin request */}
        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#FFFDF9]">
              Create Admin Request
            </h3>
            <p className="text-sm text-[#9A9187]">
              Promote an existing registered user into a pending admin request
              by email.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="flex items-center rounded-xl border border-[#2A2622] bg-[#181614] px-4 py-3">
              <Mail size={18} className="mr-2 text-[#8E857B]" />
              <input
                type="email"
                placeholder="Enter registered user's email"
                value={requestEmail}
                onChange={(e) => setRequestEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateAdminRequest();
                  }
                }}
                className="w-full bg-transparent text-sm text-[#F7F5F1] placeholder:text-[#8E857B] focus:outline-none"
              />
            </div>

            <button
              onClick={handleCreateAdminRequest}
              disabled={requestingAdmin}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E67E22] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-60"
            >
              <Plus size={16} />
              {processingAction === "create" ? "Creating..." : "Create Request"}
            </button>
          </div>
        </section>

        {/* Main Admins */}
        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#FFFDF9]">
              Main Admins
            </h3>
            <p className="text-sm text-[#9A9187]">
              Original system-level administrators
            </p>
          </div>

          {mainAdmins.length === 0 ? (
            <div className="rounded-2xl border border-[#2A2622] bg-[#181614] p-6 text-sm text-[#9A9187]">
              No main admins found.
            </div>
          ) : (
            <div className="grid gap-4">
              {mainAdmins.map((profile) => (
                <div
                  key={profile.id}
                  className="rounded-2xl border border-[#2A2622] bg-[#181614] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <HoverText
                          text={getDisplayName(profile)}
                          className="max-w-[320px] text-lg font-semibold text-[#FFFDF9]"
                        />
                        <span className="rounded-full bg-[#E67E22]/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#F5A65B]">
                          Main Admin
                        </span>
                      </div>

                      <div className="mt-2">
                        <HoverText
                          text={profile.email || "No email"}
                          className="max-w-[360px] text-sm text-[#D6CEC4]"
                        />
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-[#9A9187] sm:grid-cols-2">
                        <p>Role: {profile.role || "admin"}</p>
                        <p>Joined: {formatDate(profile.created_at)}</p>
                        <p className="min-w-0">
                          User ID:{" "}
                          <span className="inline-block max-w-[220px] align-middle">
                            <HoverText
                              text={profile.id}
                              className="text-[#9A9187]"
                            />
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#E67E22]/20 bg-[#E67E22]/10 px-4 py-3 text-sm font-medium text-[#F5A65B]">
                      Protected Account
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending requests */}
        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#FFFDF9]">
              Pending Admin Requests
            </h3>
            <p className="text-sm text-[#9A9187]">
              Accounts waiting for admin approval
            </p>
          </div>

          {pendingAdmins.length === 0 ? (
            <div className="rounded-2xl border border-[#2A2622] bg-[#181614] p-6 text-sm text-[#9A9187]">
              No pending admin requests right now.
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingAdmins.map((profile) => (
                <div
                  key={profile.id}
                  className="rounded-2xl border border-[#2A2622] bg-[#181614] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <HoverText
                          text={getDisplayName(profile)}
                          className="max-w-[320px] text-lg font-semibold text-[#FFFDF9]"
                        />
                        <span className="rounded-full bg-[#3B82F6]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#60A5FA]">
                          Pending
                        </span>
                      </div>

                      <div className="mt-2">
                        <HoverText
                          text={profile.email || "No email"}
                          className="max-w-[360px] text-sm text-[#D6CEC4]"
                        />
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-[#9A9187] sm:grid-cols-2">
                        <p>Role: {profile.role || "user"}</p>
                        <p>
                          Requested: {formatDate(profile.admin_requested_at)}
                        </p>
                        <p>Joined: {formatDate(profile.created_at)}</p>
                        <p className="min-w-0">
                          User ID:{" "}
                          <span className="inline-block max-w-[220px] align-middle">
                            <HoverText
                              text={profile.id}
                              className="text-[#9A9187]"
                            />
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleApprove(profile.id)}
                        disabled={processingId === profile.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#E67E22] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-60"
                      >
                        <CheckCircle2 size={16} />
                        {processingId === profile.id &&
                        processingAction === "approve"
                          ? "Approving..."
                          : "Approve"}
                      </button>

                      <button
                        onClick={() => handleReject(profile.id)}
                        disabled={processingId === profile.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                      >
                        <XCircle size={16} />
                        {processingId === profile.id &&
                        processingAction === "reject"
                          ? "Rejecting..."
                          : "Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Approved admins */}
        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#FFFDF9]">
                Approved Admins
              </h3>
              <p className="text-sm text-[#9A9187]">
                Approved administrators under the new admin system
              </p>
            </div>
            <p className="text-sm text-[#9A9187]">
              Showing{" "}
              {approvedAdmins.length === 0
                ? 0
                : (approvedPage - 1) * rowsPerPage + 1}
              -{Math.min(approvedPage * rowsPerPage, approvedAdmins.length)} of{" "}
              {approvedAdmins.length}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#2A2622]">
            <table className="w-full min-w-[920px] table-fixed text-left">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[22%]" />
                <col className="w-[10%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
              </colgroup>

              <thead className="bg-[#1C1917]">
                <tr className="border-b border-[#2A2622] text-sm text-[#9A9187]">
                  <th className="px-4 py-4 font-medium">Name</th>
                  <th className="px-4 py-4 font-medium">Email</th>
                  <th className="px-4 py-4 font-medium">Role</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">Requested</th>
                  <th className="px-4 py-4 font-medium">Approved At</th>
                </tr>
              </thead>

              <tbody>
                {paginatedApprovedAdmins.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-sm text-[#9A9187]"
                    >
                      No approved admin accounts found.
                    </td>
                  </tr>
                ) : (
                  paginatedApprovedAdmins.map((profile) => (
                    <tr
                      key={profile.id}
                      className="border-t border-[#2A2622] text-sm text-[#E6DFD5] transition hover:bg-[#1A1715]"
                    >
                      <td className="px-4 py-4">
                        <HoverText
                          text={getDisplayName(profile)}
                          className="max-w-[180px] font-medium text-[#FFFDF9]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <HoverText
                          text={profile.email || "No email"}
                          className="max-w-[220px]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <HoverText
                          text={profile.role || "user"}
                          className="max-w-[90px]"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                          Approved Admin
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <HoverText
                          text={formatDate(profile.admin_requested_at)}
                          className="max-w-[160px] text-[#D6CEC4]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <HoverText
                          text={formatDate(profile.approved_at)}
                          className="max-w-[160px] text-[#D6CEC4]"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {approvedAdmins.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#9A9187]">
                Page {approvedPage} of {approvedTotalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setApprovedPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={approvedPage === 1}
                  className="rounded-lg border border-[#312B26] bg-[#181614] px-4 py-2 text-sm text-[#F7F5F1] transition hover:bg-[#2A2622] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  onClick={() =>
                    setApprovedPage((prev) =>
                      Math.min(approvedTotalPages, prev + 1),
                    )
                  }
                  disabled={approvedPage === approvedTotalPages}
                  className="rounded-lg border border-[#312B26] bg-[#181614] px-4 py-2 text-sm text-[#F7F5F1] transition hover:bg-[#2A2622] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Rejected requests */}
        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#FFFDF9]">
                Rejected Admin Requests
              </h3>
              <p className="text-sm text-[#9A9187]">
                Previously rejected admin access requests
              </p>
            </div>
            <p className="text-sm text-[#9A9187]">
              Showing{" "}
              {rejectedAdmins.length === 0
                ? 0
                : (rejectedPage - 1) * rowsPerPage + 1}
              -{Math.min(rejectedPage * rowsPerPage, rejectedAdmins.length)} of{" "}
              {rejectedAdmins.length}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#2A2622]">
            <table className="w-full min-w-[760px] table-fixed text-left">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[26%]" />
                <col className="w-[12%]" />
                <col className="w-[16%]" />
                <col className="w-[24%]" />
              </colgroup>

              <thead className="bg-[#1C1917]">
                <tr className="border-b border-[#2A2622] text-sm text-[#9A9187]">
                  <th className="px-4 py-4 font-medium">Name</th>
                  <th className="px-4 py-4 font-medium">Email</th>
                  <th className="px-4 py-4 font-medium">Role</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">Requested</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRejectedAdmins.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-sm text-[#9A9187]"
                    >
                      No rejected requests found.
                    </td>
                  </tr>
                ) : (
                  paginatedRejectedAdmins.map((profile) => (
                    <tr
                      key={profile.id}
                      className="border-t border-[#2A2622] text-sm text-[#E6DFD5] transition hover:bg-[#1A1715]"
                    >
                      <td className="px-4 py-4">
                        <HoverText
                          text={getDisplayName(profile)}
                          className="max-w-[180px] font-medium text-[#FFFDF9]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <HoverText
                          text={profile.email || "No email"}
                          className="max-w-[220px]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <HoverText
                          text={profile.role || "user"}
                          className="max-w-[90px]"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                          Rejected
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <HoverText
                          text={formatDate(profile.admin_requested_at)}
                          className="max-w-[180px] text-[#D6CEC4]"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {rejectedAdmins.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#9A9187]">
                Page {rejectedPage} of {rejectedTotalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setRejectedPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={rejectedPage === 1}
                  className="rounded-lg border border-[#312B26] bg-[#181614] px-4 py-2 text-sm text-[#F7F5F1] transition hover:bg-[#2A2622] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  onClick={() =>
                    setRejectedPage((prev) =>
                      Math.min(rejectedTotalPages, prev + 1),
                    )
                  }
                  disabled={rejectedPage === rejectedTotalPages}
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
