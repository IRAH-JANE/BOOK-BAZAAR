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
  Shapes,
  Library,
} from "lucide-react";

type LookupItem = {
  id: number;
  name: string;
};

type Book = {
  id: number;
  category_id: number | null;
  genre_id: number | null;
  book_type_id: number | null;
};

type MessageState = {
  type: "success" | "error" | "";
  text: string;
};

type SectionKey = "categories" | "genres" | "book_types";

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

function sortItemsAlphabetically(items: LookupItem[]) {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
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

function SectionTabs({
  activeSection,
  setActiveSection,
}: {
  activeSection: SectionKey;
  setActiveSection: (section: SectionKey) => void;
}) {
  const tabs: {
    key: SectionKey;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[] = [
    { key: "categories", label: "Categories", icon: Library },
    { key: "genres", label: "Genres", icon: Tags },
    { key: "book_types", label: "Book Types", icon: Shapes },
  ];

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {tabs.map((tab) => {
        const isActive = activeSection === tab.key;
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
              isActive
                ? "border-[#E67E22] bg-[#E67E22] text-white"
                : "border-[#312B26] bg-[#211D1A] text-[#D6CEC4] hover:bg-[#2A2622] hover:text-[#FFFDF9]"
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<LookupItem[]>([]);
  const [genres, setGenres] = useState<LookupItem[]>([]);
  const [bookTypes, setBookTypes] = useState<LookupItem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeSection, setActiveSection] = useState<SectionKey>("categories");
  const [search, setSearch] = useState("");

  const [newItemName, setNewItemName] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [message, setMessage] = useState<MessageState>({ type: "", text: "" });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const [catRes, genreRes, typeRes, bookRes] = await Promise.all([
          supabase
            .from("categories")
            .select("id, name")
            .order("name", { ascending: true }),
          supabase
            .from("genres")
            .select("id, name")
            .order("name", { ascending: true }),
          supabase
            .from("book_types")
            .select("id, name")
            .order("name", { ascending: true }),
          supabase
            .from("books")
            .select("id, category_id, genre_id, book_type_id"),
        ]);

        if (catRes.error) {
          console.error("Failed to load categories:", catRes.error);
        } else {
          setCategories(sortItemsAlphabetically(catRes.data || []));
        }

        if (genreRes.error) {
          console.error("Failed to load genres:", genreRes.error);
        } else {
          setGenres(sortItemsAlphabetically(genreRes.data || []));
        }

        if (typeRes.error) {
          console.error("Failed to load book types:", typeRes.error);
        } else {
          setBookTypes(sortItemsAlphabetically(typeRes.data || []));
        }

        if (bookRes.error) {
          console.error("Failed to load books:", bookRes.error);
        } else {
          setBooks(bookRes.data || []);
        }
      } catch (error) {
        console.error("Failed to load admin lookup page:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const currentItems = useMemo(() => {
    if (activeSection === "categories") return categories;
    if (activeSection === "genres") return genres;
    return bookTypes;
  }, [activeSection, categories, genres, bookTypes]);

  const setCurrentItems = (updater: (prev: LookupItem[]) => LookupItem[]) => {
    if (activeSection === "categories") {
      setCategories((prev) => updater(prev));
      return;
    }

    if (activeSection === "genres") {
      setGenres((prev) => updater(prev));
      return;
    }

    setBookTypes((prev) => updater(prev));
  };

  const tableLabel = useMemo(() => {
    if (activeSection === "categories") return "categories";
    if (activeSection === "genres") return "genres";
    return "book_types";
  }, [activeSection]);

  const singularLabel = useMemo(() => {
    if (activeSection === "categories") return "category";
    if (activeSection === "genres") return "genre";
    return "book type";
  }, [activeSection]);

  const sectionTitle = useMemo(() => {
    if (activeSection === "categories") return "Categories";
    if (activeSection === "genres") return "Genres";
    return "Book Types";
  }, [activeSection]);

  const sectionSubtitle = useMemo(() => {
    if (activeSection === "categories") {
      return "Manage broad book grouping like Fiction and Non-fiction";
    }
    if (activeSection === "genres") {
      return "Manage searchable genres like Romance, Fantasy, and Mystery";
    }
    return "Manage book formats like Novel, Manga, Comics, and Wattpad";
  }, [activeSection]);

  const countMap = useMemo(() => {
    const map: Record<number, number> = {};

    books.forEach((book) => {
      const targetId =
        activeSection === "categories"
          ? book.category_id
          : activeSection === "genres"
            ? book.genre_id
            : book.book_type_id;

      if (!targetId) return;
      map[targetId] = (map[targetId] || 0) + 1;
    });

    return map;
  }, [books, activeSection]);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const baseList = sortItemsAlphabetically(currentItems);

    if (!keyword) return baseList;

    return baseList.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [currentItems, search]);

  const totalCategories = categories.length;
  const totalGenres = genres.length;
  const totalBookTypes = bookTypes.length;

  const categorizedBooks = books.filter((book) => book.category_id).length;
  const genreTaggedBooks = books.filter((book) => book.genre_id).length;
  const typedBooks = books.filter((book) => book.book_type_id).length;

  const resetEditorState = () => {
    setEditingId(null);
    setEditingName("");
    setNewItemName("");
    setMessage({ type: "", text: "" });
  };

  const handleSectionChange = (section: SectionKey) => {
    setActiveSection(section);
    setSearch("");
    resetEditorState();
  };

  const addItem = async () => {
    const name = newItemName.trim();

    if (!name) {
      setMessage({
        type: "error",
        text: `Please enter a ${singularLabel} name.`,
      });
      return;
    }

    const alreadyExists = currentItems.some(
      (item) => item.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (alreadyExists) {
      setMessage({
        type: "error",
        text: `That ${singularLabel} already exists.`,
      });
      return;
    }

    setAddingItem(true);
    setMessage({ type: "", text: "" });

    try {
      const { data, error } = await supabase
        .from(tableLabel)
        .insert({ name })
        .select()
        .single();

      if (error) {
        console.error(`Failed to add ${singularLabel}:`, error);
        setMessage({
          type: "error",
          text: error.message || `Failed to add ${singularLabel}.`,
        });
        return;
      }

      if (data) {
        setCurrentItems((prev) =>
          sortItemsAlphabetically([...prev, data as LookupItem]),
        );
      }

      setNewItemName("");
      setMessage({
        type: "success",
        text: `${sectionTitle.slice(0, -1)} added successfully.`,
      });
    } catch (error) {
      console.error(`Unexpected add ${singularLabel} error:`, error);
      setMessage({
        type: "error",
        text: `Something went wrong while adding the ${singularLabel}.`,
      });
    } finally {
      setAddingItem(false);
    }
  };

  const updateItem = async (id: number) => {
    const name = editingName.trim();

    if (!name) {
      setMessage({
        type: "error",
        text: `${sectionTitle.slice(0, -1)} name cannot be empty.`,
      });
      return;
    }

    const alreadyExists = currentItems.some(
      (item) =>
        item.id !== id && item.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (alreadyExists) {
      setMessage({
        type: "error",
        text: `That ${singularLabel} name already exists.`,
      });
      return;
    }

    setSavingId(id);
    setMessage({ type: "", text: "" });

    try {
      const { error } = await supabase
        .from(tableLabel)
        .update({ name })
        .eq("id", id);

      if (error) {
        console.error(`Failed to update ${singularLabel}:`, error);
        setMessage({
          type: "error",
          text: error.message || `Failed to update ${singularLabel}.`,
        });
        return;
      }

      setCurrentItems((prev) =>
        sortItemsAlphabetically(
          prev.map((item) => (item.id === id ? { ...item, name } : item)),
        ),
      );

      setEditingId(null);
      setEditingName("");
      setMessage({
        type: "success",
        text: `${sectionTitle.slice(0, -1)} updated successfully.`,
      });
    } catch (error) {
      console.error(`Unexpected update ${singularLabel} error:`, error);
      setMessage({
        type: "error",
        text: `Something went wrong while updating the ${singularLabel}.`,
      });
    } finally {
      setSavingId(null);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const deleteItem = async (id: number) => {
    const usedCount = countMap[id] || 0;

    if (usedCount > 0) {
      setMessage({
        type: "error",
        text: `You cannot delete a ${singularLabel} that is still being used by books.`,
      });
      return;
    }

    setDeletingId(id);
    setMessage({ type: "", text: "" });

    try {
      const { error } = await supabase.from(tableLabel).delete().eq("id", id);

      if (error) {
        console.error(`Failed to delete ${singularLabel}:`, error);
        setMessage({
          type: "error",
          text: error.message || `Failed to delete ${singularLabel}.`,
        });
        return;
      }

      setCurrentItems((prev) =>
        sortItemsAlphabetically(prev.filter((item) => item.id !== id)),
      );

      if (editingId === id) {
        setEditingId(null);
        setEditingName("");
      }

      setMessage({
        type: "success",
        text: `${sectionTitle.slice(0, -1)} deleted successfully.`,
      });
    } catch (error) {
      console.error(`Unexpected delete ${singularLabel} error:`, error);
      setMessage({
        type: "error",
        text: `Something went wrong while deleting the ${singularLabel}.`,
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
              Book Classification
            </h1>
            <p className="mt-2 text-sm text-[#9A9187]">
              Manage categories, genres, and book types for BookBazaar
            </p>
          </div>

          <div className="flex w-full max-w-md items-center rounded-xl border border-[#312B26] bg-[#211D1A] px-4 py-3">
            <Search size={18} className="mr-2 text-[#8E857B]" />
            <input
              type="text"
              placeholder={`Search ${sectionTitle.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-[#F7F5F1] placeholder:text-[#8E857B] focus:outline-none"
            />
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Total Categories"
            value={totalCategories}
            icon={Library}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
          <SummaryCard
            title="Total Genres"
            value={totalGenres}
            icon={Tags}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
          <SummaryCard
            title="Total Book Types"
            value={totalBookTypes}
            icon={Shapes}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Books with Category"
            value={categorizedBooks}
            icon={BookOpen}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
          <SummaryCard
            title="Books with Genre"
            value={genreTaggedBooks}
            icon={BookOpen}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
          <SummaryCard
            title="Books with Type"
            value={typedBooks}
            icon={BookOpen}
            tone="text-[#E67E22] bg-[#E67E22]/15"
          />
        </section>

        <SectionTabs
          activeSection={activeSection}
          setActiveSection={handleSectionChange}
        />

        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#FFFDF9]">
              {sectionTitle}
            </h2>
            <p className="text-sm text-[#9A9187]">{sectionSubtitle}</p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex-1">
              <input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addItem();
                  }
                }}
                placeholder={`New ${singularLabel}...`}
                className="w-full rounded-xl border border-[#312B26] bg-[#181614] px-4 py-3 text-sm text-[#F7F5F1] placeholder:text-[#8E857B] outline-none"
              />
            </div>

            <button
              onClick={addItem}
              disabled={addingItem}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E67E22] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#cf6f1c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={16} />
              {addingItem ? "Adding..." : `Add ${sectionTitle.slice(0, -1)}`}
            </button>
          </div>

          {message.text && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-green-500/20 bg-green-500/10 text-green-400"
                  : "border-red-500/20 bg-red-500/10 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-[#312B26] bg-[#211D1A] p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#FFFDF9]">
              {sectionTitle} List
            </h3>
            <p className="text-sm text-[#9A9187]">
              All available {sectionTitle.toLowerCase()} and their usage count
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
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-10 text-center text-sm text-[#9A9187]"
                    >
                      No {sectionTitle.toLowerCase()} found.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#2A2622] text-sm text-[#E6DFD5] transition hover:bg-[#1A1715]"
                    >
                      <td className="px-4 py-4 align-middle">
                        {editingId === item.id ? (
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                updateItem(item.id);
                              }
                              if (e.key === "Escape") {
                                cancelEditing();
                              }
                            }}
                            className="w-full rounded-lg border border-[#312B26] bg-[#181614] px-3 py-2 text-sm text-[#F7F5F1] outline-none"
                          />
                        ) : (
                          <HoverText
                            text={item.name}
                            className="max-w-[320px] font-medium text-[#FFFDF9]"
                          />
                        )}
                      </td>

                      <td className="px-4 py-4 align-middle font-medium text-[#FFFDF9]">
                        {countMap[item.id] || 0}
                      </td>

                      <td className="px-4 py-4 align-middle">
                        {editingId === item.id ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => updateItem(item.id)}
                              disabled={savingId === item.id}
                              className="inline-flex items-center gap-2 rounded-lg bg-[#E67E22] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#cf6f1c] disabled:opacity-60"
                            >
                              <Check size={15} />
                              {savingId === item.id ? "Saving..." : "Save"}
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
                                setEditingId(item.id);
                                setEditingName(item.name);
                                setMessage({ type: "", text: "" });
                              }}
                              className="inline-flex items-center gap-2 rounded-lg border border-[#312B26] bg-[#181614] px-3 py-2 text-sm font-medium text-[#D6CEC4] transition hover:bg-[#2A2622] hover:text-[#FFFDF9]"
                            >
                              <Pencil size={15} />
                              Edit
                            </button>

                            <button
                              onClick={() => deleteItem(item.id)}
                              disabled={deletingId === item.id}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/15 disabled:opacity-60"
                            >
                              <Trash2 size={15} />
                              {deletingId === item.id
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
