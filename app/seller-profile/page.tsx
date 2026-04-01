"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import SellerNavbar from "@/components/SellerNavbar";
import {
  Store,
  Save,
  Image as ImageIcon,
  ExternalLink,
  Link2,
  BookOpen,
  ShoppingBag,
  Wallet,
  Star,
  Lock,
  User,
} from "lucide-react";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  shop_name: string | null;
  shop_bio: string | null;
  shop_logo: string | null;
  public_display_name: string | null;
  shop_slug: string | null;
  gcash_number: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  show_phone_to_buyers: boolean | null;
  seller_rating: number | null;
  completed_orders: number | null;
};

type ProfileForm = {
  public_display_name: string;
  shop_name: string;
  shop_bio: string;
  shop_logo: string;
  shop_slug: string;
  gcash_number: string;
  bank_account_name: string;
  bank_account_number: string;
  show_phone_to_buyers: boolean;
};

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

function SellerProfileSkeleton() {
  return (
    <>
      <SellerNavbar />

      <main className="min-h-screen bg-[#F7F4EE] px-4 py-8 sm:px-6 lg:px-8 md:ml-[240px]">
        <div className="mx-auto max-w-[1100px]">
          <section className="rounded-[32px] border border-[#E5E0D8] bg-white p-6 sm:p-8">
            <SkeletonBox className="h-5 w-24 rounded-full" />
            <SkeletonBox className="mt-4 h-12 w-64" />
            <SkeletonBox className="mt-3 h-5 w-80 max-w-full" />
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
            <section className="rounded-[28px] border border-[#E5E0D8] bg-white p-6">
              <SkeletonBox className="h-7 w-40" />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="mt-2 h-12 w-full" />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-6">
                <SkeletonBox className="h-7 w-32" />
                <div className="mt-5 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonBox key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default function SellerProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createSupabaseBrowser();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [booksCount, setBooksCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    public_display_name: "",
    shop_name: "",
    shop_bio: "",
    shop_logo: "",
    shop_slug: "",
    gcash_number: "",
    bank_account_name: "",
    bank_account_number: "",
    show_phone_to_buyers: false,
  });

  const [savingProfile, setSavingProfile] = useState(false);

  const inputClass =
    "w-full rounded-2xl border border-[#D9D2C7] bg-white px-4 py-3 text-[#1F1F1F] placeholder:text-[#8A8175] outline-none transition focus:border-[#E67E22]";

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const [profileRes, booksRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("books")
          .select("*", { count: "exact", head: true })
          .eq("seller_id", user.id),
      ]);

      if (profileRes.error) console.error(profileRes.error);

      if (profileRes.data) {
        const profileData = profileRes.data as Profile;
        setProfile(profileData);
        setProfileForm({
          public_display_name: profileData.public_display_name || "",
          shop_name: profileData.shop_name || "",
          shop_bio: profileData.shop_bio || "",
          shop_logo: profileData.shop_logo || "",
          shop_slug: profileData.shop_slug || "",
          gcash_number: profileData.gcash_number || "",
          bank_account_name: profileData.bank_account_name || "",
          bank_account_number: profileData.bank_account_number || "",
          show_phone_to_buyers: !!profileData.show_phone_to_buyers,
        });
      }

      setBooksCount(booksRes.count || 0);
      setLoading(false);
    };

    loadProfile();
  }, [router, supabase]);

  const publicIdentity =
    profileForm.public_display_name.trim() ||
    profile?.public_display_name ||
    profileForm.shop_name.trim() ||
    profile?.shop_name ||
    profile?.full_name ||
    "Your Store";

  const ratingLabel =
    (profile?.seller_rating ?? 0) > 0
      ? Number(profile?.seller_rating ?? 0).toFixed(1)
      : "No ratings yet";

  const completedOrdersLabel =
    (profile?.completed_orders ?? 0) > 0
      ? String(profile?.completed_orders ?? 0)
      : "No orders yet";

  const handleProfileInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;

    setProfileForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSlugInput = (value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      shop_slug: slugify(value),
    }));
  };

  const saveProfile = async () => {
    if (!userId) return;

    setSavingProfile(true);

    try {
      const cleanSlug = profileForm.shop_slug.trim()
        ? slugify(profileForm.shop_slug)
        : null;

      if (cleanSlug) {
        const { data: existingSlug, error: slugCheckError } = await supabase
          .from("profiles")
          .select("id")
          .eq("shop_slug", cleanSlug)
          .neq("id", userId)
          .maybeSingle();

        if (slugCheckError) throw slugCheckError;

        if (existingSlug) {
          showToast({
            title: "Slug already used",
            message: "Please choose a different store link name.",
            type: "error",
          });
          setSavingProfile(false);
          return;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          public_display_name: profileForm.public_display_name.trim() || null,
          shop_name: profileForm.shop_name.trim() || null,
          shop_bio: profileForm.shop_bio.trim() || null,
          shop_logo: profileForm.shop_logo.trim() || null,
          shop_slug: cleanSlug,
          gcash_number: profileForm.gcash_number.trim() || null,
          bank_account_name: profileForm.bank_account_name.trim() || null,
          bank_account_number: profileForm.bank_account_number.trim() || null,
          show_phone_to_buyers: profileForm.show_phone_to_buyers,
        })
        .eq("id", userId);

      if (error) throw error;

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              public_display_name:
                profileForm.public_display_name.trim() || null,
              shop_name: profileForm.shop_name.trim() || null,
              shop_bio: profileForm.shop_bio.trim() || null,
              shop_logo: profileForm.shop_logo.trim() || null,
              shop_slug: cleanSlug,
              gcash_number: profileForm.gcash_number.trim() || null,
              bank_account_name: profileForm.bank_account_name.trim() || null,
              bank_account_number:
                profileForm.bank_account_number.trim() || null,
              show_phone_to_buyers: profileForm.show_phone_to_buyers,
            }
          : prev,
      );

      setProfileForm((prev) => ({
        ...prev,
        shop_slug: cleanSlug || "",
      }));

      showToast({
        title: "Seller profile updated",
        message: "Your store profile was saved successfully.",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Save failed",
        message: "Failed to update your seller profile.",
        type: "error",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return <SellerProfileSkeleton />;
  }

  return (
    <>
      <SellerNavbar />

      <main className="min-h-screen bg-[#F7F4EE] px-4 py-8 sm:px-6 lg:px-8 md:ml-[240px]">
        <div className="mx-auto max-w-[1100px]">
          <section className="relative overflow-hidden rounded-[32px] border border-[#E5E0D8] bg-white p-6 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#FFF3E7] blur-3xl" />

            <div className="relative z-10">
              <p className="inline-flex rounded-full bg-[#FFF3E7] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#C96A16]">
                Seller Profile
              </p>

              <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF3E7] text-[#E67E22]">
                    {profileForm.shop_logo || profile?.shop_logo ? (
                      <img
                        src={profileForm.shop_logo || profile?.shop_logo || ""}
                        alt={publicIdentity}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store size={30} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h1 className="break-words text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
                      {publicIdentity}
                    </h1>

                    <p className="mt-2 text-sm font-medium text-[#8A8175]">
                      @
                      {profileForm.shop_slug ||
                        profile?.shop_slug ||
                        "your-store-link"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#FFF3E7] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#C96A16]">
                        Store Profile
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {(profileForm.shop_slug || profile?.shop_slug) && (
                    <Link
                      href={`/shop/${profileForm.shop_slug || profile?.shop_slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-4 py-2.5 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
                    >
                      <ExternalLink size={14} />
                      View Public Store
                    </Link>
                  )}
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5F5A52] sm:text-base">
                Manage how your store appears to buyers, including branding,
                public link, and payout information.
              </p>
            </div>
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
            <section className="rounded-[28px] border border-[#E5E0D8] bg-white p-6 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <Store className="text-[#E67E22]" size={20} />
                <h2 className="text-2xl font-bold text-[#1F1F1F]">
                  Store Setup
                </h2>
              </div>

              <div className="grid gap-8">
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Store size={16} className="text-[#8A8175]" />
                    <h3 className="text-lg font-bold text-[#1F1F1F]">
                      Store Identity
                    </h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Public Display Name">
                      <input
                        name="public_display_name"
                        value={profileForm.public_display_name}
                        onChange={handleProfileInput}
                        placeholder="Name shown to buyers"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Shop Name">
                      <input
                        name="shop_name"
                        value={profileForm.shop_name}
                        onChange={handleProfileInput}
                        placeholder="Example: Jane's Book Corner"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Shop Image">
                      <input
                        name="shop_logo"
                        value={profileForm.shop_logo}
                        onChange={handleProfileInput}
                        placeholder="Paste image URL for now"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Store Link Name">
                      <div className="relative">
                        <Link2
                          size={16}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8175]"
                        />
                        <input
                          name="shop_slug"
                          value={profileForm.shop_slug}
                          onChange={(e) => handleSlugInput(e.target.value)}
                          placeholder="example: janes-book-corner"
                          className="w-full rounded-2xl border border-[#D9D2C7] bg-white py-3 pl-11 pr-4 text-[#1F1F1F] placeholder:text-[#8A8175] outline-none transition focus:border-[#E67E22]"
                        />
                      </div>
                    </Field>

                    <div className="md:col-span-2">
                      <Field label="Shop Bio">
                        <textarea
                          name="shop_bio"
                          value={profileForm.shop_bio}
                          onChange={handleProfileInput}
                          rows={4}
                          placeholder="Describe your shop (e.g. affordable books, academic, novels, preloved finds)."
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-[#EEE6DB]" />

                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Wallet size={16} className="text-[#8A8175]" />
                    <h3 className="text-lg font-bold text-[#1F1F1F]">
                      Payment Setup
                    </h3>
                  </div>

                  <div className="mb-4 rounded-2xl border border-[#EEE6DB] bg-[#F7F4EE] p-4">
                    <div className="flex items-start gap-3">
                      <Lock
                        size={18}
                        className="mt-1 shrink-0 text-[#E67E22]"
                      />
                      <div>
                        <p className="font-semibold text-[#1F1F1F]">
                          Secure payment info
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[#6B6B6B]">
                          Used for seller transaction coordination and payout
                          details.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="GCash Number">
                      <input
                        name="gcash_number"
                        value={profileForm.gcash_number}
                        onChange={handleProfileInput}
                        placeholder="09xxxxxxxxx"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Bank Account Name">
                      <input
                        name="bank_account_name"
                        value={profileForm.bank_account_name}
                        onChange={handleProfileInput}
                        placeholder="Account holder name"
                        className={inputClass}
                      />
                    </Field>

                    <div className="md:col-span-2">
                      <Field label="Bank Account Number">
                        <input
                          name="bank_account_number"
                          value={profileForm.bank_account_number}
                          onChange={handleProfileInput}
                          placeholder="Enter bank account number"
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#EEE6DB] bg-[#F7F4EE] p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        name="show_phone_to_buyers"
                        checked={profileForm.show_phone_to_buyers}
                        onChange={handleProfileInput}
                        className="mt-1 h-4 w-4 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-[#1F1F1F]">
                          Show phone number to buyers
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[#6B6B6B]">
                          Let buyers see your phone number for delivery and
                          payment coordination.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#E67E22] px-5 py-3 font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-70"
                >
                  <Save size={16} />
                  {savingProfile ? "Saving..." : "Save Seller Profile"}
                </button>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-6">
                <h2 className="text-2xl font-bold text-[#1F1F1F]">
                  Store Summary
                </h2>

                <div className="mt-5 space-y-3">
                  <MiniInfoRow
                    icon={BookOpen}
                    label="Listings"
                    value={String(booksCount)}
                  />
                  <MiniInfoRow
                    icon={ShoppingBag}
                    label="Completed Orders"
                    value={completedOrdersLabel}
                  />
                  <MiniInfoRow
                    icon={Star}
                    label="Seller Rating"
                    value={ratingLabel}
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-6">
                <h2 className="text-2xl font-bold text-[#1F1F1F]">
                  Store Preview
                </h2>

                <div className="mt-5 rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F7F4EE] text-[#E67E22]">
                      {profileForm.shop_logo ? (
                        <img
                          src={profileForm.shop_logo}
                          alt={publicIdentity}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={20} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-lg font-bold text-[#1F1F1F]">
                        {profileForm.shop_name || publicIdentity}
                      </p>
                      <p className="mt-1 text-sm text-[#8A8175]">
                        @{profileForm.shop_slug || "your-store-link"}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#5F5A52]">
                        {profileForm.shop_bio ||
                          "Your store description will appear here once you add one."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
        {label}
      </label>
      {children}
    </div>
  );
}

function MiniInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] px-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="rounded-xl bg-[#FFF3E7] p-2 text-[#E67E22]">
          <Icon size={16} />
        </div>
        <span className="truncate text-sm font-medium text-[#1F1F1F]">
          {label}
        </span>
      </div>

      <span className="shrink-0 text-sm font-semibold text-[#1F1F1F]">
        {value}
      </span>
    </div>
  );
}
