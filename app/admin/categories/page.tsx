"use client";

import AdminDashboardSkeleton from "@/components/AdminDashboardSkeleton";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Tags,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";

type Category = {
  id: number;
  name: string;
};

type Book = {
  id: number;
  category_id: number | null;
};

function HoverText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <div
      title={text}
      className={`truncate transition-all duration-200 hover:text-[#FFFDF9] ${className}`}
    >
      {text}
    </div>
  );
}

function sortCategoriesAlphabetically(categories: Category[]) {
  return [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryMessage, setCategoryMessage] = useState<{
    type: "success" | "error" | "";
    text: string;
  }>({ type: "", text: "" });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const [catRes, bookRes] = await Promise.all([
          supabase
            .from("categories")
            .select("*")
            .order("name", { ascending: true }),
          supabase.from("books").select("id, category_id"),
        ]);

        if (catRes.error) {
          console.error("Failed to load categories:", catRes.error);
        } else {
          setCategories(sortCategoriesAlphabetically(catRes.data || []));
        }

        if (bookRes.error) {
          console.error("Failed to load books:", bookRes.error);
        } else {
          setBooks(bookRes.data || []);
        }
      } catch (error) {
        console.error("Failed to load categories page:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const categoryCountMap = useMemo(() => {
    const map: Record<number, number> = {};

    books.forEach((book) => {
      if (!book.category_id) return;
      map[book.category_id] = (map[book.category_id] || 0) + 1;
    });

    return map;
  }, [books]);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const baseList = sortCategoriesAlphabetically(categories);

    if (!keyword) return baseList;

    return baseList.filter((category) =>
      category.name.toLowerCase().includes(keyword),
    );
  }, [categories, search]);

  const totalCategories = categories.length;
  const categorizedBooks = books.filter((book) => book.category_id).length;
  const uncategorizedBooks = books.filter((book) => !book.category_id).length;

  const addCategory = async () => {
    const name = newCategory.trim();

    if (!name) {
      setCategoryMessage({
        type: "error",
        text: "Please enter a category name.",
      });
      return;
    }

    const alreadyExists = categories.some(
      (category) => category.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (alreadyExists) {
      setCategoryMessage({
        type: "error",
        text: "That category already exists.",
      });
      return;
    }

    setAddingCategory(true);
    setCategoryMessage({ type: "", text: "" });

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({ name })
        .select()
        .single();

      if (error) {
        console.error("Failed to add category:", {
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
          raw: error,
        });
        setCategoryMessage({
          type: "error",
          text: error.message || "Failed to add category.",
        });
        return;
      }

      if (data) {
        setCategories((prev) =>
          sortCategoriesAlphabetically([...prev, data as Category]),
        );
      }

      setNewCategory("");
      setCategoryMessage({
        type: "success",
        text: "Category added successfully.",
      });
    } catch (error) {
      console.error("Unexpected add category error:", error);
      setCategoryMessage({
        type: "error",
        text: "Something went wrong while adding the category.",
      });
    } finally {
      setAddingCategory(false);
    }
  };

  const updateCategory = async (id: number) => {
    const name = editingName.trim();

    if (!name) {
      setCategoryMessage({
        type: "error",
        text: "Category name cannot be empty.",
      });
      return;
    }

    const alreadyExists = categories.some(
      (category) =>
        category.id !== id &&
        category.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (alreadyExists) {
      setCategoryMessage({
        type: "error",
        text: "That category name already exists.",
      });
      return;
    }

    setSavingId(id);
    setCategoryMessage({ type: "", text: "" });

    try {
      const { error } = await supabase
        .from("categories")
        .update({ name })
        .eq("id", id);

      if (error) {
        console.error("Failed to update category:", error);
        setCategoryMessage({
          type: "error",
          text: error.message || "Failed to update category.",
        });
        return;
      }

      setCategories((prev) =>
        sortCategoriesAlphabetically(
          prev.map((category) =>
            category.id === id ? { ...category, name } : category,
          ),
        ),
      );

      setEditingId(null);
      setEditingName("");
      setCategoryMessage({
        type: "success",
        text: "Category updated successfully.",
      });
    } catch (error) {
      console.error("Unexpected update category error:", error);
      setCategoryMessage({
        type: "error",
        text: "Something went wrong while updating the category.",
      });
    } finally {
      setSavingId(null);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const deleteCategory = async (id: number) => {
    const usedCount = categoryCountMap[id] || 0;

    if (usedCount > 0) {
      setCategoryMessage({
        type: "error",
        text: "You cannot delete a category that is still being used by books.",
      });
      return;
    }

    setDeletingId(id);
    setCategoryMessage({ type: "", text: "" });

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) {
        console.error("Failed to delete category:", error);
        setCategoryMessage({
          type: "error",
          text: error.message || "Failed to delete category.",
        });
        return;
      }

      setCategories((prev) =>
        sortCategoriesAlphabetically(
          prev.filter((category) => category.id !== id),
        ),
      );

      if (editingId === id) {
        setEditingId(null);
        setEditingName("");
      }

      setCategoryMessage({
        type: "success",
        text: "Category deleted successfully.",
      });
    } catch (error) {
      console.error("Unexpected delete category error:", error);
      setCategoryMessage({
        type: "error",
        text: "Something went wrong while deleting the category.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <AdminDashboardSkeleton type="categories" />;
  }

  return (
    <main className="ml-[240px] min-h-screen bg-[#181614] p-6 text-[#F7F5F1]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#FFFDF9]">
              Categories
            </h1>
            <p className="mt-2 text-sm text-[#9A9187]">
              Manage book categories and organization
            </p>
          </div>

          <div className="flex w-full max-w-md items-center rounded-xl border border-[#312B26] bg-[#211D1A] px-4 py-3">
            <Search size={18} className="mr-2 text-[#8E857B]" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-[#F7F5F1] placeholder:text-[#8E857B] focus:outline-none"
            />
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total Categories"
            value={totalCategories}
            icon={Tags}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
          <SummaryCard
            title="Categorized Books"
            value={categorizedBooks}
            icon={BookOpen}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
          <SummaryCard
            title="Uncategorized"
            value={uncategorizedBooks}
            icon={Tags}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
        </section>

        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex-1">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addCategory();
                  }
                }}
                placeholder="New category..."
                className="w-full rounded-xl border border-[#312B26] bg-[#181614] px-4 py-3 text-sm text-[#F7F5F1] placeholder:text-[#8E857B] outline-none"
              />
            </div>

            <button
              onClick={addCategory}
              disabled={addingCategory}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E67E22] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#cf6f1c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={16} />
              {addingCategory ? "Adding..." : "Add"}
            </button>
          </div>

          {categoryMessage.text && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                categoryMessage.type === "success"
                  ? "border-green-500/20 bg-green-500/10 text-green-400"
                  : "border-red-500/20 bg-red-500/10 text-red-400"
              }`}
            >
              {categoryMessage.text}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#FFFDF9]">
              Categories List
            </h3>
            <p className="text-sm text-[#9A9187]">
              All available book categories and their usage count
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#2A2622]">
            <table className="w-full min-w-[760px] table-fixed text-left">
              <colgroup>
                <col className="w-[48%]" />
                <col className="w-[16%]" />
                <col className="w-[36%]" />
              </colgroup>

              <thead className="sticky top-0 z-10 bg-[#1C1917]">
                <tr className="border-b border-[#2A2622] text-sm text-[#9A9187]">
                  <th className="px-4 py-4 font-medium">Name</th>
                  <th className="px-4 py-4 font-medium">Books</th>
                  <th className="px-4 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-10 text-center text-sm text-[#9A9187]"
                    >
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-[#2A2622] text-sm text-[#E6DFD5] transition hover:bg-[#1A1715]"
                    >
                      <td className="px-4 py-4 align-middle">
                        {editingId === category.id ? (
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                updateCategory(category.id);
                              }
                              if (e.key === "Escape") {
                                cancelEditing();
                              }
                            }}
                            className="w-full rounded-lg border border-[#312B26] bg-[#181614] px-3 py-2 text-sm text-[#F7F5F1] outline-none"
                          />
                        ) : (
                          <HoverText
                            text={category.name}
                            className="max-w-[320px] font-medium text-[#FFFDF9]"
                          />
                        )}
                      </td>

                      <td className="px-4 py-4 align-middle font-medium text-[#FFFDF9]">
                        {categoryCountMap[category.id] || 0}
                      </td>

                      <td className="px-4 py-4 align-middle">
                        {editingId === category.id ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => updateCategory(category.id)}
                              disabled={savingId === category.id}
                              className="inline-flex items-center gap-2 rounded-lg bg-[#E67E22] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#cf6f1c] disabled:opacity-60"
                            >
                              <Check size={15} />
                              {savingId === category.id ? "Saving..." : "Save"}
                            </button>

                            <button
                              onClick={cancelEditing}
                              className="inline-flex items-center gap-2 rounded-lg border border-[#312B26] bg-[#181614] px-3 py-2 text-sm font-medium text-[#D6CEC4] transition hover:bg-[#2A2622]"
                            >
                              <X size={15} />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                setEditingId(category.id);
                                setEditingName(category.name);
                                setCategoryMessage({ type: "", text: "" });
                              }}
                              className="inline-flex items-center gap-2 rounded-lg border border-[#312B26] bg-[#181614] px-3 py-2 text-sm font-medium text-[#D6CEC4] transition hover:bg-[#2A2622] hover:text-[#FFFDF9]"
                            >
                              <Pencil size={15} />
                              Edit
                            </button>

                            <button
                              onClick={() => deleteCategory(category.id)}
                              disabled={deletingId === category.id}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/15 disabled:opacity-60"
                            >
                              <Trash2 size={15} />
                              {deletingId === category.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
