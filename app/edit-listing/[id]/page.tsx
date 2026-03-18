"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import {
  ArrowLeft,
  BookOpen,
  Image as ImageIcon,
  MapPin,
  PencilLine,
  Save,
  Tag,
  UserRound,
} from "lucide-react";

type Category = {
  id: number;
  name: string;
};

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

function EditListingPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 text-[#1F1F1F] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <SkeletonBox className="h-10 w-44 rounded-full" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-[#E5E0D8] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <SkeletonBox className="mb-3 h-8 w-36 rounded-full" />
              <SkeletonBox className="h-10 w-48" />
              <SkeletonBox className="mt-3 h-4 w-5/6" />
              <SkeletonBox className="mt-2 h-4 w-2/3" />
            </div>

            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <SkeletonBox className="mb-2 h-4 w-24" />
                  <SkeletonBox className="h-12 w-full rounded-2xl" />
                </div>
                <div>
                  <SkeletonBox className="mb-2 h-4 w-20" />
                  <SkeletonBox className="h-12 w-full rounded-2xl" />
                </div>
              </div>

              <div>
                <SkeletonBox className="mb-2 h-4 w-24" />
                <SkeletonBox className="h-32 w-full rounded-2xl" />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <SkeletonBox className="mb-2 h-4 w-16" />
                  <SkeletonBox className="h-12 w-full rounded-2xl" />
                </div>
                <div>
                  <SkeletonBox className="mb-2 h-4 w-20" />
                  <SkeletonBox className="h-12 w-full rounded-2xl" />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <SkeletonBox className="mb-2 h-4 w-20" />
                  <SkeletonBox className="h-12 w-full rounded-2xl" />
                </div>
                <div>
                  <SkeletonBox className="mb-2 h-4 w-20" />
                  <SkeletonBox className="h-12 w-full rounded-2xl" />
                </div>
              </div>

              <div>
                <SkeletonBox className="mb-2 h-4 w-24" />
                <SkeletonBox className="h-12 w-full rounded-2xl" />
              </div>

              <div className="flex flex-col gap-3 border-t border-[#E5E0D8] pt-4 sm:flex-row">
                <SkeletonBox className="h-12 w-full rounded-2xl sm:w-28" />
                <SkeletonBox className="h-12 w-full rounded-2xl sm:w-40" />
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-[#E5E0D8] bg-white shadow-sm">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F7F4EE] p-4">
                <SkeletonBox className="h-full w-full rounded-2xl" />
              </div>

              <div className="space-y-3 p-5">
                <div>
                  <SkeletonBox className="h-7 w-3/4" />
                  <SkeletonBox className="mt-2 h-4 w-1/2" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <SkeletonBox className="h-7 w-24 rounded-full" />
                  <SkeletonBox className="h-7 w-20 rounded-full" />
                </div>

                <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <SkeletonBox className="h-4 w-12" />
                    <SkeletonBox className="h-6 w-16" />
                  </div>

                  <div className="flex items-center gap-2">
                    <SkeletonBox className="h-4 w-4 rounded-full" />
                    <SkeletonBox className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#E5E0D8] bg-white p-5 shadow-sm">
              <SkeletonBox className="h-4 w-24" />
              <div className="mt-4 space-y-3">
                <SkeletonBox className="h-4 w-full" />
                <SkeletonBox className="h-4 w-5/6" />
                <SkeletonBox className="h-4 w-4/5" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: categoryData } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (categoryData) {
        setCategories(categoryData);
      }

      const { data: book, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !book) {
        showToast({
          title: "Listing not found",
          message: "This listing does not exist or was removed.",
          type: "error",
        });
        router.push("/my-listings");
        return;
      }

      setTitle(book.title || "");
      setAuthor(book.author || "");
      setDescription(book.description || "");
      setPrice(String(book.price || ""));
      setCondition(book.condition || "");
      setLocation(book.location || "");
      setImageUrl(book.image_url || "");
      setCategoryId(String(book.category_id || ""));
      setLoading(false);
    };

    fetchData();
  }, [id, router, showToast]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("books")
      .update({
        title,
        author,
        description,
        price: Number(price),
        condition,
        location,
        image_url: imageUrl,
        category_id: Number(categoryId),
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      showToast({
        title: "Update failed",
        message: error.message,
        type: "error",
      });
      return;
    }

    showToast({
      title: "Listing updated",
      message: "Your listing has been successfully updated.",
      type: "success",
    });
    router.push("/my-listings");
  };

  const selectedCategory = useMemo(() => {
    return (
      categories.find((category) => String(category.id) === categoryId)?.name ||
      "No category"
    );
  }, [categories, categoryId]);

  if (loading) {
    return <EditListingPageSkeleton />;
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 text-[#1F1F1F] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={async () => {
            const confirmed = await confirm({
              title: "Discard Changes?",
              message:
                "You have unsaved changes. Are you sure you want to leave without saving?",
              confirmText: "Discard",
              cancelText: "Stay",
              danger: true,
            });

            if (!confirmed) return;

            router.push("/my-listings");
          }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D9D1C6] bg-white px-4 py-2 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
        >
          <ArrowLeft size={16} />
          Back to My Listings
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-[#E5E0D8] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#E67E22]/20 bg-[#FFF7EF] px-3 py-1 text-xs font-medium text-[#E67E22]">
                <PencilLine size={14} />
                Seller Dashboard
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#1F1F1F] sm:text-3xl">
                Edit Listing
              </h1>
              <p className="mt-2 text-sm text-[#6B6B6B]">
                Update your book details and keep your listing clean, accurate,
                and attractive.
              </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Book Title"
                  icon={<BookOpen size={16} />}
                  placeholder="Enter book title"
                  value={title}
                  onChange={setTitle}
                  required
                />

                <InputField
                  label="Author"
                  icon={<UserRound size={16} />}
                  placeholder="Enter author name"
                  value={author}
                  onChange={setAuthor}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1F1F1F]">
                  Description
                </label>
                <textarea
                  placeholder="Write a short and clear description of the book..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-[#DED8CF] bg-[#FFFDF9] px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#8A8175] focus:border-[#E67E22] focus:ring-2 focus:ring-[#E67E22]/20"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Price"
                  icon={<Tag size={16} />}
                  type="number"
                  placeholder="Enter price"
                  value={price}
                  onChange={setPrice}
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1F1F1F]">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-2xl border border-[#DED8CF] bg-[#FFFDF9] px-4 py-3 text-sm text-[#1F1F1F] outline-none transition focus:border-[#E67E22] focus:ring-2 focus:ring-[#E67E22]/20"
                    required
                  >
                    <option value="" className="bg-white text-[#1F1F1F]">
                      Select category
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                        className="bg-white text-[#1F1F1F]"
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Condition"
                  icon={<Tag size={16} />}
                  placeholder="Example: New, Used - Good"
                  value={condition}
                  onChange={setCondition}
                  required
                />

                <InputField
                  label="Location"
                  icon={<MapPin size={16} />}
                  placeholder="Enter meetup location"
                  value={location}
                  onChange={setLocation}
                  required
                />
              </div>

              <InputField
                label="Image URL"
                icon={<ImageIcon size={16} />}
                placeholder="Paste image URL"
                value={imageUrl}
                onChange={setImageUrl}
              />

              <div className="flex flex-col gap-3 border-t border-[#E5E0D8] pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: "Discard Changes?",
                      message:
                        "You have unsaved changes. Are you sure you want to leave without saving?",
                      confirmText: "Discard",
                      cancelText: "Stay",
                      danger: true,
                    });

                    if (!confirmed) return;

                    router.push("/my-listings");
                  }}
                  className="w-full rounded-2xl border border-[#D9D1C6] bg-white px-5 py-3 text-sm font-medium text-[#1F1F1F] transition hover:bg-[#F7F4EE] sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E67E22] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#cf6f1c] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Update Listing"}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-[#E5E0D8] bg-white shadow-sm">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F7F4EE]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title || "Book cover preview"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#8A8175]">
                    <div className="text-center">
                      <ImageIcon size={34} className="mx-auto mb-3" />
                      <p className="text-sm">Book cover preview</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 p-5">
                <div>
                  <p className="line-clamp-2 text-xl font-semibold text-[#1F1F1F]">
                    {title || "Untitled Book"}
                  </p>
                  <p className="mt-1 text-sm text-[#6B6B6B]">
                    {author || "Unknown Author"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#E5E0D8] bg-[#FFFDF9] px-3 py-1 text-xs text-[#6B6B6B]">
                    {selectedCategory}
                  </span>
                  {condition && (
                    <span className="rounded-full border border-[#E5E0D8] bg-[#FFFDF9] px-3 py-1 text-xs text-[#6B6B6B]">
                      {condition}
                    </span>
                  )}
                </div>

                <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-[#6B6B6B]">Price</span>
                    <span className="text-lg font-bold text-[#E67E22]">
                      ₱{price || "0"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                    <MapPin size={15} className="text-[#E67E22]" />
                    {location || "No location yet"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#E5E0D8] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8A8175]">
                Editing Tips
              </h2>
              <div className="mt-4 space-y-3 text-sm text-[#6B6B6B]">
                <p>Use a clear title so buyers can find your listing faster.</p>
                <p>Keep the description short, honest, and easy to read.</p>
                <p>
                  Add a good image link to make your book look more attractive.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  required?: boolean;
};

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  required = false,
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#1F1F1F]">
        {icon && <span className="text-[#E67E22]">{icon}</span>}
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[#DED8CF] bg-[#FFFDF9] px-4 py-3 text-sm text-[#1F1F1F] outline-none transition placeholder:text-[#8A8175] focus:border-[#E67E22] focus:ring-2 focus:ring-[#E67E22]/20"
        required={required}
      />
    </div>
  );
}
