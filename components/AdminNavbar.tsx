"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingBag,
  Tags,
  BarChart3,
  Shield,
  Settings,
  LogOut,
} from "lucide-react";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Books", href: "/admin/books", icon: BookOpen },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Admin Accounts", href: "/admin/admin-accounts", icon: Shield },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] border-r border-[#2A2622] bg-[#181614] p-4 text-[#F7F5F1]">
      {/* LOGO */}
      <div className="mb-8">
        <h1 className="text-lg font-bold">BookBazaar</h1>
        <p className="text-xs text-[#9A9187]">Admin Panel</p>
      </div>

      {/* NAV LINKS */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-[#E67E22]/20 text-[#E67E22]"
                  : "text-[#D6CEC4] hover:bg-[#211D1A]"
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT (BOTTOM) */}
      <div className="absolute bottom-6 left-4 right-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
