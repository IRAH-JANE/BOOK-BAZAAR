"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Heart,
  House,
  Library,
  LogOut,
  Search,
  ShoppingBag,
  User,
  Shield,
  BookOpen,
  ChevronDown,
  ShoppingCart,
  Package,
  Store,
} from "lucide-react";

type Profile = {
  full_name: string | null;
  email: string | null;
  role: string | null;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [searchText, setSearchText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserEmail(null);
        setProfile(null);
        return;
      }

      setUserEmail(user.email ?? null);

      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, role")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchText.trim();

    if (!query) {
      router.push("/marketplace");
      return;
    }

    router.push(`/marketplace?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/login");
    router.refresh();
  };

  const navLinkClass = (path: string) =>
    pathname === path
      ? "font-semibold text-[#E67E22]"
      : "text-[#5F5A52] hover:text-[#1F1F1F]";

  return (
    <header className="border-b border-[#E5E0D8] bg-[#FFFDF9]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-[#1F1F1F]"
        >
          BookBazaar
        </Link>

        <form
          onSubmit={handleSearch}
          className="flex w-full max-w-xl items-center overflow-hidden rounded-full border border-[#DDD6CC] bg-white"
        >
          <input
            type="text"
            placeholder="Search books, authors..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-transparent px-5 py-3 text-sm text-[#1F1F1F] outline-none placeholder:text-[#9C9489]"
          />
          <button
            type="submit"
            className="flex items-center gap-2 border-l border-[#E5E0D8] px-5 py-3 text-sm font-semibold text-[#E67E22] hover:bg-[#F7F4EE]"
          >
            <Search size={16} />
            Search
          </button>
        </form>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-5 text-sm md:flex">
            <Link href="/" className={navLinkClass("/")}>
              <span className="inline-flex items-center gap-2">
                <House size={16} />
                Home
              </span>
            </Link>

            <Link href="/marketplace" className={navLinkClass("/marketplace")}>
              <span className="inline-flex items-center gap-2">
                <Library size={16} />
                Marketplace
              </span>
            </Link>

            <Link href="/wishlist" className={navLinkClass("/wishlist")}>
              <span className="inline-flex items-center gap-2">
                <Heart size={16} />
                Wishlist
              </span>
            </Link>

            <Link href="/cart" className={navLinkClass("/cart")}>
              <span className="inline-flex items-center gap-2">
                <ShoppingCart size={16} />
                Cart
              </span>
            </Link>

            <Link
              href="/seller-orders"
              className={navLinkClass("/seller-orders")}
            >
              <span className="inline-flex items-center gap-2">
                <Store size={16} />
                Seller Orders
              </span>
            </Link>

            <Link
              href="/sell"
              className="rounded-full bg-[#E67E22] px-4 py-2 font-semibold text-white hover:bg-[#cf6f1c]"
            >
              <span className="inline-flex items-center gap-2">
                <ShoppingBag size={16} />
                Sell
              </span>
            </Link>
          </nav>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-[#DDD6CC] bg-white px-3 py-2 text-[#1F1F1F] hover:bg-[#F7F4EE]"
            >
              <User size={18} />
              <ChevronDown size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-14 z-50 w-72 rounded-2xl border border-[#E5E0D8] bg-white p-3 shadow-lg">
                {userEmail ? (
                  <>
                    <div className="mb-3 rounded-xl bg-[#F7F4EE] p-4">
                      <p className="text-sm font-semibold text-[#1F1F1F]">
                        {profile?.full_name || "BookBazaar User"}
                      </p>
                      <p className="mt-1 text-xs text-[#6B6B6B]">
                        {profile?.email || userEmail}
                      </p>
                      <p className="mt-2 inline-block rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#E67E22]">
                        {profile?.role || "user"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#1F1F1F] hover:bg-[#F7F4EE]"
                      >
                        <User size={16} />
                        Profile
                      </Link>

                      <Link
                        href="/wishlist"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#1F1F1F] hover:bg-[#F7F4EE]"
                      >
                        <Heart size={16} />
                        Wishlist
                      </Link>

                      <Link
                        href="/cart"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#1F1F1F] hover:bg-[#F7F4EE]"
                      >
                        <ShoppingCart size={16} />
                        Cart
                      </Link>

                      <Link
                        href="/orders"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#1F1F1F] hover:bg-[#F7F4EE]"
                      >
                        <Package size={16} />
                        My Orders
                      </Link>

                      <Link
                        href="/seller-orders"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#1F1F1F] hover:bg-[#F7F4EE]"
                      >
                        <Store size={16} />
                        Seller Orders
                      </Link>

                      <Link
                        href="/my-listings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#1F1F1F] hover:bg-[#F7F4EE]"
                      >
                        <BookOpen size={16} />
                        My Listings
                      </Link>

                      {profile?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#1F1F1F] hover:bg-[#F7F4EE]"
                        >
                          <Shield size={16} />
                          Admin Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-[#B94A48] hover:bg-[#FFF1F0]"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="px-2 py-1 text-sm text-[#6B6B6B]">
                      Welcome to BookBazaar
                    </p>

                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm text-[#1F1F1F] hover:bg-[#F7F4EE]"
                    >
                      Login
                    </Link>

                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm text-[#1F1F1F] hover:bg-[#F7F4EE]"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}