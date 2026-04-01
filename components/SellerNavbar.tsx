"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Store,
  LogOut,
  ExternalLink,
} from "lucide-react";

type SellerProfile = {
  shop_slug: string | null;
};

export default function SellerNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [shopSlug, setShopSlug] = useState<string | null>(null);

  useEffect(() => {
    const loadSellerProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setShopSlug(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("shop_slug")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Failed to load seller shop slug:", error);
        setShopSlug(null);
        return;
      }

      setShopSlug((data as SellerProfile | null)?.shop_slug || null);
    };

    loadSellerProfile();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { name: "Dashboard", href: "/seller-dashboard", icon: LayoutDashboard },
    { name: "My Listings", href: "/my-listings", icon: BookOpen },
    { name: "Seller Orders", href: "/seller-orders", icon: ShoppingBag },
    { name: "Store Profile", href: "/seller-profile", icon: Store },
  ];

  const isActive = (href: string) => pathname === href;

  const publicPageHref = shopSlug ? `/shop/${shopSlug}` : "/seller-profile";

  return (
    <aside
      className="
        hidden md:flex
        fixed left-0 top-[70px] z-30
        h-[calc(100vh-70px)] w-[240px]
        flex-col
        border-r border-[#E5E0D8]
        bg-[#FFFDF9]
        px-4 py-8
      "
    >
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              isActive(item.href)
                ? "bg-[#FFF3E7] font-semibold text-[#E67E22]"
                : "text-[#5F5A52] hover:bg-[#F7F4EE]"
            }`}
          >
            <item.icon size={18} />
            {item.name}
          </Link>
        ))}

        <Link
          href={publicPageHref}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#5F5A52] transition hover:bg-[#F7F4EE]"
        >
          <ExternalLink size={18} />
          Page
        </Link>
      </nav>
    </aside>
  );
}
