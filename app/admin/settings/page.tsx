"use client";

import AdminDashboardSkeleton from "@/components/AdminDashboardSkeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Settings, Percent, Truck, Shield, Save, Bell } from "lucide-react";

type SettingsState = {
  commission_rate: number;
  standard_delivery_fee: number;
  express_delivery_fee: number;
  meet_up_fee: number;
  admin_note: string;
  notifications_enabled: boolean;
};

const DEFAULT_SETTINGS: SettingsState = {
  commission_rate: 4,
  standard_delivery_fee: 80,
  express_delivery_fee: 150,
  meet_up_fee: 0,
  admin_note: "",
  notifications_enabled: true,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from("admin_settings")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Failed to load settings:", error);
        }

        if (data) {
          setSettings({
            commission_rate: data.commission_rate ?? 4,
            standard_delivery_fee: data.standard_delivery_fee ?? 80,
            express_delivery_fee: data.express_delivery_fee ?? 150,
            meet_up_fee: data.meet_up_fee ?? 0,
            admin_note: data.admin_note ?? "",
            notifications_enabled: data.notifications_enabled ?? true,
          });
        }
      } catch (error) {
        console.error("Settings load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "admin_note"
            ? value
            : Number(value),
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const payload = {
        id: 1,
        commission_rate: settings.commission_rate,
        standard_delivery_fee: settings.standard_delivery_fee,
        express_delivery_fee: settings.express_delivery_fee,
        meet_up_fee: settings.meet_up_fee,
        admin_note: settings.admin_note,
        notifications_enabled: settings.notifications_enabled,
      };

      const { error } = await supabase
        .from("admin_settings")
        .upsert(payload, { onConflict: "id" });

      if (error) {
        console.error("Failed to save settings:", error);
      }
    } catch (error) {
      console.error("Settings save error:", error);
    } finally {
      setSaving(false);
    }
  };

if (loading) {
  return <AdminDashboardSkeleton type="settings" />;
}

  return (
    <main className="ml-[240px] min-h-screen bg-[#181614] p-6 text-[#F7F5F1]">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#FFFDF9]">
            Settings
          </h1>
          <p className="mt-2 text-sm text-[#9A9187]">
            Configure BookBazaar platform rules and admin preferences.
          </p>
        </div>

        {/* Summary Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Commission Rate"
            value={`${settings.commission_rate}%`}
            icon={Percent}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
          <SummaryCard
            title="Standard Delivery"
            value={`₱${settings.standard_delivery_fee}`}
            icon={Truck}
            tone="text-blue-400 bg-blue-500/10"
          />
          <SummaryCard
            title="Express Delivery"
            value={`₱${settings.express_delivery_fee}`}
            icon={Truck}
            tone="text-green-400 bg-green-500/10"
          />
          <SummaryCard
            title="Notifications"
            value={settings.notifications_enabled ? "Enabled" : "Disabled"}
            icon={Bell}
            tone="text-[#F5A65B] bg-[#E67E22]/10"
          />
        </section>

        {/* Settings Form */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-6">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-[#FFFDF9]">
                Platform Settings
              </h3>
              <p className="text-sm text-[#9A9187]">
                Manage commission and delivery defaults.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Commission Rate (%)"
                name="commission_rate"
                value={settings.commission_rate}
                onChange={handleChange}
              />

              <Field
                label="Standard Delivery Fee"
                name="standard_delivery_fee"
                value={settings.standard_delivery_fee}
                onChange={handleChange}
              />

              <Field
                label="Express Delivery Fee"
                name="express_delivery_fee"
                value={settings.express_delivery_fee}
                onChange={handleChange}
              />

              <Field
                label="Meet-up / Pick-up Fee"
                name="meet_up_fee"
                value={settings.meet_up_fee}
                onChange={handleChange}
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-[#D6CEC4]">
                Admin Note
              </label>
              <textarea
                name="admin_note"
                value={settings.admin_note}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-2xl border border-[#312B26] bg-[#181614] px-4 py-3 text-sm text-[#F7F5F1] outline-none placeholder:text-[#8E857B] focus:border-[#E67E22]"
                placeholder="Write internal admin notes or reminders..."
              />
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#2A2622] bg-[#181614] px-4 py-4">
              <input
                id="notifications_enabled"
                type="checkbox"
                name="notifications_enabled"
                checked={settings.notifications_enabled}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <label
                htmlFor="notifications_enabled"
                className="text-sm text-[#D6CEC4]"
              >
                Enable admin notifications
              </label>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E67E22] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>

          <div className="space-y-6">
            <InfoPanel
              icon={Settings}
              title="Settings Overview"
              text="These values represent your default platform rules. Update them carefully to match how BookBazaar should behave for sellers and buyers."
            />

            <InfoPanel
              icon={Shield}
              title="Admin Reminder"
              text="Changes here affect the system defaults. If your checkout page still uses hardcoded values, those pages should also be updated to read from admin settings later."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number }>;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#9A9187]">{title}</p>
          <h2 className="mt-2 text-2xl font-bold text-[#FFFDF9]">{value}</h2>
        </div>

        <div className={`rounded-xl p-3 ${tone}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#D6CEC4]">
        {label}
      </label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-[#312B26] bg-[#181614] px-4 py-3 text-sm text-[#F7F5F1] outline-none focus:border-[#E67E22]"
      />
    </div>
  );
}

function InfoPanel({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#E67E22]/10 p-3 text-[#E67E22]">
          <Icon size={18} />
        </div>
        <h3 className="font-semibold text-[#FFFDF9]">{title}</h3>
      </div>

      <p className="mt-4 text-sm leading-7 text-[#D6CEC4]">{text}</p>
    </div>
  );
}
