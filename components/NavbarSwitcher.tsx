"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import AdminNavbar from "@/components/AdminNavbar";

type Profile = {
  role: string | null;
  is_admin: boolean | null;
  admin_status: string | null;
};

export default function NavbarSwitcher() {
  const pathname = usePathname();
  const supabase = createSupabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [showAdminNavbar, setShowAdminNavbar] = useState(false);

  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    const checkNavbarAccess = async () => {
      try {
        // tanan non-admin pages kay normal navbar
        if (!isAdminPage) {
          setShowAdminNavbar(false);
          setLoading(false);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setShowAdminNavbar(false);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("role, is_admin, admin_status")
          .eq("id", user.id)
          .single<Profile>();

        if (error || !data) {
          setShowAdminNavbar(false);
          setLoading(false);
          return;
        }

        const isMainAdmin = data.role === "admin";
        const isApprovedAdmin =
          data.is_admin === true && data.admin_status === "approved";

        setShowAdminNavbar(isMainAdmin || isApprovedAdmin);
      } catch (error) {
        console.error("Navbar switcher access check failed:", error);
        setShowAdminNavbar(false);
      } finally {
        setLoading(false);
      }
    };

    checkNavbarAccess();
  }, [isAdminPage, supabase]);

  if (loading && isAdminPage) {
    return null;
  }

  if (isAdminPage) {
    return showAdminNavbar ? <AdminNavbar /> : null;
  }

  return <Navbar />;
}
