"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";
import {
  BookOpen,
  ScanSearch,
  ImagePlus,
  Tag,
  MapPin,
  BadgeDollarSign,
  FileText,
  CalendarDays,
  Building2,
  Sparkles,
  User,
  Package,
} from "lucide-react";

type Category = {
  id: number;
  name: string;
};

type GoogleBookVolume = {
  id?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    description?: string;
    publisher?: string;
    publishedDate?: string;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
};

type OpenLibrarySearchDoc = {
  title?: string;
  author_name?: string[];
  publisher?: string[];
  first_publish_year?: number;
  subject?: string[];
  isbn?: string[];
  cover_i?: number;
};

type AutofillBook = {
  source: "google" | "openlibrary";
  title: string;
  authors: string[];
  description: string;
  publisher: string;
  publishedDate: string;
  categories: string[];
  coverUrls: string[];
};

export default function SellPage() {
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [fetchedCover, setFetchedCover] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const [googleCategories, setGoogleCategories] = useState<string[]>([]);
  const [stockQuantity, setStockQuantity] = useState("1");

  const [coverCandidates, setCoverCandidates] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [autofillSource, setAutofillSource] = useState<
    "" | "google" | "openlibrary"
  >("");

  const cleanedIsbn = useMemo(() => isbn.replace(/[^0-9Xx]/g, ""), [isbn]);

  const localImagePreview = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (localImagePreview) {
        URL.revokeObjectURL(localImagePreview);
      }
    };
  }, [localImagePreview]);

  const inputClass =
    "w-full rounded-2xl border border-[#DED8CF] bg-white px-4 py-3 text-[16px] text-[#5F5A52] placeholder:text-[#8A8175] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]";

  const textareaClass =
    "w-full rounded-2xl border border-[#DED8CF] bg-white px-4 py-3 text-[16px] text-[#5F5A52] placeholder:text-[#8A8175] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]";

  const selectClass =
    "w-full rounded-2xl border border-[#DED8CF] bg-white px-4 py-3 text-[16px] text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]";

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  const getMatchedCategoryId = (
    sourceCategories: string[] = [],
    bookTitle = "",
    bookDescription = "",
    dbCategories: Category[] = categories,
  ) => {
    if (!dbCategories.length) return "";

    const combinedText = [...sourceCategories, bookTitle, bookDescription]
      .join(" ")
      .toLowerCase();

    const keywordMap: Record<string, string[]> = {
      Fiction: [
        "fiction",
        "novel",
        "literary",
        "fantasy",
        "romance",
        "mystery",
        "thriller",
        "story",
        "drama",
        "young adult fiction",
        "juvenile fiction",
        "fantasy fiction",
        "romantic",
      ],
      "Non-fiction": [
        "nonfiction",
        "non-fiction",
        "memoir",
        "biography",
        "autobiography",
        "essay",
        "documentary",
        "true crime",
        "reportage",
      ],
      Academic: [
        "education",
        "academic",
        "school",
        "textbook",
        "learning",
        "study guide",
        "reference",
        "curriculum",
        "instructional",
      ],
      Children: [
        "children",
        "childrens",
        "kids",
        "juvenile",
        "picture book",
        "young readers",
        "bedtime story",
        "children's books",
        "juvenile nonfiction",
      ],
      "Self-help": [
        "self-help",
        "self help",
        "personal growth",
        "personal development",
        "motivation",
        "habits",
        "mindset",
        "success",
        "productivity",
        "psychology",
        "inspiration",
        "wellness",
        "mental health",
      ],
      Religion: [
        "religion",
        "faith",
        "bible",
        "christian",
        "spiritual",
        "devotional",
        "theology",
        "prayer",
        "church",
        "catholic",
      ],
      Programming: [
        "programming",
        "coding",
        "software",
        "developer",
        "web development",
        "javascript",
        "python",
        "computer science",
        "computers",
        "database",
        "algorithms",
        "technology",
      ],
      Science: [
        "science",
        "physics",
        "chemistry",
        "biology",
        "astronomy",
        "mathematics",
        "math",
        "scientific",
        "earth science",
      ],
      History: [
        "history",
        "historical",
        "war",
        "civilization",
        "ancient",
        "world history",
        "military history",
        "historical study",
      ],
      Business: [
        "business",
        "economics",
        "finance",
        "entrepreneur",
        "entrepreneurship",
        "leadership",
        "management",
        "marketing",
        "business & economics",
        "investing",
        "startup",
      ],
    };

    for (const [dbName, keywords] of Object.entries(keywordMap)) {
      if (keywords.some((keyword) => combinedText.includes(keyword))) {
        const matched = dbCategories.find(
          (cat) => cat.name.toLowerCase() === dbName.toLowerCase(),
        );
        if (matched) return String(matched.id);
      }
    }

    const normalizedCategoryMap: Record<string, string> = {
      "juvenile fiction": "Children",
      "juvenile nonfiction": "Children",
      "young adult fiction": "Fiction",
      "young adult nonfiction": "Non-fiction",
      "business & economics": "Business",
      computers: "Programming",
      technology: "Programming",
      psychology: "Self-help",
      "health & fitness": "Self-help",
      education: "Academic",
      religion: "Religion",
      science: "Science",
      history: "History",
      fiction: "Fiction",
      nonfiction: "Non-fiction",
      "non-fiction": "Non-fiction",
      biography: "Non-fiction",
      autobiography: "Non-fiction",
      spirituality: "Religion",
      theology: "Religion",
      programming: "Programming",
      mathematics: "Science",
      textbook: "Academic",
      reference: "Academic",
      "children's books": "Children",
    };

    for (const [sourceName, dbName] of Object.entries(normalizedCategoryMap)) {
      if (combinedText.includes(sourceName)) {
        const matched = dbCategories.find(
          (cat) => cat.name.toLowerCase() === dbName.toLowerCase(),
        );
        if (matched) return String(matched.id);
      }
    }

    const directMatch = dbCategories.find((cat) =>
      combinedText.includes(cat.name.toLowerCase()),
    );

    return directMatch ? String(directMatch.id) : "";
  };

  useEffect(() => {
    if (!categories.length) return;
    if (!googleCategories.length && !title && !description) return;

    const matchedId = getMatchedCategoryId(
      googleCategories,
      title,
      description,
      categories,
    );

    if (matchedId) {
      setCategoryId(matchedId);
    }
  }, [googleCategories, title, description, categories]);

  const sanitizeUrl = (url?: string) => {
    if (!url) return "";
    return url.replace("http://", "https://");
  };

  const uniqueNonEmpty = (items: string[]) => {
    return [...new Set(items.filter(Boolean))];
  };

  const buildGoogleCoverCandidates = (
    isbnValue: string,
    googleThumbnail?: string,
    googleSmallThumbnail?: string,
    googleVolumeId?: string,
  ) => {
    const normalThumbnail = sanitizeUrl(googleThumbnail);
    const normalSmallThumbnail = sanitizeUrl(googleSmallThumbnail);

    const upgradedThumbnail = normalThumbnail
      ? normalThumbnail.replace("&edge=curl", "").replace("zoom=1", "zoom=2")
      : "";

    const upgradedSmallThumbnail = normalSmallThumbnail
      ? normalSmallThumbnail
          .replace("&edge=curl", "")
          .replace("zoom=1", "zoom=2")
      : "";

    return uniqueNonEmpty([
      normalThumbnail,
      normalSmallThumbnail,
      upgradedThumbnail,
      upgradedSmallThumbnail,
      googleVolumeId
        ? `https://books.google.com/books/content?id=${googleVolumeId}&printsec=frontcover&img=1&zoom=3&source=gbs_api`
        : "",
      isbnValue
        ? `https://books.google.com/books/publisher/content/images/frontcover/${isbnValue}?fife=w800`
        : "",
      isbnValue
        ? `https://covers.openlibrary.org/b/isbn/${isbnValue}-L.jpg?default=false`
        : "",
    ]);
  };

  const buildOpenLibraryCoverCandidates = (
    isbnValue: string,
    coverId?: number,
    extraIsbns: string[] = [],
  ) => {
    return uniqueNonEmpty([
      isbnValue
        ? `https://covers.openlibrary.org/b/isbn/${isbnValue}-L.jpg?default=false`
        : "",
      ...extraIsbns.map(
        (value) =>
          `https://covers.openlibrary.org/b/isbn/${value}-L.jpg?default=false`,
      ),
      coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg?default=false`
        : "",
    ]);
  };

  const fetchFromGoogleBooks = async (
    isbnValue: string,
  ): Promise<AutofillBook | null> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;

    const buildUrl = (query: string) => {
      const url = new URL("https://www.googleapis.com/books/v1/volumes");
      url.searchParams.set("q", query);
      url.searchParams.set("maxResults", "1");
      url.searchParams.set("printType", "books");
      url.searchParams.set("projection", "lite");
      if (apiKey) {
        url.searchParams.set("key", apiKey);
      }
      return url.toString();
    };

    let response = await fetch(buildUrl(`isbn:${isbnValue}`));
    let data = await response.json();

    if (!data?.items?.length) {
      response = await fetch(buildUrl(isbnValue));
      data = await response.json();
    }

    const item = data?.items?.[0] as GoogleBookVolume | undefined;
    const info = item?.volumeInfo;

    if (!info) return null;

    return {
      source: "google",
      title: info.title ?? "",
      authors: info.authors ?? [],
      description: info.description ?? "",
      publisher: info.publisher ?? "",
      publishedDate: info.publishedDate ?? "",
      categories: info.categories ?? [],
      coverUrls: buildGoogleCoverCandidates(
        isbnValue,
        info.imageLinks?.thumbnail,
        info.imageLinks?.smallThumbnail,
        item?.id,
      ),
    };
  };

  const fetchFromOpenLibrary = async (
    isbnValue: string,
  ): Promise<AutofillBook | null> => {
    const url = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(
      isbnValue,
    )}`;

    const response = await fetch(url);
    const data = await response.json();

    const doc = data?.docs?.[0] as OpenLibrarySearchDoc | undefined;

    if (!doc) return null;

    const subjects = doc.subject ?? [];
    const coverUrls = buildOpenLibraryCoverCandidates(
      isbnValue,
      doc.cover_i,
      doc.isbn ?? [],
    );

    return {
      source: "openlibrary",
      title: doc.title ?? "",
      authors: doc.author_name ?? [],
      description: "",
      publisher: doc.publisher?.[0] ?? "",
      publishedDate: doc.first_publish_year
        ? String(doc.first_publish_year)
        : "",
      categories: subjects,
      coverUrls,
    };
  };

  const applyAutofillBook = (book: AutofillBook) => {
    const nextTitle = book.title ?? "";
    const nextAuthor = book.authors?.join(", ") ?? "";
    const nextDescription = book.description ?? "";
    const nextPublisher = book.publisher ?? "";
    const nextPublishedDate = book.publishedDate ?? "";
    const nextCategories = book.categories ?? [];
    const nextCoverUrls = book.coverUrls ?? [];

    setAutofillSource(book.source);
    setTitle(nextTitle);
    setAuthor(nextAuthor);
    setDescription(nextDescription);
    setPublisher(nextPublisher);
    setPublishedDate(nextPublishedDate);
    setGoogleCategories(nextCategories);

    setCoverCandidates(nextCoverUrls);
    setCoverIndex(0);
    setFetchedCover(nextCoverUrls[0] || "");

    const matchedId = getMatchedCategoryId(
      nextCategories,
      nextTitle,
      nextDescription,
      categories,
    );

    if (matchedId) {
      setCategoryId(matchedId);
    }
  };

  const handleIsbnLookup = async () => {
    const normalizedIsbn = isbn.replace(/[^0-9Xx]/g, "");

    if (!normalizedIsbn) {
      showToast({
        title: "ISBN required",
        message: "Enter an ISBN first.",
        type: "info",
      });
      return;
    }

    if (normalizedIsbn.length !== 10 && normalizedIsbn.length !== 13) {
      showToast({
        title: "Invalid ISBN",
        message: "ISBN should be 10 or 13 digits only.",
        type: "error",
      });
      return;
    }

    try {
      setLookupLoading(true);
      setFetchedCover("");
      setCoverCandidates([]);
      setCoverIndex(0);
      setAutofillSource("");

      const googleBook = await fetchFromGoogleBooks(normalizedIsbn);

      if (googleBook) {
        applyAutofillBook(googleBook);
        showToast({
          title: "Book details filled",
          message: "Book details were autofilled from Google Books.",
          type: "success",
        });
        return;
      }

      const openLibraryBook = await fetchFromOpenLibrary(normalizedIsbn);

      if (openLibraryBook) {
        applyAutofillBook(openLibraryBook);
        showToast({
          title: "Book details filled",
          message: "Book details were autofilled from Open Library.",
          type: "success",
        });
        return;
      }

      showToast({
        title: "No match found",
        message: "Please check the ISBN or fill in the details manually.",
        type: "info",
      });
    } catch (error) {
      console.error("ISBN lookup failed:", error);
      showToast({
        title: "Lookup failed",
        message: "ISBN lookup failed. Please check your internet or API setup.",
        type: "error",
      });
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCoverError = () => {
    const nextIndex = coverIndex + 1;

    if (nextIndex < coverCandidates.length) {
      setCoverIndex(nextIndex);
      setFetchedCover(coverCandidates[nextIndex]);
      return;
    }

    setFetchedCover("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);

    const parsedPrice = Number(price);
    const parsedStock = Number(stockQuantity);

    if (!parsedPrice || parsedPrice <= 0) {
      showToast({
        title: "Invalid price",
        message: "Please enter a valid price.",
        type: "error",
      });
      setPosting(false);
      return;
    }

    if (!parsedStock || parsedStock < 1) {
      showToast({
        title: "Invalid stock quantity",
        message: "Stock quantity must be at least 1.",
        type: "error",
      });
      setPosting(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      showToast({
        title: "Login required",
        message: "You must be logged in to sell a book.",
        type: "error",
      });
      setPosting(false);
      return;
    }

    let imageUrl = fetchedCover;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("book-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        showToast({
          title: "Image upload failed",
          message: uploadError.message,
          type: "error",
        });
        setPosting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("book-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const finalPrice = parsedPrice * 0.96;

    const { error } = await supabase.from("books").insert([
      {
        seller_id: user.id,
        category_id: categoryId ? Number(categoryId) : null,
        isbn: cleanedIsbn || null,
        title,
        author,
        publisher: publisher || null,
        published_date: publishedDate || null,
        description,
        price: finalPrice,
        condition,
        location,
        image_url: imageUrl || null,
        stock_quantity: parsedStock,
      },
    ]);

    setPosting(false);

    if (error) {
      showToast({
        title: "Listing failed",
        message: error.message,
        type: "error",
      });
      return;
    }

    showToast({
      title: "Book listed successfully",
      message: "Your book has been published on BookBazaar.",
      type: "success",
    });

    setIsbn("");
    setTitle("");
    setAuthor("");
    setPublisher("");
    setPublishedDate("");
    setDescription("");
    setPrice("");
    setCondition("");
    setLocation("");
    setCategoryId("");
    setFetchedCover("");
    setCoverCandidates([]);
    setCoverIndex(0);
    setImageFile(null);
    setGoogleCategories([]);
    setStockQuantity("1");
    setAutofillSource("");
  };

  return (
    <main className="min-h-screen bg-[#F7F5F1]">
      <section className="border-b border-[#E5E0D8] bg-[#FFFDF9]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E67E22]">
            Sell on BookBazaar
          </p>
          <h1 className="mt-3 text-5xl font-bold leading-tight text-[#1F1F1F]">
            List your book faster with ISBN autofill
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#6B6B6B]">
            Enter an ISBN to automatically fill key book details, then review,
            adjust, upload your own image if needed, and publish the listing.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-[#E5E0D8] bg-white p-8 shadow-sm"
          >
            <div className="mb-8 flex items-start gap-4 rounded-3xl bg-[#FFF7EF] p-5">
              <div className="mt-1 rounded-2xl bg-white p-3 text-[#E67E22] shadow-sm">
                <ScanSearch size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1F1F1F]">
                  ISBN Smart Fill
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                  Add the ISBN first, then click the lookup button to
                  automatically fill the book’s basic information.
                </p>
                <p className="mt-2 text-xs text-[#8A8175]">
                  Source used:{" "}
                  <span className="font-semibold text-[#1F1F1F]">
                    {autofillSource
                      ? autofillSource === "google"
                        ? "Google Books"
                        : "Open Library"
                      : "None yet"}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <input
                value={isbn}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^0-9Xx-]/g, "")
                    .slice(0, 17);
                  setIsbn(value);
                }}
                placeholder="Enter ISBN-10 or ISBN-13 (dashes allowed)"
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleIsbnLookup}
                disabled={lookupLoading}
                className="rounded-2xl bg-[#E67E22] px-5 py-3 font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-50"
              >
                {lookupLoading ? "Looking up..." : "Autofill"}
              </button>
            </div>

            <div className="mt-8 grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <BookOpen size={16} />
                    Book Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Book title"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <User size={16} />
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <Building2 size={16} />
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Publisher"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <CalendarDays size={16} />
                    Published Date
                  </label>
                  <input
                    type="text"
                    value={publishedDate}
                    onChange={(e) => setPublishedDate(e.target.value)}
                    placeholder="e.g. 2005 or 2005-06-01"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                  <FileText size={16} />
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Book description"
                  rows={6}
                  className={textareaClass}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <BadgeDollarSign size={16} />
                    Price
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value.replace(/[^\d]/g, ""))
                    }
                    placeholder="Original price"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <Package size={16} />
                    Stock Quantity
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={stockQuantity}
                    onChange={(e) =>
                      setStockQuantity(e.target.value.replace(/[^\d]/g, ""))
                    }
                    placeholder="How many copies do you have?"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <Tag size={16} />
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={selectClass}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 text-sm font-medium text-[#6B6B6B]">
                    Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className={selectClass}
                    required
                  >
                    <option value="">Select condition</option>
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                  <MapPin size={16} />
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                  <ImagePlus size={16} />
                  Upload Book Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-[#DED8CF] bg-white px-4 py-3 text-sm text-[#5F5A52] file:mr-4 file:rounded-full file:border-0 file:bg-[#E67E22] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#cf6f1c]"
                />
              </div>

              <div className="rounded-2xl bg-[#F7F4EE] p-4 text-sm leading-7 text-[#6B6B6B]">
                BookBazaar applies a 4% platform commission. If you enter{" "}
                <span className="font-semibold text-[#1F1F1F]">₱100</span>, the
                listed amount becomes{" "}
                <span className="font-semibold text-[#E67E22]">₱96</span>.
              </div>

              <button
                type="submit"
                disabled={posting}
                className="rounded-full bg-[#E67E22] px-6 py-3 font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-50"
              >
                {posting ? "Posting book..." : "Publish Listing"}
              </button>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <Sparkles className="text-[#E67E22]" size={20} />
                <h2 className="text-2xl font-bold text-[#1F1F1F]">
                  Listing Preview
                </h2>
              </div>

              <div className="mt-6 overflow-hidden rounded-3xl border border-[#E5E0D8] bg-[#FFFDF9]">
                {localImagePreview ? (
                  <img
                    src={localImagePreview}
                    alt="Selected upload preview"
                    className="h-72 w-full object-contain bg-[#F7F4EE]"
                  />
                ) : fetchedCover ? (
                  <img
                    src={fetchedCover}
                    alt={title || "Fetched cover"}
                    className="h-72 w-full object-contain bg-[#F7F4EE]"
                    onError={handleCoverError}
                  />
                ) : (
                  <div className="flex h-72 items-center justify-center bg-[#F1ECE4] text-[#8A8175]">
                    No cover preview
                  </div>
                )}

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#E67E22]">
                    Seller Preview
                  </p>
                  <h3 className="mt-2 break-words text-2xl font-bold text-[#1F1F1F]">
                    {title || "Book title will appear here"}
                  </h3>
                  <p className="mt-2 break-words text-[#6B6B6B]">
                    {author || "Author name"}
                  </p>
                  <p className="mt-4 text-2xl font-bold text-[#E67E22]">
                    {price ? `₱${(Number(price) * 0.96).toFixed(2)}` : "₱0.00"}
                  </p>
                  <p className="mt-2 break-words text-sm text-[#8A8175]">
                    {location || "Location"}
                  </p>
                  <p className="mt-2 break-words text-sm text-[#8A8175]">
                    Stock: {stockQuantity || "0"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#1F1F1F]">
                Why ISBN autofill matters
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-[#6B6B6B]">
                <li>• Faster listing for sellers</li>
                <li>• More consistent book details</li>
                <li>• Better book discovery for buyers</li>
                <li>• Cleaner, more professional marketplace records</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
