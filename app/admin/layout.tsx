"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase";

type AdminProfile = {
  id: string;
  role: string | null;
  is_admin: boolean | null;
  admin_status: string | null;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    let mounted = true;

    const checkAdminAccess = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("id, role, is_admin, admin_status")
          .eq("id", user.id)
          .single<AdminProfile>();

        if (error || !data) {
          router.replace("/");
          return;
        }

        const isMainAdmin = data.role === "admin";
        const isApprovedAdmin =
          data.is_admin === true && data.admin_status === "approved";

        if (!isMainAdmin && !isApprovedAdmin) {
          router.replace("/");
          return;
        }

        if (mounted) {
          setCheckingAccess(false);
        }
      } catch (error) {
        console.error("Admin access check failed:", error);
        router.replace("/");
      }
    };

    checkAdminAccess();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checkingAccess) {
    return (
      <main className="ml-[240px] min-h-screen bg-[#181614] p-6 text-[#F7F5F1]">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-[#FFFDF9]">
            Checking admin access...
          </h1>
          <p className="mt-2 text-sm text-[#9A9187]">
            Please wait while we verify your administrator permission.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
