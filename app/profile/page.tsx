"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import {
  LogOut,
  BookOpen,
  Heart,
  Shield,
  Mail,
  User,
  CalendarDays,
  Phone,
  MapPin,
  ChevronRight,
  BadgeCheck,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
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
    <>
      <main className="min-h-screen bg-[#F7F5F1]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-8">
            <SkeletonBox className="h-4 w-20 rounded-full" />
            <SkeletonBox className="mt-3 h-10 w-48" />
            <SkeletonBox className="mt-2 h-5 w-80 max-w-full" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <section className="rounded-3xl border border-[#E5E0D8] bg-white p-8 shadow-sm">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex gap-5">
                    <SkeletonBox className="h-20 w-20 shrink-0 rounded-full" />

                    <div className="min-w-0">
                      <SkeletonBox className="h-10 w-56 max-w-[260px]" />

                      <div className="mt-3 flex flex-wrap gap-3">
                        <SkeletonBox className="h-7 w-20 rounded-full" />
                        <SkeletonBox className="h-7 w-16 rounded-full" />
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-2xl bg-[#F7F4EE] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <SkeletonBox className="h-4 w-4 rounded-full" />
                      <SkeletonBox className="h-4 w-28" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 sm:grid-cols-2">
                {[...Array(2)].map((_, index) => (
                  <div
                    key={index}
                    className="min-w-0 rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3 text-[#6B6B6B]">
                      <SkeletonBox className="h-[18px] w-[18px] rounded-full" />
                      <SkeletonBox className="h-4 w-24" />
                    </div>
                    <SkeletonBox className="mt-4 h-8 w-12" />
                    <SkeletonBox className="mt-2 h-4 w-40" />
                  </div>
                ))}
              </section>

              <section className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                <SkeletonBox className="h-8 w-40" />

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="min-w-0 rounded-2xl bg-[#F7F4EE] p-4"
                    >
                      <SkeletonBox className="h-3 w-24" />
                      <SkeletonBox className="mt-2 h-5 w-40 max-w-full" />
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <SkeletonBox className="h-8 w-48" />
                    <SkeletonBox className="mt-2 h-4 w-72 max-w-full" />
                  </div>

                  <SkeletonBox className="h-12 w-32 rounded-2xl" />
                </div>

                <div className="mt-6 rounded-2xl bg-[#F7F4EE] p-5">
                  <div className="flex items-start gap-3">
                    <SkeletonBox className="mt-1 h-5 w-5 rounded-full" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <SkeletonBox className="h-3 w-24" />
                        <SkeletonBox className="h-6 w-16 rounded-full" />
                      </div>

                      <SkeletonBox className="mt-2 h-5 w-32" />
                      <SkeletonBox className="mt-2 h-4 w-80 max-w-full" />
                      <SkeletonBox className="mt-2 h-4 w-56" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  {[...Array(2)].map((_, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <SkeletonBox className="h-5 w-32" />
                            <SkeletonBox className="h-6 w-16 rounded-full" />
                          </div>

                          <SkeletonBox className="mt-2 h-4 w-40" />
                          <SkeletonBox className="mt-3 h-4 w-96 max-w-full" />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <SkeletonBox className="h-10 w-24 rounded-xl" />
                          <SkeletonBox className="h-10 w-20 rounded-xl" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                <SkeletonBox className="h-8 w-36" />
                <SkeletonBox className="mt-2 h-4 w-56" />

                <div className="mt-6 space-y-3">
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={index}
                      className="flex w-full items-center justify-between rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] px-5 py-4"
                    >
                      <div className="min-w-0">
                        <SkeletonBox className="h-5 w-28" />
                        <SkeletonBox className="mt-2 h-4 w-24" />
                      </div>
                      <SkeletonBox className="h-4 w-4 rounded-full" />
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                <SkeletonBox className="h-8 w-36" />

                <div className="mt-5 space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="min-w-0 rounded-2xl bg-[#F7F4EE] p-4"
                    >
                      <SkeletonBox className="h-3 w-24" />
                      <SkeletonBox className="mt-2 h-5 w-28" />
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                <SkeletonBox className="h-8 w-36" />
                <SkeletonBox className="mt-2 h-4 w-40" />
                <SkeletonBox className="mt-6 h-12 w-full rounded-2xl" />
              </section>

              <section className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <SkeletonBox className="h-5 w-5 rounded-full" />
                  <SkeletonBox className="h-8 w-36" />
                </div>

                <SkeletonBox className="mt-3 h-4 w-full" />
                <SkeletonBox className="mt-2 h-4 w-5/6" />
                <SkeletonBox className="mt-5 h-12 w-48 rounded-full" />
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [booksCount, setBooksCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);

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

      const [profileRes, booksRes, wishlistRes, addressesRes] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase
            .from("books")
            .select("*", { count: "exact", head: true })
            .eq("seller_id", user.id),
          supabase
            .from("wishlists")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("addresses")
            .select("*")
            .eq("user_id", user.id)
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: false }),
        ]);

      if (profileRes.error) console.error(profileRes.error);
      if (addressesRes.error) console.error(addressesRes.error);

      if (profileRes.data) setProfile(profileRes.data);
      setBooksCount(booksRes.count || 0);
      setWishlistCount(wishlistRes.count || 0);
      setAddresses(addressesRes.data || []);
      setLoading(false);
    };

    loadProfile();
  }, [router]);

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
    profile?.full_name ||
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    "BookBazaar User";

  const hasApprovedAdminAccess =
    profile?.is_admin === true && profile?.admin_status === "approved";

  const isMainAdmin = profile?.role === "admin";

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString()
    : "Recently joined";

  const formattedBirthDate = profile?.birth_date
    ? new Date(profile.birth_date).toLocaleDateString()
    : "Not provided";

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
      phone_number: profile?.phone_number || "",
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
      <main className="min-h-screen bg-[#F7F5F1]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E67E22]">
              Account
            </p>
            <h1 className="mt-2 text-4xl font-bold text-[#1F1F1F]">
              My Profile
            </h1>
            <p className="mt-2 text-[#6B6B6B]">
              View your account details, marketplace activity, and quick
              actions.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <section className="rounded-3xl border border-[#E5E0D8] bg-white p-8 shadow-sm">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex gap-5">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#F7F4EE] text-[#E67E22]">
                      <User size={32} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="max-w-[260px] break-words text-3xl font-bold leading-tight text-[#1F1F1F]">
                        {displayName}
                      </h2>

                      <div className="mt-3 flex flex-wrap gap-3">
                        {profile?.title && (
                          <span className="rounded-full bg-[#F7F4EE] px-3 py-1 text-xs font-semibold text-[#8A8175]">
                            {profile.title}
                          </span>
                        )}

                        {isMainAdmin ? (
                          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#E67E22]">
                            ADMIN
                          </span>
                        ) : profile?.is_admin &&
                          profile?.admin_status === "approved" ? (
                          <span className="rounded-full bg-[#1F1F1F] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                            APPROVED ADMIN
                          </span>
                        ) : (
                          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#E67E22]">
                            {profile?.role || "user"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-2xl bg-[#F7F4EE] px-4 py-3 text-sm text-[#6B6B6B]">
                    <div className="flex items-center gap-2">
                      <BadgeCheck size={16} className="text-[#E67E22]" />
                      <span>Joined {joinedDate}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 sm:grid-cols-2">
                <div className="min-w-0 rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 text-[#6B6B6B]">
                    <BookOpen size={18} />
                    <span className="text-sm font-medium">Books Listed</span>
                  </div>
                  <p className="mt-4 text-3xl font-bold text-[#1F1F1F]">
                    {booksCount}
                  </p>
                  <p className="mt-2 text-sm text-[#8A8175]">
                    Total books you posted on BookBazaar.
                  </p>
                </div>

                <div className="min-w-0 rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 text-[#6B6B6B]">
                    <Heart size={18} />
                    <span className="text-sm font-medium">Wishlist Saved</span>
                  </div>
                  <p className="mt-4 text-3xl font-bold text-[#1F1F1F]">
                    {wishlistCount}
                  </p>
                  <p className="mt-2 text-sm text-[#8A8175]">
                    Books saved for later.
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-[#1F1F1F]">
                  Personal Details
                </h3>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="min-w-0 rounded-2xl bg-[#F7F4EE] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                      Full Name
                    </p>
                    <p className="mt-2 break-words font-semibold text-[#1F1F1F]">
                      {displayName}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-2xl bg-[#F7F4EE] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                      Email
                    </p>
                    <div className="mt-2 flex min-w-0 items-start gap-2 text-[#1F1F1F]">
                      <Mail size={16} className="mt-1 shrink-0" />
                      <span className="min-w-0 break-all font-semibold">
                        {profile?.email || "Not provided"}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 rounded-2xl bg-[#F7F4EE] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                      Phone Number
                    </p>
                    <div className="mt-2 flex min-w-0 items-start gap-2 text-[#1F1F1F]">
                      <Phone size={16} className="mt-1 shrink-0" />
                      <span className="min-w-0 break-words font-semibold">
                        {profile?.phone_number || "Not provided"}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 rounded-2xl bg-[#F7F4EE] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                      Gender
                    </p>
                    <p className="mt-2 break-words font-semibold text-[#1F1F1F]">
                      {profile?.gender || "Not provided"}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-2xl bg-[#F7F4EE] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                      Birth Date
                    </p>
                    <div className="mt-2 flex min-w-0 items-start gap-2 text-[#1F1F1F]">
                      <CalendarDays size={16} className="mt-1 shrink-0" />
                      <span className="min-w-0 break-words font-semibold">
                        {formattedBirthDate}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 rounded-2xl bg-[#F7F4EE] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                      Account Role
                    </p>
                    <p className="mt-2 break-words font-semibold capitalize text-[#1F1F1F]">
                      {isMainAdmin
                        ? "Main Admin"
                        : profile?.is_admin &&
                            profile?.admin_status === "approved"
                          ? "Approved Admin"
                          : profile?.role || "user"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#1F1F1F]">
                      Address Information
                    </h3>
                    <p className="mt-1 text-sm text-[#6B6B6B]">
                      Add multiple delivery addresses and choose your default
                      one.
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
                  <div className="mt-6 rounded-2xl bg-[#F7F4EE] p-5">
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

                        <p className="mt-2 break-words leading-7 text-[#1F1F1F]">
                          {formatAddress(defaultAddress)}
                        </p>

                        <p className="mt-2 text-sm text-[#6B6B6B]">
                          Recipient:{" "}
                          {defaultAddress.recipient_name || displayName}
                          {" • "}
                          {defaultAddress.phone_number || "No phone"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!addresses.length ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-[#D9D2C7] bg-[#FCFBF8] p-6 text-center">
                    <p className="font-semibold text-[#1F1F1F]">
                      No saved addresses yet
                    </p>
                    <p className="mt-2 text-sm text-[#6B6B6B]">
                      Add your first address so buyers and deliveries can reach
                      you properly.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-5"
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

                            <p className="mt-2 text-sm font-medium text-[#6B6B6B]">
                              {address.recipient_name || displayName}
                              {address.phone_number
                                ? ` • ${address.phone_number}`
                                : ""}
                            </p>

                            <p className="mt-3 break-words leading-7 text-[#1F1F1F]">
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
            </div>

            <div className="space-y-8">
              <section className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-[#1F1F1F]">
                  Quick Actions
                </h3>
                <p className="mt-1 text-sm text-[#6B6B6B]">
                  Jump quickly to the sections you use most.
                </p>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => router.push("/my-listings")}
                    className="flex w-full items-center justify-between rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] px-5 py-4 text-left transition hover:bg-[#F7F4EE]"
                  >
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-[#1F1F1F]">
                        My Listings
                      </p>
                      <p className="text-sm text-[#6B6B6B]">
                        Manage your books
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-[#8A8175]"
                    />
                  </button>

                  <button
                    onClick={() => router.push("/wishlist")}
                    className="flex w-full items-center justify-between rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] px-5 py-4 text-left transition hover:bg-[#F7F4EE]"
                  >
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-[#1F1F1F]">
                        Wishlist
                      </p>
                      <p className="text-sm text-[#6B6B6B]">View saved books</p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-[#8A8175]"
                    />
                  </button>

                  <button
                    onClick={() => router.push("/orders")}
                    className="flex w-full items-center justify-between rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] px-5 py-4 text-left transition hover:bg-[#F7F4EE]"
                  >
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-[#1F1F1F]">
                        My Orders
                      </p>
                      <p className="text-sm text-[#6B6B6B]">
                        Track your purchases
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-[#8A8175]"
                    />
                  </button>

                  <button
                    onClick={() => router.push("/sell")}
                    className="flex w-full items-center justify-between rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] px-5 py-4 text-left transition hover:bg-[#F7F4EE]"
                  >
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-[#1F1F1F]">
                        Sell a Book
                      </p>
                      <p className="text-sm text-[#6B6B6B]">
                        Post a new listing
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-[#8A8175]"
                    />
                  </button>

                  {(isMainAdmin || hasApprovedAdminAccess) && (
                    <button
                      onClick={() => router.push("/admin")}
                      className="flex w-full items-center justify-between rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] px-5 py-4 text-left transition hover:bg-[#F7F4EE]"
                    >
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-[#1F1F1F]">
                          Admin Dashboard
                        </p>
                        <p className="text-sm text-[#6B6B6B]">
                          Platform overview
                        </p>
                      </div>
                      <ChevronRight
                        size={18}
                        className="shrink-0 text-[#8A8175]"
                      />
                    </button>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-[#1F1F1F]">
                  Account Status
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="min-w-0 rounded-2xl bg-[#F7F4EE] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                      Marketplace Status
                    </p>
                    <p className="mt-2 break-words font-semibold text-[#1F1F1F]">
                      Active
                    </p>
                  </div>

                  <div className="min-w-0 rounded-2xl bg-[#F7F4EE] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                      Selling Activity
                    </p>
                    <p className="mt-2 break-words font-semibold text-[#1F1F1F]">
                      {booksCount > 0 ? "Seller active" : "No listings yet"}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-2xl bg-[#F7F4EE] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                      Wishlist Activity
                    </p>
                    <p className="mt-2 break-words font-semibold text-[#1F1F1F]">
                      {wishlistCount > 0
                        ? "Wishlist active"
                        : "No saved books yet"}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-2xl bg-[#F7F4EE] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                      Admin Access Status
                    </p>
                    <p className="mt-2 break-words font-semibold text-[#1F1F1F] capitalize">
                      {isMainAdmin
                        ? "Main Admin"
                        : profile?.is_admin &&
                            profile?.admin_status === "approved"
                          ? "Approved Admin"
                          : profile?.admin_status || "none"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-[#1F1F1F]">
                  Account Actions
                </h3>
                <p className="mt-1 text-sm text-[#6B6B6B]">
                  Securely manage your session.
                </p>

                <button
                  onClick={handleLogout}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-300 px-5 py-3 font-semibold text-[#B94A48] transition hover:bg-[#FFF1F0]"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </section>

              {(isMainAdmin || hasApprovedAdminAccess) && (
                <section className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Shield className="text-[#E67E22]" size={20} />
                    <h3 className="text-xl font-bold text-[#1F1F1F]">
                      Admin Access
                    </h3>
                  </div>

                  <p className="mt-3 break-words text-sm leading-7 text-[#6B6B6B]">
                    {isMainAdmin
                      ? "You are the main administrator and can access all platform management tools."
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
                  style={{ color: "#1F1F1F", backgroundColor: "#FFFFFF" }}
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
                  style={{ color: "#1F1F1F", backgroundColor: "#FFFFFF" }}
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
