"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import {
  LogOut,
  Mail,
  User,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ShoppingBag,
  Phone,
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
  phone_number: string;
  birth_date: string;
  gender: string;
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
    <main className="min-h-screen bg-[#F7F4EE] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1180px]">
        <section className="rounded-[32px] border border-[#E5E0D8] bg-white p-6 sm:p-8 lg:p-10">
          <SkeletonBox className="h-5 w-28 rounded-full" />
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <SkeletonBox className="h-20 w-20 rounded-full" />
              <div>
                <SkeletonBox className="h-10 w-72 max-w-full" />
                <div className="mt-3 flex gap-2">
                  <SkeletonBox className="h-7 w-28 rounded-full" />
                  <SkeletonBox className="h-7 w-32 rounded-full" />
                </div>
              </div>
            </div>
            <SkeletonBox className="h-11 w-44 rounded-full" />
          </div>
          <SkeletonBox className="mt-5 h-5 w-96 max-w-full" />
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_380px]">
          <section className="rounded-[28px] border border-[#E5E0D8] bg-white p-6 sm:p-7">
            <SkeletonBox className="h-8 w-56" />
            <div className="mt-6 space-y-8">
              <div>
                <SkeletonBox className="h-6 w-32" />
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="mt-2 h-12 w-full" />
                  </div>
                  <div>
                    <SkeletonBox className="h-4 w-20" />
                    <SkeletonBox className="mt-2 h-12 w-full" />
                  </div>
                  <div>
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="mt-2 h-12 w-full" />
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-[#EEE6DB]" />

              <div>
                <SkeletonBox className="h-6 w-36" />
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <SkeletonBox className="h-4 w-28" />
                    <SkeletonBox className="mt-2 h-12 w-full" />
                  </div>
                  <div>
                    <SkeletonBox className="h-4 w-24" />
                    <SkeletonBox className="mt-2 h-12 w-full" />
                  </div>
                  <div className="md:col-span-2">
                    <SkeletonBox className="h-4 w-16" />
                    <SkeletonBox className="mt-2 h-12 w-full" />
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-[#EEE6DB]" />

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <SkeletonBox className="h-6 w-40" />
                    <SkeletonBox className="mt-2 h-4 w-48" />
                  </div>
                  <SkeletonBox className="h-11 w-24 rounded-2xl" />
                </div>

                <div className="mt-5 space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4"
                    >
                      <SkeletonBox className="h-5 w-32" />
                      <SkeletonBox className="mt-3 h-4 w-52" />
                      <SkeletonBox className="mt-2 h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <SkeletonBox className="h-12 w-40 rounded-2xl" />
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-6">
              <SkeletonBox className="h-8 w-44" />
              <div className="mt-5 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <SkeletonBox key={i} className="h-20 w-full rounded-2xl" />
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-6">
              <SkeletonBox className="h-8 w-44" />
              <SkeletonBox className="mt-2 h-4 w-40" />
              <SkeletonBox className="mt-5 h-11 w-28 rounded-full" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const supabase = createSupabaseBrowser();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: "",
    phone_number: "",
    birth_date: "",
    gender: "",
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
  const readonlyClass =
    "flex min-h-[50px] items-center gap-2 rounded-2xl border border-[#D9D2C7] bg-[#F7F4EE] px-4 py-3 text-[#6B6B6B]";

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

      const [profileRes, addressesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
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
          phone_number: profileData.phone_number || "",
          birth_date: profileData.birth_date || "",
          gender: profileData.gender || "",
        });
      }

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
    profileForm.full_name.trim() ||
    profile?.full_name ||
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    "BookBazaar User";

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

  const handleProfileInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveProfile = async () => {
    if (!userId) return;

    const normalizedFullName = profileForm.full_name.trim() || null;

    if (!normalizedFullName) {
      showToast({
        title: "Name required",
        message: "Please enter your full name.",
        type: "error",
      });
      return;
    }

    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: normalizedFullName,
          phone_number: profileForm.phone_number.trim() || null,
          birth_date: profileForm.birth_date || null,
          gender: profileForm.gender || null,
        })
        .eq("id", userId);

      if (error) throw error;

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: normalizedFullName,
              phone_number: profileForm.phone_number.trim() || null,
              birth_date: profileForm.birth_date || null,
              gender: profileForm.gender || null,
            }
          : prev,
      );

      setProfileForm((prev) => ({
        ...prev,
        full_name: normalizedFullName || "",
      }));

      showToast({
        title: "Profile updated",
        message: "Your personal profile was saved successfully.",
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
      <main className="min-h-screen bg-[#F7F4EE] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <section className="relative overflow-hidden rounded-[32px] border border-[#E5E0D8] bg-white p-6 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#FFF3E7] blur-3xl" />

            <div className="relative z-10">
              <p className="inline-flex rounded-full bg-[#FFF3E7] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#C96A16]">
                Personal Profile
              </p>

              <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF3E7] text-[#E67E22]">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={30} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h1 className="break-words text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl">
                      {displayName}
                    </h1>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#F7F4EE] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1F1F1F]">
                        User Account
                      </span>
                      <span className="rounded-full bg-[#F7F4EE] px-3 py-1 text-xs font-semibold text-[#6B6B6B]">
                        Joined {joinedDate}
                      </span>
                      {profileForm.gender && (
                        <span className="rounded-full bg-[#F7F4EE] px-3 py-1 text-xs font-semibold text-[#6B6B6B]">
                          {profileForm.gender}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Link
                  href="/seller-profile"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-4 py-2.5 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
                >
                  <ShoppingBag size={14} />
                  Open Seller Profile
                </Link>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5F5A52] sm:text-base">
                Manage your account details, buyer information, and delivery
                addresses here.
              </p>
            </div>
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_380px]">
            <section className="rounded-[28px] border border-[#E5E0D8] bg-white p-6 sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <User className="text-[#E67E22]" size={20} />
                <h2 className="text-2xl font-bold text-[#1F1F1F]">
                  Personal Information
                </h2>
              </div>

              <div className="grid gap-8">
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#1F1F1F]">
                      Basic Identity
                    </h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Field label="Full Name">
                        <input
                          name="full_name"
                          value={profileForm.full_name}
                          onChange={handleProfileInput}
                          placeholder="Full name shown on your account"
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <Field label="Gender">
                      <select
                        name="gender"
                        value={profileForm.gender}
                        onChange={handleProfileInput}
                        className={selectClass}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Prefer not to say">
                          Prefer not to say
                        </option>
                      </select>
                    </Field>

                    <Field label="Birth Date">
                      <input
                        type="date"
                        name="birth_date"
                        value={profileForm.birth_date}
                        onChange={handleProfileInput}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>

                <div className="h-px w-full bg-[#EEE6DB]" />

                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#1F1F1F]">
                      Contact Details
                    </h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Phone Number">
                      <input
                        name="phone_number"
                        value={profileForm.phone_number}
                        onChange={handleProfileInput}
                        placeholder="09xxxxxxxxx"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Account Type">
                      <div className={readonlyClass}>
                        <span>Buyer / User</span>
                      </div>
                    </Field>

                    <div className="md:col-span-2">
                      <Field label="Email">
                        <div className={readonlyClass}>
                          <Mail size={16} className="shrink-0" />
                          <span className="min-w-0 break-all">
                            {profile?.email || "Not provided"}
                          </span>
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-[#EEE6DB]" />

                <div>
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#1F1F1F]">
                        Saved Addresses
                      </h3>
                      <p className="mt-1 text-sm text-[#5F5A52]">
                        Manage your delivery addresses
                      </p>
                    </div>

                    <button
                      onClick={openAddAddressModal}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#E67E22] px-4 py-3 font-semibold text-white transition hover:bg-[#cf6f1c]"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>

                  {defaultAddress && (
                    <div className="mb-4 rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4">
                      <div className="flex items-start gap-3">
                        <MapPin
                          size={18}
                          className="mt-1 shrink-0 text-[#E67E22]"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-[#1F1F1F]">
                              {defaultAddress.label || "Primary Address"}
                            </p>
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-700">
                              Default
                            </span>
                          </div>

                          <p className="mt-2 text-sm font-medium text-[#1F1F1F]">
                            {defaultAddress.recipient_name || displayName}
                          </p>
                          <p className="mt-1 text-sm text-[#6B6B6B]">
                            {formatAddress(defaultAddress)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!addresses.length ? (
                    <div className="rounded-2xl border border-dashed border-[#D9D2C7] bg-[#FCFBF8] p-6 text-center">
                      <p className="font-semibold text-[#1F1F1F]">
                        No saved addresses yet
                      </p>
                      <p className="mt-2 text-sm text-[#6B6B6B]">
                        Add your first address for faster checkout and delivery
                        setup.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4"
                        >
                          <div className="flex flex-col gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-[#1F1F1F]">
                                  {address.label || "Saved Address"}
                                </p>

                                {address.is_default && (
                                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-700">
                                    Default
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 text-sm font-medium text-[#1F1F1F]">
                                {address.recipient_name || displayName}
                              </p>
                              <p className="mt-1 text-sm text-[#6B6B6B]">
                                {address.phone_number || "No phone"}
                              </p>
                              <p className="mt-2 text-sm leading-7 text-[#1F1F1F]">
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
                </div>
              </div>

              <div className="mt-8 flex justify-end">
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

            <section className="space-y-6">
              <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-6">
                <h2 className="text-2xl font-bold text-[#1F1F1F]">
                  Account Summary
                </h2>

                <div className="mt-5 space-y-3">
                  <SummaryRow
                    icon={User}
                    label="Display Name"
                    value={displayName}
                  />
                  <SummaryRow
                    icon={Phone}
                    label="Phone"
                    value={profileForm.phone_number || "Not set"}
                  />
                  <SummaryRow
                    icon={MapPin}
                    label="Default Address"
                    value={
                      defaultAddress
                        ? formatAddress(defaultAddress)
                        : "No saved address"
                    }
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-6">
                <h2 className="text-2xl font-bold text-[#1F1F1F]">
                  Account Actions
                </h2>
                <p className="mt-1 text-sm text-[#5F5A52]">
                  Manage your session securely
                </p>

                <button
                  onClick={handleLogout}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#E5E0D8] bg-white px-4 py-2.5 text-sm font-semibold text-[#7A6F61] transition hover:bg-[#F7F4EE]"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            </section>
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
              <Field label="Address Label">
                <input
                  name="label"
                  value={addressForm.label}
                  onChange={handleAddressInput}
                  placeholder="Home, Dorm, Office"
                  className={inputClass}
                />
              </Field>

              <Field label="Recipient Name *">
                <input
                  name="recipient_name"
                  value={addressForm.recipient_name}
                  onChange={handleAddressInput}
                  placeholder="Full name"
                  className={inputClass}
                />
              </Field>

              <Field label="Phone Number *">
                <input
                  name="phone_number"
                  value={addressForm.phone_number}
                  onChange={handleAddressInput}
                  placeholder="09xxxxxxxxx"
                  className={inputClass}
                />
              </Field>

              <Field label="Country *">
                <input
                  name="country"
                  value={addressForm.country}
                  onChange={handleAddressInput}
                  className={inputClass}
                  required
                  readOnly
                />
              </Field>

              <Field label="Province *">
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
              </Field>

              <Field label="City / Municipality *">
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
              </Field>

              <Field label="Barangay *">
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
              </Field>

              <Field label="Unit / House No.">
                <input
                  name="unit_number"
                  value={addressForm.unit_number}
                  onChange={handleAddressInput}
                  placeholder="Unit 3, Block 2"
                  className={inputClass}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Street Address *">
                  <textarea
                    name="street_address"
                    value={addressForm.street_address}
                    onChange={handleAddressInput}
                    placeholder="Street, subdivision, landmark"
                    rows={3}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Postal Code">
                <input
                  name="postal_code"
                  value={addressForm.postal_code}
                  onChange={handleAddressInput}
                  placeholder="8000"
                  className={inputClass}
                />
              </Field>

              <Field label="Default Address">
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
              </Field>
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

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E0D8] bg-[#F7F4EE] p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[#FFF3E7] p-2 text-[#E67E22]">
          <Icon size={16} />
        </div>

        <div className="min-w-0">
          <p className="text-sm text-[#8A8175]">{label}</p>
          <p className="mt-1 break-words text-sm font-semibold text-[#1F1F1F]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
