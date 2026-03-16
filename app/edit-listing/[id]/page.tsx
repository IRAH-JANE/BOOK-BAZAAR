"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
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
import PageLoader from "@/components/PageLoader";

type Category = {
  id: number;
  name: string;
};

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

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
        alert("Listing not found.");
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
  }, [id, router]);

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
      alert(error.message);
      return;
    }

    alert("Listing updated successfully.");
    router.push("/my-listings");
  };

  const selectedCategory = useMemo(() => {
    return (
      categories.find((category) => String(category.id) === categoryId)?.name ||
      "No category"
    );
  }, [categories, categoryId]);

  if (loading) {
    return (
      <PageLoader
        title="Loading listing editor..."
        subtitle="Please wait while we load your book details."
      />
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => router.push("/my-listings")}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-[#f28c28] hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to My Listings
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] sm:p-7">
            <div className="mb-6">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#f28c28]/20 bg-[#f28c28]/10 px-3 py-1 text-xs font-medium text-[#f28c28]">
                <PencilLine size={14} />
                Seller Dashboard
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Edit Listing
              </h1>
              <p className="mt-2 text-sm text-white/60">
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
                <label className="mb-2 block text-sm font-medium text-white/85">
                  Description
                </label>
                <textarea
                  placeholder="Write a short and clear description of the book..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#f28c28] focus:ring-2 focus:ring-[#f28c28]/20"
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
                  <label className="mb-2 block text-sm font-medium text-white/85">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f28c28] focus:ring-2 focus:ring-[#f28c28]/20"
                    required
                  >
                    <option value="" className="bg-black text-white">
                      Select category
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                        className="bg-black text-white"
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

              <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => router.push("/my-listings")}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f28c28] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Update Listing"}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b]">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-white/5">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title || "Book cover preview"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/35">
                    <div className="text-center">
                      <ImageIcon size={34} className="mx-auto mb-3" />
                      <p className="text-sm">Book cover preview</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 p-5">
                <div>
                  <p className="line-clamp-2 text-xl font-semibold">
                    {title || "Untitled Book"}
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    {author || "Unknown Author"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                    {selectedCategory}
                  </span>
                  {condition && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                      {condition}
                    </span>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-white/60">Price</span>
                    <span className="text-lg font-bold text-[#f28c28]">
                      ₱{price || "0"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <MapPin size={15} className="text-[#f28c28]" />
                    {location || "No location yet"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">
                Editing Tips
              </h2>
              <div className="mt-4 space-y-3 text-sm text-white/65">
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
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white/85">
        {icon && <span className="text-[#f28c28]">{icon}</span>}
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#f28c28] focus:ring-2 focus:ring-[#f28c28]/20"
        required={required}
      />
    </div>
  );
}
