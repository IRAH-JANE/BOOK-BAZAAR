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
  const [showAdminNavbar, setShowAdminNavbar] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    const checkNavbarAccess = async () => {
      try {
        const isAdminPage = pathname.startsWith("/admin");

        // Normal pages always use normal navbar
        if (!isAdminPage) {
          setShowAdminNavbar(false);
          setLoading(false);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        // On admin pages, never fall back to public navbar
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
        console.error("Navbar switcher admin check failed:", error);
        setShowAdminNavbar(false);
      } finally {
        setLoading(false);
      }
    };

    checkNavbarAccess();
  }, [pathname]);

  const isAdminPage = pathname.startsWith("/admin");

  // While checking admin navbar on admin pages, show nothing
  if (loading && isAdminPage) {
    return null;
  }

  // On admin pages:
  // - show AdminNavbar for valid admin accounts
  // - otherwise show nothing, never public Navbar
  if (isAdminPage) {
    return showAdminNavbar ? <AdminNavbar /> : null;
  }

  // Normal pages
  return <Navbar />;
}
