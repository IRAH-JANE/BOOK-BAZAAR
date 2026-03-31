"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
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
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";

type Profile = {
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_admin: boolean | null;
  admin_status: string | null;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [searchText, setSearchText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const isAdminRoute = pathname.startsWith("/admin");
  const isApprovedAdmin =
    profile?.is_admin === true && profile?.admin_status === "approved";
  const useAdminNavbar = isAdminRoute && isApprovedAdmin;

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

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, role, is_admin, admin_status")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Failed to load navbar profile:", error);
        setProfile(null);
        return;
      }

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

  useEffect(() => {
    setMobileMenuOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchText.trim();

    if (!query) {
      router.push("/marketplace");
      return;
    }

    router.push(`/marketplace?search=${encodeURIComponent(query)}`);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/login");
    router.refresh();
  };

  const navLinkClass = (path: string) =>
    pathname === path
      ? "font-semibold text-[#E67E22]"
      : "text-[#5F5A52] hover:text-[#1F1F1F]";

  const mobileNavLinkClass = (path: string) =>
    pathname === path
      ? "flex items-center gap-3 rounded-xl bg-[#FFF4E8] px-4 py-3 text-sm font-semibold text-[#E67E22]"
      : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#1F1F1F] hover:bg-[#F7F4EE]";

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E0D8] bg-[#FFFDF9]">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={useAdminNavbar ? "/admin" : "/"}
            className="shrink-0 text-xl font-bold tracking-tight text-[#1F1F1F] sm:text-2xl"
          >
            BookBazaar
          </Link>

          {!useAdminNavbar && (
            <form
              onSubmit={handleSearch}
              className="hidden w-full max-w-xl items-center overflow-hidden rounded-full border border-[#DDD6CC] bg-white md:flex"
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
          )}

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-5 text-sm md:flex">
              {useAdminNavbar ? (
                <Link href="/admin" className={navLinkClass("/admin")}>
                  <span className="inline-flex items-center gap-2">
                    <LayoutDashboard size={16} />
                    Dashboard
                  </span>
                </Link>
              ) : (
                <>
                  <Link href="/" className={navLinkClass("/")}>
                    <span className="inline-flex items-center gap-2">
                      <House size={16} />
                      Home
                    </span>
                  </Link>

                  <Link
                    href="/marketplace"
                    className={navLinkClass("/marketplace")}
                  >
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
                    href="/sell"
                    className="rounded-full bg-[#E67E22] px-4 py-2 font-semibold text-white hover:bg-[#cf6f1c]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <ShoppingBag size={16} />
                      Sell
                    </span>
                  </Link>
                </>
              )}
            </nav>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="hidden items-center gap-2 rounded-full border border-[#DDD6CC] bg-white px-3 py-2 text-[#1F1F1F] hover:bg-[#F7F4EE] md:flex"
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

                        <div className="mt-2 flex flex-wrap gap-2">
                          <p className="inline-block rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#E67E22]">
                            {isApprovedAdmin
                              ? "approved admin"
                              : profile?.role || "user"}
                          </p>

                          {isApprovedAdmin && (
                            <p className="inline-block rounded-full bg-[#1F1F1F] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                              Approved Admin
                            </p>
                          )}
                        </div>
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

                        {!useAdminNavbar && (
                          <>
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
                          </>
                        )}

                        <Link
                          href="/orders"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#1F1F1F] hover:bg-[#F7F4EE]"
                        >
                          <Package size={16} />
                          My Orders
                        </Link>

                        {!useAdminNavbar && (
                          <>
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
                          </>
                        )}

                        {isApprovedAdmin && (
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

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-xl border border-[#DDD6CC] bg-white p-2 text-[#1F1F1F] hover:bg-[#F7F4EE] md:hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {!useAdminNavbar && (
          <form
            onSubmit={handleSearch}
            className="mt-3 flex items-center overflow-hidden rounded-full border border-[#DDD6CC] bg-white md:hidden"
          >
            <input
              type="text"
              placeholder="Search books, authors..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-transparent px-4 py-3 text-sm text-[#1F1F1F] outline-none placeholder:text-[#9C9489]"
            />
            <button
              type="submit"
              className="flex items-center gap-2 border-l border-[#E5E0D8] px-4 py-3 text-sm font-semibold text-[#E67E22] hover:bg-[#F7F4EE]"
            >
              <Search size={16} />
            </button>
          </form>
        )}

        {mobileMenuOpen && (
          <div className="mt-3 rounded-2xl border border-[#E5E0D8] bg-white p-3 shadow-sm md:hidden">
            <div className="space-y-1">
              {useAdminNavbar ? (
                <Link href="/admin" className={mobileNavLinkClass("/admin")}>
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/" className={mobileNavLinkClass("/")}>
                    <House size={18} />
                    Home
                  </Link>

                  <Link
                    href="/marketplace"
                    className={mobileNavLinkClass("/marketplace")}
                  >
                    <Library size={18} />
                    Marketplace
                  </Link>

                  <Link
                    href="/wishlist"
                    className={mobileNavLinkClass("/wishlist")}
                  >
                    <Heart size={18} />
                    Wishlist
                  </Link>

                  <Link href="/cart" className={mobileNavLinkClass("/cart")}>
                    <ShoppingCart size={18} />
                    Cart
                  </Link>

                  <Link href="/sell" className={mobileNavLinkClass("/sell")}>
                    <ShoppingBag size={18} />
                    Sell
                  </Link>
                </>
              )}

              {userEmail ? (
                <>
                  <div className="my-2 border-t border-[#EEE6DB]" />

                  <div className="rounded-xl bg-[#F7F4EE] p-3">
                    <p className="text-sm font-semibold text-[#1F1F1F]">
                      {profile?.full_name || "BookBazaar User"}
                    </p>
                    <p className="mt-1 text-xs text-[#6B6B6B]">
                      {profile?.email || userEmail}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <p className="inline-block rounded-full bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#E67E22]">
                        {profile?.role || "user"}
                      </p>

                      {isApprovedAdmin && (
                        <p className="inline-block rounded-full bg-[#1F1F1F] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                          Approved Admin
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    className={mobileNavLinkClass("/profile")}
                  >
                    <User size={18} />
                    Profile
                  </Link>

                  {!useAdminNavbar && (
                    <>
                      <Link
                        href="/wishlist"
                        className={mobileNavLinkClass("/wishlist")}
                      >
                        <Heart size={18} />
                        Wishlist
                      </Link>

                      <Link
                        href="/cart"
                        className={mobileNavLinkClass("/cart")}
                      >
                        <ShoppingCart size={18} />
                        Cart
                      </Link>
                    </>
                  )}

                  <Link
                    href="/orders"
                    className={mobileNavLinkClass("/orders")}
                  >
                    <Package size={18} />
                    My Orders
                  </Link>

                  {!useAdminNavbar && (
                    <>
                      <Link
                        href="/seller-orders"
                        className={mobileNavLinkClass("/seller-orders")}
                      >
                        <Store size={18} />
                        Seller Orders
                      </Link>

                      <Link
                        href="/my-listings"
                        className={mobileNavLinkClass("/my-listings")}
                      >
                        <BookOpen size={18} />
                        My Listings
                      </Link>
                    </>
                  )}

                  {isApprovedAdmin && (
                    <Link
                      href="/admin"
                      className={mobileNavLinkClass("/admin")}
                    >
                      <Shield size={18} />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#B94A48] hover:bg-[#FFF1F0]"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="my-2 border-t border-[#EEE6DB]" />

                  <Link
                    href="/login"
                    className="block rounded-xl px-4 py-3 text-sm text-[#1F1F1F] hover:bg-[#F7F4EE]"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="block rounded-xl px-4 py-3 text-sm text-[#1F1F1F] hover:bg-[#F7F4EE]"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
