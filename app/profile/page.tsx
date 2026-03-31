"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import {
  LogOut,
  Shield,
  Mail,
  User,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
  Store,
  Save,
  Image as ImageIcon,
  ExternalLink,
  Link2,
  BookOpen,
  ShoppingBag,
  Wallet,
  Star,
  Eye,
  Lock,
} from "lucide-react";

type PSGCItem = {
  code: string;
  name: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string | null;
  is_admin: boolean | null;
  admin_status: string | null;
  birth_date: string | null;
  gender: string | null;
  phone_number: string | null;
  country: string | null;
  province: string | null;
  city: string | null;
  barangay: string | null;
  street_address: string | null;
  unit_number: string | null;
  postal_code: string | null;
  created_at: string | null;
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

type Address = {
  id: string;
  user_id: string;
  label: string | null;
  recipient_name: string | null;
  phone_number: string | null;
  country: string | null;
  province: string | null;
  city: string | null;
  barangay: string | null;
  street_address: string | null;
  unit_number: string | null;
  postal_code: string | null;
  is_default: boolean | null;
  created_at: string | null;
};

type AddressForm = {
  label: string;
  recipient_name: string;
  phone_number: string;
  country: string;
  province: string;
  city: string;
  barangay: string;
  street_address: string;
  unit_number: string;
  postal_code: string;
  is_default: boolean;
};

type ProfileForm = {
  full_name: string;
  public_display_name: string;
  phone_number: string;
  shop_name: string;
  shop_bio: string;
  shop_logo: string;
  shop_slug: string;
  gcash_number: string;
  bank_account_name: string;
  bank_account_number: string;
  show_phone_to_buyers: boolean;
};

const emptyAddressForm: AddressForm = {
  label: "",
  recipient_name: "",
  phone_number: "",
  country: "Philippines",
  province: "",
  city: "",
  barangay: "",
  street_address: "",
  unit_number: "",
  postal_code: "",
  is_default: false,
};

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

function ProfilePageSkeleton() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[32px] border border-[#EEE7DC] bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F9F4EC] px-6 py-8 shadow-[0_12px_40px_rgba(31,31,31,0.06)] sm:px-8 sm:py-10">
          <SkeletonBox className="h-5 w-24 rounded-full" />
          <SkeletonBox className="mt-4 h-12 w-52" />
          <SkeletonBox className="mt-3 h-5 w-80 max-w-full" />
        </div>

        <div className="mt-8 space-y-5">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-6 shadow-[0_10px_28px_rgba(31,31,31,0.05)]"
            >
              <SkeletonBox className="h-7 w-40" />
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[...Array(4)].map((__, itemIndex) => (
                  <div key={itemIndex} className="rounded-2xl bg-[#F7F4EE] p-4">
                    <SkeletonBox className="h-3 w-24" />
                    <SkeletonBox className="mt-3 h-5 w-32" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
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

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const supabase = createSupabaseBrowser();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [booksCount, setBooksCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: "",
    public_display_name: "",
    phone_number: "",
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

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(
    null,
  );
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const [provinces, setProvinces] = useState<PSGCItem[]>([]);
  const [cities, setCities] = useState<PSGCItem[]>([]);
  const [barangays, setBarangays] = useState<PSGCItem[]>([]);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");
  const [selectedBarangayCode, setSelectedBarangayCode] = useState("");

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  const inputClass =
    "w-full rounded-2xl border border-[#D9D2C7] bg-white px-4 py-3 text-[#1F1F1F] placeholder:text-[#8A8175] outline-none transition focus:border-[#E67E22]";
  const selectClass =
    "w-full rounded-2xl border border-[#D9D2C7] bg-white px-4 py-3 text-[#1F1F1F] outline-none transition focus:border-[#E67E22] disabled:cursor-not-allowed disabled:bg-[#F5F1EB] disabled:text-[#8A8175]";

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

      const [profileRes, booksRes, addressesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("books")
          .select("*", { count: "exact", head: true })
          .eq("seller_id", user.id),
        supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      if (profileRes.error) console.error(profileRes.error);
      if (addressesRes.error) console.error(addressesRes.error);

      if (profileRes.data) {
        const profileData = profileRes.data as Profile;
        setProfile(profileData);
        setProfileForm({
          full_name: profileData.full_name || "",
          public_display_name: profileData.public_display_name || "",
          phone_number: profileData.phone_number || "",
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
      setAddresses(addressesRes.data || []);
      setLoading(false);
    };

    loadProfile();
  }, [router, supabase]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const response = await fetch("https://psgc.gitlab.io/api/provinces/");
        const data: PSGCItem[] = await response.json();
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setProvinces(sorted);
      } catch (error) {
        console.error("Failed to load provinces:", error);
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedProvinceCode) {
        setCities([]);
        setBarangays([]);
        setSelectedCityCode("");
        setSelectedBarangayCode("");
        return;
      }

      try {
        setLoadingCities(true);
        setCities([]);
        setBarangays([]);
        setSelectedCityCode("");
        setSelectedBarangayCode("");

        const response = await fetch(
          `https://psgc.gitlab.io/api/provinces/${selectedProvinceCode}/cities-municipalities/`,
        );
        const data: PSGCItem[] = await response.json();
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setCities(sorted);
      } catch (error) {
        console.error("Failed to load cities/municipalities:", error);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedProvinceCode]);

  useEffect(() => {
    const fetchBarangays = async () => {
      if (!selectedCityCode) {
        setBarangays([]);
        setSelectedBarangayCode("");
        return;
      }

      try {
        setLoadingBarangays(true);
        setBarangays([]);
        setSelectedBarangayCode("");

        const response = await fetch(
          `https://psgc.gitlab.io/api/cities-municipalities/${selectedCityCode}/barangays/`,
        );
        const data: PSGCItem[] = await response.json();
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setBarangays(sorted);
      } catch (error) {
        console.error("Failed to load barangays:", error);
      } finally {
        setLoadingBarangays(false);
      }
    };

    fetchBarangays();
  }, [selectedCityCode]);

  const displayName =
    profileForm.full_name ||
    profile?.full_name ||
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    "BookBazaar User";

  const publicIdentity =
    profileForm.public_display_name.trim() ||
    profile?.public_display_name ||
    profileForm.shop_name.trim() ||
    profile?.shop_name ||
    displayName;

  const hasApprovedAdminAccess =
    profile?.is_admin === true && profile?.admin_status === "approved";
  const isMainAdmin = profile?.role === "admin";
  const isSeller = booksCount > 0;

  const accountLabel =
    isMainAdmin || hasApprovedAdminAccess
      ? "Admin"
      : isSeller && addresses.length > 0
        ? "Buyer • Seller"
        : isSeller
          ? "Seller"
          : "Buyer";

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString()
    : "Recently joined";

  const defaultAddress = useMemo(
    () => addresses.find((a) => a.is_default) || addresses[0] || null,
    [addresses],
  );

  const formatAddress = (address: Partial<Address>) => {
    return [
      address.unit_number,
      address.street_address,
      address.barangay,
      address.city,
      address.province,
      address.country,
      address.postal_code,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const completedOrdersLabel =
    (profile?.completed_orders ?? 0) > 0
      ? String(profile?.completed_orders ?? 0)
      : "No orders yet";

  const ratingLabel =
    (profile?.seller_rating ?? 0) > 0
      ? Number(profile?.seller_rating ?? 0).toFixed(1)
      : "No ratings yet";

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

    if (!profileForm.full_name.trim()) {
      showToast({
        title: "Name required",
        message: "Please enter your full name.",
        type: "error",
      });
      return;
    }

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
          full_name: profileForm.full_name.trim(),
          phone_number: profileForm.phone_number.trim() || null,
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
              full_name: profileForm.full_name.trim(),
              phone_number: profileForm.phone_number.trim() || null,
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
        title: "Profile updated",
        message: "Your profile details were saved successfully.",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Save failed",
        message: "Failed to update your profile.",
        type: "error",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProvinceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = e.target.value;
    const province = provinces.find((p) => p.code === provinceCode);

    setSelectedProvinceCode(provinceCode);
    setSelectedCityCode("");
    setSelectedBarangayCode("");

    setAddressForm((prev) => ({
      ...prev,
      province: province?.name ?? "",
      city: "",
      barangay: "",
    }));
  };

  const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityCode = e.target.value;
    const city = cities.find((c) => c.code === cityCode);

    setSelectedCityCode(cityCode);
    setSelectedBarangayCode("");

    setAddressForm((prev) => ({
      ...prev,
      city: city?.name ?? "",
      barangay: "",
    }));
  };

  const handleBarangaySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const barangayCode = e.target.value;
    const barangay = barangays.find((b) => b.code === barangayCode);

    setSelectedBarangayCode(barangayCode);

    setAddressForm((prev) => ({
      ...prev,
      barangay: barangay?.name ?? "",
    }));
  };

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setSelectedProvinceCode("");
    setSelectedCityCode("");
    setSelectedBarangayCode("");
    setCities([]);
    setBarangays([]);

    setAddressForm({
      ...emptyAddressForm,
      recipient_name: displayName,
      phone_number: profileForm.phone_number || profile?.phone_number || "",
      country: "Philippines",
      is_default: addresses.length === 0,
    });

    setAddressModalOpen(true);
  };

  const openEditAddressModal = (address: Address) => {
    setEditingAddressId(address.id);
    setSelectedProvinceCode("");
    setSelectedCityCode("");
    setSelectedBarangayCode("");
    setCities([]);
    setBarangays([]);

    setAddressForm({
      label: address.label || "",
      recipient_name: address.recipient_name || "",
      phone_number: address.phone_number || "",
      country: address.country || "Philippines",
      province: address.province || "",
      city: address.city || "",
      barangay: address.barangay || "",
      street_address: address.street_address || "",
      unit_number: address.unit_number || "",
      postal_code: address.postal_code || "",
      is_default: !!address.is_default,
    });

    setAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    if (savingAddress) return;
    setAddressModalOpen(false);
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
    setSelectedProvinceCode("");
    setSelectedCityCode("");
    setSelectedBarangayCode("");
    setCities([]);
    setBarangays([]);
  };

  const handleAddressInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const reloadAddresses = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setAddresses(data || []);
  };

  const saveAddress = async () => {
    if (!userId) return;

    if (
      !addressForm.recipient_name.trim() ||
      !addressForm.phone_number.trim() ||
      !addressForm.country.trim() ||
      !addressForm.province.trim() ||
      !addressForm.city.trim() ||
      !addressForm.barangay.trim() ||
      !addressForm.street_address.trim()
    ) {
      showToast({
        title: "Incomplete address",
        message: "Please fill in the required address fields.",
        type: "error",
      });
      return;
    }

    setSavingAddress(true);

    try {
      if (addressForm.is_default) {
        const { error: clearDefaultError } = await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", userId);

        if (clearDefaultError) throw clearDefaultError;
      }

      if (editingAddressId) {
        const { error } = await supabase
          .from("addresses")
          .update({
            label: addressForm.label || null,
            recipient_name: addressForm.recipient_name,
            phone_number: addressForm.phone_number,
            country: addressForm.country,
            province: addressForm.province,
            city: addressForm.city,
            barangay: addressForm.barangay,
            street_address: addressForm.street_address,
            unit_number: addressForm.unit_number || null,
            postal_code: addressForm.postal_code || null,
            is_default: addressForm.is_default,
          })
          .eq("id", editingAddressId)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("addresses").insert({
          user_id: userId,
          label: addressForm.label || null,
          recipient_name: addressForm.recipient_name,
          phone_number: addressForm.phone_number,
          country: addressForm.country,
          province: addressForm.province,
          city: addressForm.city,
          barangay: addressForm.barangay,
          street_address: addressForm.street_address,
          unit_number: addressForm.unit_number || null,
          postal_code: addressForm.postal_code || null,
          is_default: addressForm.is_default,
        });

        if (error) throw error;
      }

      await reloadAddresses();
      closeAddressModal();

      showToast({
        title: editingAddressId ? "Address updated" : "Address saved",
        message: editingAddressId
          ? "Your address has been updated successfully."
          : "Your new address has been saved successfully.",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Save failed",
        message: "Failed to save address.",
        type: "error",
      });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!userId) return;

    const confirmed = await confirm({
      title: "Delete Address?",
      message:
        "Are you sure you want to delete this address? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Keep Address",
      danger: true,
    });
    if (!confirmed) return;

    setDeletingAddressId(addressId);

    try {
      const addressToDelete = addresses.find((a) => a.id === addressId);

      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", addressId)
        .eq("user_id", userId);

      if (error) throw error;

      if (addressToDelete?.is_default) {
        const remaining = addresses.filter((a) => a.id !== addressId);
        if (remaining.length > 0) {
          const newestRemaining = remaining[0];
          const { error: setDefaultError } = await supabase
            .from("addresses")
            .update({ is_default: true })
            .eq("id", newestRemaining.id)
            .eq("user_id", userId);

          if (setDefaultError) throw setDefaultError;
        }
      }

      await reloadAddresses();

      showToast({
        title: "Address deleted",
        message: "The address has been deleted successfully.",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Delete failed",
        message: "Failed to delete address.",
        type: "error",
      });
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!userId) return;

    setSettingDefaultId(addressId);

    try {
      const { error: clearDefaultError } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);

      if (clearDefaultError) throw clearDefaultError;

      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId)
        .eq("user_id", userId);

      if (error) throw error;

      await reloadAddresses();

      showToast({
        title: "Default address updated",
        message: "This address is now your default address.",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Update failed",
        message: "Failed to set default address.",
        type: "error",
      });
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Logout?",
      message: "Are you sure you want to log out of your BookBazaar account?",
      confirmText: "Logout",
      cancelText: "Stay Logged In",
      danger: true,
    });

    if (!confirmed) return;

    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <>
      <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <section className="relative overflow-hidden rounded-[32px] border border-[#EEE7DC] bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F9F4EC] px-6 py-8 shadow-[0_12px_40px_rgba(31,31,31,0.06)] sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#E67E22]/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#F3C998]/20 blur-2xl" />

            <div className="relative z-10">
              <p className="inline-flex rounded-full bg-[#E67E22]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#C96A16]">
                Account
              </p>

              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF3E7] text-[#E67E22] shadow-sm">
                    {profileForm.shop_logo ||
                    profile?.shop_logo ||
                    profile?.avatar_url ? (
                      <img
                        src={
                          profileForm.shop_logo ||
                          profile?.shop_logo ||
                          profile?.avatar_url ||
                          ""
                        }
                        alt={publicIdentity}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={30} />
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
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1F1F1F] ring-1 ring-[#E9DFD2]">
                        {accountLabel}
                      </span>

                      {isSeller && (
                        <span className="rounded-full bg-[#FFF3E7] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#C96A16]">
                          Store Active
                        </span>
                      )}

                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#6B6B6B] ring-1 ring-[#E9DFD2]">
                        Joined {joinedDate}
                      </span>
                    </div>
                  </div>
                </div>

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

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6B6B6B] sm:text-base">
                Manage your public identity, seller information, and saved
                addresses in one clean profile page.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#E9DFD2] bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A8175]">
                    Listings
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[#1F1F1F]">
                    <BookOpen size={16} className="text-[#E67E22]" />
                    <span className="text-lg font-bold">{booksCount}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E9DFD2] bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A8175]">
                    Addresses
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[#1F1F1F]">
                    <MapPin size={16} className="text-[#E67E22]" />
                    <span className="text-lg font-bold">
                      {addresses.length}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E9DFD2] bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A8175]">
                    Seller Status
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[#1F1F1F]">
                    <ShoppingBag size={16} className="text-[#E67E22]" />
                    <span className="text-sm font-bold">
                      {isSeller ? "Store Active" : "Buyer Account"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 space-y-5">
            <section className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-6 shadow-[0_10px_28px_rgba(31,31,31,0.05)] sm:p-7">
              <div className="flex items-center gap-3">
                <User className="text-[#E67E22]" size={20} />
                <h2 className="text-2xl font-bold text-[#1F1F1F]">
                  Profile Identity
                </h2>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                    Full Name
                  </label>
                  <input
                    name="full_name"
                    value={profileForm.full_name}
                    onChange={handleProfileInput}
                    placeholder="Your full name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                    Public Display Name
                  </label>
                  <input
                    name="public_display_name"
                    value={profileForm.public_display_name}
                    onChange={handleProfileInput}
                    placeholder="Name shown to buyers"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                    Email
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-[#D9D2C7] bg-[#F7F4EE] px-4 py-3 text-[#6B6B6B]">
                    <Mail size={16} className="shrink-0" />
                    <span className="min-w-0 break-all">
                      {profile?.email || "Not provided"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                    Phone Number
                  </label>
                  <input
                    name="phone_number"
                    value={profileForm.phone_number}
                    onChange={handleProfileInput}
                    placeholder="09xxxxxxxxx"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-6 shadow-[0_10px_28px_rgba(31,31,31,0.05)] sm:p-7">
              <div className="flex items-center gap-3">
                <Store className="text-[#E67E22]" size={20} />
                <h2 className="text-2xl font-bold text-[#1F1F1F]">
                  Store Identity
                </h2>
              </div>

              <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                Set up how your seller profile will appear to buyers.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                    Shop Name
                  </label>
                  <input
                    name="shop_name"
                    value={profileForm.shop_name}
                    onChange={handleProfileInput}
                    placeholder="Example: Jane's Book Corner"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                    Shop Image
                  </label>
                  <input
                    name="shop_logo"
                    value={profileForm.shop_logo}
                    onChange={handleProfileInput}
                    placeholder="Paste image URL for now"
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs text-[#8A8175]">
                    Use an image link for now. Later, this can be upgraded to
                    image upload.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                    Store Link Name
                  </label>
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
                  <p className="mt-2 text-xs text-[#8A8175]">
                    Public link: /shop/
                    {profileForm.shop_slug || "your-shop-name"}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                    Shop Bio
                  </label>
                  <textarea
                    name="shop_bio"
                    value={profileForm.shop_bio}
                    onChange={handleProfileInput}
                    rows={4}
                    placeholder="Describe your shop (e.g. affordable books, academic, novels, preloved finds)."
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-[#EFE7DA] bg-[#FCF7F0] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-[#E67E22] shadow-sm">
                    {profileForm.shop_logo ? (
                      <img
                        src={profileForm.shop_logo}
                        alt={profileForm.shop_name || publicIdentity}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={22} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                      Preview
                    </p>
                    <h3 className="mt-2 break-words text-lg font-bold text-[#1F1F1F]">
                      {profileForm.shop_name || publicIdentity}
                    </h3>
                    <p className="mt-2 break-words text-sm leading-7 text-[#6B6B6B]">
                      {profileForm.shop_bio ||
                        "Your shop bio will appear here once you add one."}
                    </p>

                    {profileForm.shop_slug && (
                      <Link
                        href={`/shop/${profileForm.shop_slug}`}
                        target="_blank"
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-4 py-2 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
                      >
                        <ExternalLink size={14} />
                        View Public Store
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#E67E22] px-5 py-3 font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-70"
                >
                  <Save size={16} />
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-6 shadow-[0_10px_28px_rgba(31,31,31,0.05)] sm:p-7">
              <div className="flex items-center gap-3">
                <Wallet className="text-[#E67E22]" size={20} />
                <h2 className="text-2xl font-bold text-[#1F1F1F]">
                  Payment Methods
                </h2>
              </div>

              <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                Add payout details buyers can use for payment coordination and
                seller transactions.
              </p>

              <div className="mt-4 rounded-[24px] border border-[#EFE7DA] bg-[#FCF7F0] p-4">
                <div className="flex items-start gap-3">
                  <Lock size={18} className="mt-1 shrink-0 text-[#E67E22]" />
                  <div>
                    <p className="font-semibold text-[#1F1F1F]">
                      Secure payment info
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#6B6B6B]">
                      Only used for transactions. Not shared publicly unless
                      part of payment coordination.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                    GCash Number
                  </label>
                  <input
                    name="gcash_number"
                    value={profileForm.gcash_number}
                    onChange={handleProfileInput}
                    placeholder="09xxxxxxxxx"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                    Bank Account Name
                  </label>
                  <input
                    name="bank_account_name"
                    value={profileForm.bank_account_name}
                    onChange={handleProfileInput}
                    placeholder="Account holder name"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                    Bank Account Number
                  </label>
                  <input
                    name="bank_account_number"
                    value={profileForm.bank_account_number}
                    onChange={handleProfileInput}
                    placeholder="Enter bank account number"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-[#EEE6DB] bg-[#F7F4EE] p-5">
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
                      Let buyers see your phone number for easier delivery and
                      payment coordination.
                    </p>
                  </div>
                </label>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-6 shadow-[0_10px_28px_rgba(31,31,31,0.05)] sm:p-7">
              <div className="flex items-center gap-3">
                <Star className="text-[#E67E22]" size={20} />
                <h2 className="text-2xl font-bold text-[#1F1F1F]">
                  Seller Trust
                </h2>
              </div>

              <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                Trust indicators help buyers decide faster and feel more
                confident when purchasing.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#EEE6DB] bg-[#F7F4EE] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                    Listings
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[#1F1F1F]">
                    <BookOpen size={16} className="text-[#E67E22]" />
                    <span className="text-xl font-bold">{booksCount}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#EEE6DB] bg-[#F7F4EE] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                    Orders Completed
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[#1F1F1F]">
                    <ShoppingBag size={16} className="text-[#E67E22]" />
                    <span className="text-base font-bold">
                      {completedOrdersLabel}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#EEE6DB] bg-[#F7F4EE] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                    Rating
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[#1F1F1F]">
                    <Star size={16} className="fill-[#E67E22] text-[#E67E22]" />
                    <span className="text-base font-bold">{ratingLabel}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-[#EEE6DB] bg-[#FCF7F0] p-5">
                <div className="flex items-start gap-3">
                  <Eye size={18} className="mt-1 shrink-0 text-[#E67E22]" />
                  <div>
                    <p className="font-semibold text-[#1F1F1F]">
                      Trust Preview
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[#6B6B6B]">
                      Buyers will trust your store more when listings, completed
                      orders, and rating are clearly visible.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-6 shadow-[0_10px_28px_rgba(31,31,31,0.05)] sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#1F1F1F]">
                    Saved Addresses
                  </h2>
                  <p className="mt-1 text-sm text-[#6B6B6B]">
                    Add multiple delivery addresses and keep one as default.
                  </p>
                </div>

                <button
                  onClick={openAddAddressModal}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E67E22] px-4 py-3 font-semibold text-white transition hover:bg-[#cf6f1c]"
                >
                  <Plus size={16} />
                  Add Address
                </button>
              </div>

              {defaultAddress && (
                <div className="mt-6 rounded-[24px] border border-[#EEE6DB] bg-[#F7F4EE] p-5">
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={18}
                      className="mt-1 shrink-0 text-[#E67E22]"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                          Default Address
                        </p>
                        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#E67E22]">
                          Default
                        </span>
                      </div>

                      <p className="mt-2 break-words font-semibold text-[#1F1F1F]">
                        {defaultAddress.label || "Primary Address"}
                      </p>

                      <p className="mt-2 font-semibold text-[#1F1F1F]">
                        {defaultAddress.recipient_name || displayName}
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#6B6B6B]">
                        {defaultAddress.phone_number || "No phone"}
                      </p>

                      <p className="mt-3 text-sm leading-7 text-[#1F1F1F]">
                        {formatAddress(defaultAddress)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!addresses.length ? (
                <div className="mt-6 rounded-[24px] border border-dashed border-[#D9D2C7] bg-[#FCFBF8] p-6 text-center">
                  <p className="font-semibold text-[#1F1F1F]">
                    No saved addresses yet
                  </p>
                  <p className="mt-2 text-sm text-[#6B6B6B]">
                    Add your first address for faster checkout and easier
                    delivery setup.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="rounded-[24px] border border-[#E5E0D8] bg-[#FFFDF9] p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="break-words font-semibold text-[#1F1F1F]">
                              {address.label || "Saved Address"}
                            </p>

                            {address.is_default && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-700">
                                <CheckCircle2 size={12} />
                                Default
                              </span>
                            )}
                          </div>

                          <p className="mt-2 font-semibold text-[#1F1F1F]">
                            {address.recipient_name || displayName}
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#6B6B6B]">
                            {address.phone_number || "No phone"}
                          </p>

                          <p className="mt-3 text-sm leading-7 text-[#1F1F1F]">
                            {formatAddress(address) || "No address details"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {!address.is_default && (
                            <button
                              onClick={() => handleSetDefault(address.id)}
                              disabled={settingDefaultId === address.id}
                              className="rounded-xl border border-[#E5E0D8] px-3 py-2 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE] disabled:opacity-60"
                            >
                              {settingDefaultId === address.id
                                ? "Setting..."
                                : "Set Default"}
                            </button>
                          )}

                          <button
                            onClick={() => openEditAddressModal(address)}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#E5E0D8] px-3 py-2 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            disabled={deletingAddressId === address.id}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                          >
                            <Trash2 size={14} />
                            {deletingAddressId === address.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-6 shadow-[0_10px_28px_rgba(31,31,31,0.05)]">
              <h2 className="text-2xl font-bold text-[#1F1F1F]">
                Account Actions
              </h2>
              <p className="mt-1 text-sm text-[#6B6B6B]">
                Securely manage your session.
              </p>

              <button
                onClick={handleLogout}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-4 py-2.5 text-sm font-semibold text-[#7A6F61] transition hover:bg-[#F7F4EE]"
              >
                <LogOut size={15} />
                Logout
              </button>
            </section>

            {(isMainAdmin || hasApprovedAdminAccess) && (
              <section className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-6 shadow-[0_10px_28px_rgba(31,31,31,0.05)]">
                <div className="flex items-center gap-3">
                  <Shield className="text-[#E67E22]" size={20} />
                  <h2 className="text-2xl font-bold text-[#1F1F1F]">
                    Admin Access
                  </h2>
                </div>

                <p className="mt-3 break-words text-sm leading-7 text-[#6B6B6B]">
                  {isMainAdmin
                    ? "You are the main administrator and can access all platform tools."
                    : "You have approved administrator privileges and can access platform insights and management tools."}
                </p>

                <button
                  onClick={() => router.push("/admin")}
                  className="mt-5 rounded-full bg-[#E67E22] px-5 py-3 font-semibold text-white transition hover:bg-[#cf6f1c]"
                >
                  Open Admin Dashboard
                </button>
              </section>
            )}
          </div>
        </div>
      </main>

      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-[#1F1F1F]">
                  {editingAddressId ? "Edit Address" : "Add New Address"}
                </h3>
                <p className="mt-1 text-sm text-[#6B6B6B]">
                  Save another delivery location for convenience.
                </p>
              </div>

              <button
                onClick={closeAddressModal}
                className="rounded-full p-2 text-[#6B6B6B] transition hover:bg-[#F7F4EE]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                  Address Label
                </label>
                <input
                  name="label"
                  value={addressForm.label}
                  onChange={handleAddressInput}
                  placeholder="Home, Dorm, Office"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                  Recipient Name *
                </label>
                <input
                  name="recipient_name"
                  value={addressForm.recipient_name}
                  onChange={handleAddressInput}
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                  Phone Number *
                </label>
                <input
                  name="phone_number"
                  value={addressForm.phone_number}
                  onChange={handleAddressInput}
                  placeholder="09xxxxxxxxx"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                  Country *
                </label>
                <input
                  name="country"
                  value={addressForm.country}
                  onChange={handleAddressInput}
                  className={inputClass}
                  required
                  readOnly
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                  Province *
                </label>
                <select
                  value={selectedProvinceCode}
                  onChange={handleProvinceSelect}
                  className={selectClass}
                  required
                  disabled={loadingProvinces}
                >
                  <option value="">
                    {loadingProvinces
                      ? "Loading provinces..."
                      : "Select Province"}
                  </option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>

                {editingAddressId &&
                  addressForm.province &&
                  !selectedProvinceCode && (
                    <p className="mt-2 text-xs text-[#8A8175]">
                      Current: {addressForm.province}
                    </p>
                  )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                  City / Municipality *
                </label>
                <select
                  value={selectedCityCode}
                  onChange={handleCitySelect}
                  className={selectClass}
                  required
                  disabled={!selectedProvinceCode}
                >
                  <option value="">
                    {loadingCities
                      ? "Loading cities..."
                      : !selectedProvinceCode
                        ? "Select Province first"
                        : "Select City / Municipality"}
                  </option>
                  {cities.map((city) => (
                    <option key={city.code} value={city.code}>
                      {city.name}
                    </option>
                  ))}
                </select>

                {editingAddressId && addressForm.city && !selectedCityCode && (
                  <p className="mt-2 text-xs text-[#8A8175]">
                    Current: {addressForm.city}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                  Barangay *
                </label>
                <select
                  value={selectedBarangayCode}
                  onChange={handleBarangaySelect}
                  className={selectClass}
                  required
                  disabled={!selectedCityCode}
                >
                  <option value="">
                    {loadingBarangays
                      ? "Loading barangays..."
                      : !selectedCityCode
                        ? "Select City first"
                        : "Select Barangay"}
                  </option>
                  {barangays.map((barangay) => (
                    <option key={barangay.code} value={barangay.code}>
                      {barangay.name}
                    </option>
                  ))}
                </select>

                {editingAddressId &&
                  addressForm.barangay &&
                  !selectedBarangayCode && (
                    <p className="mt-2 text-xs text-[#8A8175]">
                      Current: {addressForm.barangay}
                    </p>
                  )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                  Unit / House No.
                </label>
                <input
                  name="unit_number"
                  value={addressForm.unit_number}
                  onChange={handleAddressInput}
                  placeholder="Unit 3, Block 2"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                  Street Address *
                </label>
                <textarea
                  name="street_address"
                  value={addressForm.street_address}
                  onChange={handleAddressInput}
                  placeholder="Street, subdivision, landmark"
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                  Postal Code
                </label>
                <input
                  name="postal_code"
                  value={addressForm.postal_code}
                  onChange={handleAddressInput}
                  placeholder="8000"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1F1F1F]">
                  Default Address
                </label>

                <label className="flex h-[50px] cursor-pointer items-center gap-4 rounded-2xl border border-[#D9D2C7] bg-white px-5 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={addressForm.is_default}
                    onChange={handleAddressInput}
                    className="h-4 w-4 shrink-0"
                  />
                  <span>Set as default address</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={closeAddressModal}
                className="rounded-2xl border border-[#D9D2C7] px-5 py-3 font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
              >
                Cancel
              </button>

              <button
                onClick={saveAddress}
                disabled={savingAddress}
                className="rounded-2xl bg-[#E67E22] px-5 py-3 font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-70"
              >
                {savingAddress
                  ? "Saving..."
                  : editingAddressId
                    ? "Update Address"
                    : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
