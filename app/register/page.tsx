"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";

type PSGCItem = {
  code: string;
  name: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    title: "",
    birth_date: "",
    gender: "",
    phone_number: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "Philippines",
    province: "",
    city: "",
    barangay: "",
    street_address: "",
    unit_number: "",
    postal_code: "",
  });

  const [loading, setLoading] = useState(false);

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
    "w-full rounded-xl border border-[#DED8CF] bg-white px-4 py-3 text-[17px] text-[#6F6A63] placeholder:text-[#8A8175] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]";

  const selectClass =
    "w-full rounded-xl border border-[#DED8CF] bg-white px-4 py-3 text-[17px] text-[#6F6A63] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22] disabled:cursor-not-allowed disabled:bg-[#F5F1EB]";

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

  const titleOptions = useMemo(() => ["Mr.", "Ms.", "Mrs.", "Mx."], []);
  const genderOptions = useMemo(
    () => ["Female", "Male", "Prefer not to say"],
    [],
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked =
      e.target instanceof HTMLInputElement ? e.target.checked : false;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleProvinceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = e.target.value;
    const province = provinces.find((p) => p.code === provinceCode);

    setSelectedProvinceCode(provinceCode);
    setSelectedCityCode("");
    setSelectedBarangayCode("");

    setForm((prev) => ({
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

    setForm((prev) => ({
      ...prev,
      city: city?.name ?? "",
      barangay: "",
    }));
  };

  const handleBarangaySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const barangayCode = e.target.value;
    const barangay = barangays.find((b) => b.code === barangayCode);

    setSelectedBarangayCode(barangayCode);

    setForm((prev) => ({
      ...prev,
      barangay: barangay?.name ?? "",
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      showToast({
        title: "Password mismatch",
        message: "Passwords do not match.",
        type: "error",
      });
      return;
    }

    if (form.password.length < 6) {
      showToast({
        title: "Weak password",
        message: "Password must be at least 6 characters.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    const full_name = `${form.first_name} ${form.last_name}`.trim();

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          title: form.title || null,
          birth_date: form.birth_date || null,
          gender: form.gender || null,
          phone_number: form.phone_number.trim(),
          country: form.country.trim(),
          province: form.province.trim(),
          city: form.city.trim(),
          barangay: form.barangay.trim(),
          street_address: form.street_address.trim(),
          unit_number: form.unit_number.trim() || null,
          postal_code: form.postal_code.trim(),
          role: "user",
        },
      },
    });

    setLoading(false);

    if (error) {
      showToast({
        title: "Registration failed",
        message: error.message,
        type: "error",
      });
      return;
    }

    const hasSession = !!data.session;

    if (hasSession) {
      showToast({
        title: "Registration successful",
        message: "Your account has been created successfully.",
        type: "success",
      });
      router.push("/");
      router.refresh();
      return;
    }

    showToast({
      title: "Registration successful",
      message: "Check your email for verification.",
      type: "success",
    });
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[#E5E0D8] bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-[#1F1F1F]">
          Create New Account
        </h1>
        <p className="mt-3 text-base text-[#6B6B6B]">
          Fill in your personal and address information to register.
        </p>

        <form onSubmit={handleRegister} className="mt-10 space-y-10">
          <section>
            <h2 className="mb-5 text-2xl font-semibold text-[#1F1F1F]">
              Personal Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="first_name"
                placeholder="First Name"
                value={form.first_name}
                onChange={handleChange}
                className={inputClass}
                required
              />

              <input
                name="last_name"
                placeholder="Last Name"
                value={form.last_name}
                onChange={handleChange}
                className={inputClass}
                required
              />

              <select
                name="title"
                value={form.title}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Title (optional)</option>
                {titleOptions.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>

              <input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                className={inputClass}
                required
              />

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Gender (optional)</option>
                {genderOptions.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>

              <input
                name="phone_number"
                placeholder="Phone Number"
                value={form.phone_number}
                onChange={handleChange}
                className={inputClass}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className={`${inputClass} md:col-span-2`}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className={inputClass}
                required
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-2xl font-semibold text-[#1F1F1F]">
              Address Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                className={inputClass}
                required
              />

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

              <input
                name="street_address"
                placeholder="Street Address"
                value={form.street_address}
                onChange={handleChange}
                className={`${inputClass} md:col-span-2`}
                required
              />

              <input
                name="unit_number"
                placeholder="Unit No. / St. No. / Lot No. (optional)"
                value={form.unit_number}
                onChange={handleChange}
                className={inputClass}
              />

              <input
                name="postal_code"
                placeholder="Postal Code"
                value={form.postal_code}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#E67E22] px-6 py-3 font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B6B6B]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#E67E22] hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </main>
  );
}
