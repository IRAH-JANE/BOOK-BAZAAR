"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
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
  Link2,
  Shapes,
  Library,
} from "lucide-react";

type Category = {
  id: number;
  name: string;
};

type Genre = {
  id: number;
  name: string;
};

type BookType = {
  id: number;
  name: string;
};

type GoogleBookVolume = {
  id?: string;
  volumeInfo?: {
    title?: string;
    subtitle?: string;
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
  key?: string;
  title?: string;
  author_name?: string[];
  publisher?: string[];
  first_publish_year?: number;
  subject?: string[];
  isbn?: string[];
  cover_i?: number;
};

type OpenLibraryDescriptionValue =
  | string
  | {
      value?: string;
    };

type OpenLibraryWorkResponse = {
  description?: OpenLibraryDescriptionValue;
};

type OpenLibraryEditionResponse = {
  description?: OpenLibraryDescriptionValue;
};

type AutofillBook = {
  source: "google" | "openlibrary";
  title: string;
  subtitle?: string;
  authors: string[];
  description: string;
  publisher: string;
  publishedDate: string;
  categories: string[];
  coverUrls: string[];
};

function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export default function SellPage() {
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [genreId, setGenreId] = useState("");
  const [bookTypeId, setBookTypeId] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [bookTypes, setBookTypes] = useState<BookType[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [fetchedCover, setFetchedCover] = useState("");
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const [apiCategories, setApiCategories] = useState<string[]>([]);
  const [stockQuantity, setStockQuantity] = useState("1");

  const [coverCandidates, setCoverCandidates] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  const [detectedCategoryName, setDetectedCategoryName] = useState("");
  const [detectedGenreName, setDetectedGenreName] = useState("");
  const [detectedBookTypeName, setDetectedBookTypeName] = useState("");

  const [categoryTouched, setCategoryTouched] = useState(false);
  const [genreTouched, setGenreTouched] = useState(false);
  const [bookTypeTouched, setBookTypeTouched] = useState(false);

  const cleanedIsbn = useMemo(() => isbn.replace(/[^0-9Xx]/g, ""), [isbn]);

  const supabase = createSupabaseBrowser();

  const localImagePreview = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  const normalizedCustomCoverUrl = useMemo(() => {
    const trimmed = customCoverUrl.trim();
    if (!trimmed) return "";
    return trimmed.replace("http://", "https://");
  }, [customCoverUrl]);

  const selectedCategoryName = useMemo(() => {
    if (!categoryId) return "";
    return (
      categories.find((item) => String(item.id) === categoryId)?.name || ""
    );
  }, [categoryId, categories]);

  const selectedGenreName = useMemo(() => {
    if (!genreId) return "";
    return genres.find((item) => String(item.id) === genreId)?.name || "";
  }, [genreId, genres]);

  const selectedBookTypeName = useMemo(() => {
    if (!bookTypeId) return "";
    return bookTypes.find((item) => String(item.id) === bookTypeId)?.name || "";
  }, [bookTypeId, bookTypes]);

  useEffect(() => {
    return () => {
      if (localImagePreview) URL.revokeObjectURL(localImagePreview);
    };
  }, [localImagePreview]);

  const inputClass =
    "h-[52px] w-full rounded-2xl border border-[#DED8CF] bg-white px-4 text-[15px] text-[#5F5A52] placeholder:text-[#8A8175] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]";

  const textareaClass =
    "w-full rounded-2xl border border-[#DED8CF] bg-white px-4 py-3 text-[15px] text-[#5F5A52] placeholder:text-[#8A8175] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]";

  const selectClass =
    "h-[52px] w-full appearance-none rounded-2xl border border-[#DED8CF] bg-white px-4 pr-10 text-[15px] text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]";

  const locationSuggestions = [
    // === MAJOR CITIES ===
    "Manila",
    "Quezon City",
    "Caloocan City",
    "Makati City",
    "Taguig City",
    "Pasig City",
    "Pasay City",
    "Parañaque City",
    "Las Piñas City",
    "Muntinlupa City",
    "Marikina City",
    "Mandaluyong City",
    "San Juan City",
    "Valenzuela City",
    "Malabon City",
    "Navotas City",

    "Davao City",
    "Tagum City",
    "Panabo City",
    "Samal City",
    "Digos City",
    "Mati City",

    "Cebu City",
    "Lapu-Lapu City",
    "Mandaue City",

    "Cagayan de Oro City",
    "Iligan City",
    "Butuan City",
    "General Santos City",
    "Zamboanga City",
    "Bacolod City",
    "Iloilo City",
    "Tacloban City",
    "Baguio City",
    "Angeles City",
    "Olongapo City",
    "Batangas City",
    "Lucena City",
    "Puerto Princesa City",
    "Cotabato City",
    "Koronadal City",
    "Dipolog City",
    "Pagadian City",
    "Surigao City",
    "Tuguegarao City",
    "Naga City",
    "Legazpi City",
    "Calbayog City",
    "Ormoc City",
    "Roxas City",
    "Tagbilaran City",

    // === PROVINCES ===
    "Abra",
    "Agusan del Norte",
    "Agusan del Sur",
    "Aklan",
    "Albay",
    "Antique",
    "Apayao",
    "Aurora",
    "Basilan",
    "Bataan",
    "Batanes",
    "Batangas",
    "Benguet",
    "Biliran",
    "Bohol",
    "Bukidnon",
    "Bulacan",
    "Cagayan",
    "Camarines Norte",
    "Camarines Sur",
    "Camiguin",
    "Capiz",
    "Catanduanes",
    "Cavite",
    "Cebu",
    "Cotabato",
    "Davao de Oro",
    "Davao del Norte",
    "Davao del Sur",
    "Davao Occidental",
    "Davao Oriental",
    "Dinagat Islands",
    "Eastern Samar",
    "Guimaras",
    "Ifugao",
    "Ilocos Norte",
    "Ilocos Sur",
    "Iloilo",
    "Isabela",
    "Kalinga",
    "La Union",
    "Laguna",
    "Lanao del Norte",
    "Lanao del Sur",
    "Leyte",
    "Maguindanao del Norte",
    "Maguindanao del Sur",
    "Marinduque",
    "Masbate",
    "Misamis Occidental",
    "Misamis Oriental",
    "Mountain Province",
    "Negros Occidental",
    "Negros Oriental",
    "Northern Samar",
    "Nueva Ecija",
    "Nueva Vizcaya",
    "Occidental Mindoro",
    "Oriental Mindoro",
    "Palawan",
    "Pampanga",
    "Pangasinan",
    "Quezon",
    "Quirino",
    "Rizal",
    "Romblon",
    "Samar",
    "Sarangani",
    "Siquijor",
    "Sorsogon",
    "South Cotabato",
    "Southern Leyte",
    "Sultan Kudarat",
    "Sulu",
    "Surigao del Norte",
    "Surigao del Sur",
    "Tarlac",
    "Tawi-Tawi",
    "Zambales",
    "Zamboanga del Norte",
    "Zamboanga del Sur",
    "Zamboanga Sibugay",
  ];

  const loadLookups = useCallback(async () => {
    const [categoriesRes, genresRes, bookTypesRes] = await Promise.all([
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
    ]);

    if (!categoriesRes.error && categoriesRes.data) {
      const sortedCategories = sortByName(categoriesRes.data);
      setCategories(sortedCategories);

      if (
        categoryId &&
        !sortedCategories.some((item) => String(item.id) === categoryId)
      ) {
        setCategoryId("");
      }
    }

    if (!genresRes.error && genresRes.data) {
      const sortedGenres = sortByName(genresRes.data);
      setGenres(sortedGenres);

      if (
        genreId &&
        !sortedGenres.some((item) => String(item.id) === genreId)
      ) {
        setGenreId("");
      }
    }

    if (!bookTypesRes.error && bookTypesRes.data) {
      const sortedBookTypes = sortByName(bookTypesRes.data);
      setBookTypes(sortedBookTypes);

      if (
        bookTypeId &&
        !sortedBookTypes.some((item) => String(item.id) === bookTypeId)
      ) {
        setBookTypeId("");
      }
    }
  }, [categoryId, genreId, bookTypeId]);

  useEffect(() => {
    loadLookups();

    const channel = supabase
      .channel("sell-page-lookups")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        async () => {
          await loadLookups();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "genres" },
        async () => {
          await loadLookups();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "book_types" },
        async () => {
          await loadLookups();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadLookups]);

  const normalizeText = (value: string | null | undefined) =>
    (value || "").toLowerCase().trim();

  const sanitizeUrl = (url?: string) => {
    if (!url) return "";
    return url.replace("http://", "https://");
  };

  const uniqueNonEmpty = (items: string[]) => [
    ...new Set(items.filter(Boolean)),
  ];

  const normalizeDescription = (value?: OpenLibraryDescriptionValue) => {
    if (!value) return "";
    if (typeof value === "string") return value.trim();
    return value.value?.trim() || "";
  };

  const stripHtml = (value: string) => {
    if (!value) return "";
    return value
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getFallbackDescription = ({
    title: fallbackTitle,
    authors = [],
    publisher: fallbackPublisher,
    publishedDate: fallbackPublishedDate,
    categories: fallbackCategories = [],
  }: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    categories?: string[];
  }) => {
    const parts: string[] = [];

    if (fallbackTitle) parts.push(`"${fallbackTitle}"`);
    if (authors.length) parts.push(`by ${authors.join(", ")}`);
    if (fallbackPublisher) parts.push(`published by ${fallbackPublisher}`);
    if (fallbackPublishedDate) parts.push(`(${fallbackPublishedDate})`);

    let base = parts.join(" ").trim();

    if (!base) {
      base = "No public description was returned by the book API.";
    } else {
      base = `${base}.`;
    }

    if (fallbackCategories.length) {
      base += ` Categories: ${fallbackCategories.slice(0, 5).join(", ")}.`;
    }

    return base;
  };

  const buildGoogleCoverCandidates = (
    isbnValue: string,
    googleThumbnail?: string,
    googleSmallThumbnail?: string,
    googleVolumeId?: string,
  ) => {
    const normalThumbnail = sanitizeUrl(googleThumbnail);
    const normalSmallThumbnail = sanitizeUrl(googleSmallThumbnail);

    return uniqueNonEmpty([
      isbnValue
        ? `https://covers.openlibrary.org/b/isbn/${isbnValue}-L.jpg`
        : "",
      isbnValue
        ? `https://books.google.com/books/publisher/content/images/frontcover/${isbnValue}?fife=w1200`
        : "",
      googleVolumeId
        ? `https://books.google.com/books/content?id=${googleVolumeId}&printsec=frontcover&img=1&zoom=3&source=gbs_api`
        : "",
      normalThumbnail,
      normalSmallThumbnail,
    ]);
  };

  const buildOpenLibraryCoverCandidates = (
    isbnValue: string,
    coverId?: number,
    extraIsbns: string[] = [],
  ) => {
    return uniqueNonEmpty([
      isbnValue
        ? `https://covers.openlibrary.org/b/isbn/${isbnValue}-L.jpg`
        : "",
      ...extraIsbns.map(
        (value) => `https://covers.openlibrary.org/b/isbn/${value}-L.jpg`,
      ),
      coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : "",
    ]);
  };

  const fetchOpenLibraryDescription = async (
    workKey?: string,
    isbnValue?: string,
  ): Promise<string> => {
    try {
      if (workKey) {
        const workResponse = await fetch(
          `https://openlibrary.org${workKey}.json`,
        );
        if (workResponse.ok) {
          const workData =
            (await workResponse.json()) as OpenLibraryWorkResponse;
          const workDescription = normalizeDescription(workData.description);
          if (workDescription) return stripHtml(workDescription);
        }
      }

      if (isbnValue) {
        const editionResponse = await fetch(
          `https://openlibrary.org/isbn/${encodeURIComponent(isbnValue)}.json`,
        );

        if (editionResponse.ok) {
          const editionData =
            (await editionResponse.json()) as OpenLibraryEditionResponse;
          const editionDescription = normalizeDescription(
            editionData.description,
          );
          if (editionDescription) return stripHtml(editionDescription);
        }
      }

      return "";
    } catch (error) {
      console.error("Open Library description fetch failed:", error);
      return "";
    }
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
      if (apiKey) url.searchParams.set("key", apiKey);
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

    const descriptionText = stripHtml(info.description ?? "");

    return {
      source: "google",
      title: info.title ?? "",
      subtitle: info.subtitle ?? "",
      authors: info.authors ?? [],
      description:
        descriptionText ||
        getFallbackDescription({
          title: info.title,
          authors: info.authors ?? [],
          publisher: info.publisher ?? "",
          publishedDate: info.publishedDate ?? "",
          categories: info.categories ?? [],
        }),
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

    const fetchedDescription = await fetchOpenLibraryDescription(
      doc.key,
      isbnValue,
    );

    return {
      source: "openlibrary",
      title: doc.title ?? "",
      subtitle: "",
      authors: doc.author_name ?? [],
      description:
        fetchedDescription ||
        getFallbackDescription({
          title: doc.title ?? "",
          authors: doc.author_name ?? [],
          publisher: doc.publisher?.[0] ?? "",
          publishedDate: doc.first_publish_year
            ? String(doc.first_publish_year)
            : "",
          categories: subjects,
        }),
      publisher: doc.publisher?.[0] ?? "",
      publishedDate: doc.first_publish_year
        ? String(doc.first_publish_year)
        : "",
      categories: subjects,
      coverUrls,
    };
  };

  const findByName = <T extends { id: number; name: string }>(
    list: T[],
    target: string,
  ) => list.find((item) => normalizeText(item.name) === normalizeText(target));

  const apiTokensFromText = (items: string[]) => {
    return items
      .flatMap((item) =>
        item
          .toLowerCase()
          .split(/[\/,&:;()\-]+|\s+/)
          .map((part) => part.trim()),
      )
      .filter(Boolean);
  };

  const hasPhrase = (haystack: string[], phrases: string[]) => {
    return haystack.some((item) =>
      phrases.some((phrase) => item.includes(phrase.toLowerCase())),
    );
  };

  const mapApiCategoryToLocalCategory = (apiItems: string[]) => {
    const normalizedItems = apiItems.map((item) => item.toLowerCase());
    const tokens = apiTokensFromText(apiItems);

    if (!normalizedItems.length) return "";

    if (
      hasPhrase(normalizedItems, [
        "computer",
        "programming",
        "software",
        "coding",
        "web development",
        "application development",
      ]) ||
      tokens.some((token) =>
        [
          "programming",
          "software",
          "computer",
          "computers",
          "coding",
          "javascript",
          "python",
          "java",
          "c++",
          "typescript",
        ].includes(token),
      )
    ) {
      return "Programming";
    }

    if (
      hasPhrase(normalizedItems, ["science", "physics", "chemistry", "biology"])
    ) {
      return "Science";
    }

    if (
      hasPhrase(normalizedItems, [
        "religion",
        "spirituality",
        "buddhism",
        "christian",
        "catholic",
        "theology",
        "devotional",
        "faith",
      ])
    ) {
      return "Religion";
    }

    if (
      hasPhrase(normalizedItems, [
        "philosophy",
        "ethics",
        "metaphysics",
        "logic",
      ])
    ) {
      return "Philosophy";
    }

    if (
      hasPhrase(normalizedItems, [
        "business",
        "management",
        "leadership",
        "economics",
        "finance",
        "marketing",
        "entrepreneurship",
      ])
    ) {
      return "Business";
    }

    if (
      hasPhrase(normalizedItems, [
        "self-help",
        "self help",
        "personal growth",
        "personal development",
        "motivation",
        "success",
        "productivity",
      ])
    ) {
      return "Self-help";
    }

    if (
      hasPhrase(normalizedItems, [
        "psychology",
        "mental health",
        "behavior",
        "behaviour",
      ])
    ) {
      return "Psychology";
    }

    if (
      hasPhrase(normalizedItems, [
        "history",
        "historical",
        "world war",
        "civilization",
        "ancient",
      ])
    ) {
      return "History";
    }

    if (
      hasPhrase(normalizedItems, [
        "politics",
        "political science",
        "government",
        "international relations",
      ])
    ) {
      return "Politics";
    }

    if (hasPhrase(normalizedItems, ["law", "legal", "jurisprudence"])) {
      return "Law";
    }

    if (hasPhrase(normalizedItems, ["travel", "tourism", "guidebook"])) {
      return "Travel";
    }

    if (hasPhrase(normalizedItems, ["sports", "athlete", "fitness sports"])) {
      return "Sports";
    }

    if (
      hasPhrase(normalizedItems, [
        "health",
        "wellness",
        "medicine",
        "medical",
        "nutrition",
      ])
    ) {
      return "Health & Wellness";
    }

    if (
      hasPhrase(normalizedItems, [
        "education",
        "study aids",
        "textbook",
        "academic",
        "school",
      ])
    ) {
      return "Academic";
    }

    if (
      hasPhrase(normalizedItems, [
        "children",
        "juvenile",
        "kids",
        "picture book",
      ])
    ) {
      return "Children";
    }

    if (hasPhrase(normalizedItems, ["young adult", "ya fiction", "ya"])) {
      return "Young Adult";
    }

    if (hasPhrase(normalizedItems, ["biography", "memoir", "autobiography"])) {
      return "Biography";
    }

    if (
      hasPhrase(normalizedItems, [
        "literary criticism",
        "literature",
        "essays",
        "literary",
      ])
    ) {
      return "Literature";
    }

    if (hasPhrase(normalizedItems, ["language", "linguistics", "grammar"])) {
      return "Language & Linguistics";
    }

    if (
      hasPhrase(normalizedItems, [
        "mathematics",
        "algebra",
        "geometry",
        "calculus",
      ])
    ) {
      return "Mathematics";
    }

    if (
      hasPhrase(normalizedItems, ["technology", "engineering", "technical"])
    ) {
      return "Technology";
    }

    if (
      hasPhrase(normalizedItems, [
        "art",
        "design",
        "drawing",
        "illustration",
        "architecture",
      ])
    ) {
      return "Art & Design";
    }

    if (
      hasPhrase(normalizedItems, [
        "comics",
        "graphic novels",
        "graphic novel",
        "comic books",
      ])
    ) {
      return "Comics & Graphic Novels";
    }

    if (
      hasPhrase(normalizedItems, [
        "cooking",
        "cookbook",
        "food",
        "culinary",
        "recipes",
      ])
    ) {
      return "Lifestyle";
    }

    if (
      hasPhrase(normalizedItems, [
        "fiction",
        "novels",
        "literary collections",
        "short stories",
      ])
    ) {
      return "Fiction";
    }

    if (
      hasPhrase(normalizedItems, [
        "nonfiction",
        "non-fiction",
        "essays",
        "reference",
      ])
    ) {
      return "Non-fiction";
    }

    return "";
  };

  const detectFallbackCategory = (text: string) => {
    const normalized = text.toLowerCase();

    if (
      [
        "buddha",
        "buddhist",
        "bible",
        "church",
        "theology",
        "spiritual",
        "faith",
        "devotional",
        "religion",
      ].some((word) => normalized.includes(word))
    ) {
      return "Religion";
    }

    if (
      [
        "cookbook",
        "recipe",
        "cooking",
        "braising",
        "culinary",
        "kitchen",
        "food",
      ].some((word) => normalized.includes(word))
    ) {
      return "Lifestyle";
    }

    if (
      [
        "leadership",
        "business",
        "finance",
        "management",
        "strategy",
        "influence",
        "entrepreneur",
      ].some((word) => normalized.includes(word))
    ) {
      return "Business";
    }

    if (
      [
        "self-help",
        "self help",
        "motivation",
        "productivity",
        "habits",
        "mindset",
        "confidence",
        "success",
      ].some((word) => normalized.includes(word))
    ) {
      return "Self-help";
    }

    if (
      [
        "programming",
        "software",
        "coding",
        "computer",
        "javascript",
        "python",
        "java",
      ].some((word) => normalized.includes(word))
    ) {
      return "Programming";
    }

    if (
      ["history", "historical", "empire", "civilization", "ancient"].some(
        (word) => normalized.includes(word),
      )
    ) {
      return "History";
    }

    if (
      ["biography", "memoir", "autobiography"].some((word) =>
        normalized.includes(word),
      )
    ) {
      return "Biography";
    }

    return "";
  };

  const detectGenreFromApiOrText = (apiItems: string[], text: string) => {
    const normalizedItems = apiItems.map((item) => item.toLowerCase());
    const normalizedText = text.toLowerCase();

    if (
      hasPhrase(normalizedItems, ["romance"]) ||
      ["romance", "romantic comedy", "love story"].some((word) =>
        normalizedText.includes(word),
      )
    ) {
      return "Romance";
    }

    if (
      hasPhrase(normalizedItems, ["mystery", "detective"]) ||
      ["mystery", "detective", "whodunit"].some((word) =>
        normalizedText.includes(word),
      )
    ) {
      return "Mystery";
    }

    if (
      hasPhrase(normalizedItems, ["fantasy"]) ||
      ["fantasy", "dragon", "magic", "magical"].some((word) =>
        normalizedText.includes(word),
      )
    ) {
      return "Fantasy";
    }

    if (
      hasPhrase(normalizedItems, ["horror"]) ||
      ["horror", "haunted", "ghost", "terror"].some((word) =>
        normalizedText.includes(word),
      )
    ) {
      return "Horror";
    }

    if (
      hasPhrase(normalizedItems, ["thriller", "suspense"]) ||
      ["thriller", "suspense", "psychological thriller"].some((word) =>
        normalizedText.includes(word),
      )
    ) {
      return "Thriller";
    }

    if (
      hasPhrase(normalizedItems, ["science fiction", "sci-fi", "scifi"]) ||
      ["science fiction", "sci-fi", "dystopian", "alien"].some((word) =>
        normalizedText.includes(word),
      )
    ) {
      return "Sci-Fi";
    }

    if (
      hasPhrase(normalizedItems, ["adventure"]) ||
      ["adventure"].some((word) => normalizedText.includes(word))
    ) {
      return "Adventure";
    }

    if (
      hasPhrase(normalizedItems, ["drama"]) ||
      ["drama"].some((word) => normalizedText.includes(word))
    ) {
      return "Drama";
    }

    return "";
  };

  const detectBookTypeFromApiOrText = (apiItems: string[], text: string) => {
    const normalizedItems = apiItems.map((item) => item.toLowerCase());
    const normalizedText = text.toLowerCase();

    if (
      hasPhrase(normalizedItems, ["manga"]) ||
      normalizedText.includes("manga")
    ) {
      return "Manga";
    }

    if (
      hasPhrase(normalizedItems, ["graphic novel", "graphic novels"]) ||
      normalizedText.includes("graphic novel")
    ) {
      return "Graphic Novel";
    }

    if (
      hasPhrase(normalizedItems, ["comics", "comic books", "comic book"]) ||
      normalizedText.includes("comic book") ||
      normalizedText.includes("comics")
    ) {
      return "Comics";
    }

    if (
      hasPhrase(normalizedItems, ["textbook", "study aids"]) ||
      normalizedText.includes("textbook")
    ) {
      return "Textbook";
    }

    if (
      normalizedText.includes("reviewer") ||
      normalizedText.includes("review book")
    ) {
      return "Reviewer";
    }

    if (
      normalizedText.includes("wattpad") ||
      normalizedText.includes("fanfiction") ||
      normalizedText.includes("wattys")
    ) {
      return "Wattpad";
    }

    return "";
  };

  const applyDetectedClassification = ({
    nextTitle = title,
    nextDescription = description,
    nextPublisher = publisher,
    nextApiCategories = apiCategories,
  }: {
    nextTitle?: string;
    nextDescription?: string;
    nextPublisher?: string;
    nextApiCategories?: string[];
  }) => {
    const combinedText = [
      nextTitle,
      nextDescription,
      nextPublisher,
      ...nextApiCategories,
    ]
      .join(" ")
      .toLowerCase();

    const mappedCategory =
      mapApiCategoryToLocalCategory(nextApiCategories) ||
      detectFallbackCategory(combinedText);

    const mappedGenre = detectGenreFromApiOrText(
      nextApiCategories,
      combinedText,
    );

    const mappedBookType = detectBookTypeFromApiOrText(
      nextApiCategories,
      combinedText,
    );

    setDetectedCategoryName(mappedCategory || "");
    setDetectedGenreName(mappedGenre || "");
    setDetectedBookTypeName(mappedBookType || "");

    if (!categoryTouched) {
      if (mappedCategory) {
        const matchedCategory = findByName(categories, mappedCategory);
        if (matchedCategory) {
          setCategoryId(String(matchedCategory.id));
        } else {
          setCategoryId("");
        }
      } else {
        setCategoryId("");
      }
    }

    if (!genreTouched) {
      if (mappedGenre) {
        const matchedGenre = findByName(genres, mappedGenre);
        if (matchedGenre) {
          setGenreId(String(matchedGenre.id));
        } else {
          setGenreId("");
        }
      } else {
        setGenreId("");
      }
    }

    if (!bookTypeTouched) {
      if (mappedBookType) {
        const matchedBookType = findByName(bookTypes, mappedBookType);
        if (matchedBookType) {
          setBookTypeId(String(matchedBookType.id));
        } else {
          setBookTypeId("");
        }
      } else {
        setBookTypeId("");
      }
    }
  };

  useEffect(() => {
    if (!categories.length || !genres.length || !bookTypes.length) return;

    const hasEnoughText =
      title.trim() ||
      description.trim() ||
      publisher.trim() ||
      apiCategories.length;

    if (!hasEnoughText) return;

    applyDetectedClassification({
      nextTitle: title,
      nextDescription: description,
      nextPublisher: publisher,
      nextApiCategories: apiCategories,
    });
  }, [
    categories,
    genres,
    bookTypes,
    title,
    description,
    publisher,
    apiCategories,
    categoryTouched,
    genreTouched,
    bookTypeTouched,
  ]);

  const applyAutofillBook = async (book: AutofillBook) => {
    const nextTitle = book.title ?? "";
    const nextAuthor = book.authors?.join(", ") ?? "";
    const nextDescription = book.description ?? "";
    const nextPublisher = book.publisher ?? "";
    const nextPublishedDate = book.publishedDate ?? "";
    const nextCategories = book.categories ?? [];
    const nextCoverUrls = book.coverUrls ?? [];

    setTitle(nextTitle);
    setAuthor(nextAuthor);
    setDescription(nextDescription);
    setPublisher(nextPublisher);
    setPublishedDate(nextPublishedDate);
    setApiCategories(nextCategories);

    setCoverCandidates(nextCoverUrls);
    setCoverIndex(0);
    setFetchedCover(nextCoverUrls[0] || "");

    applyDetectedClassification({
      nextTitle,
      nextDescription,
      nextPublisher,
      nextApiCategories: nextCategories,
    });
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
      setDetectedCategoryName("");
      setDetectedGenreName("");
      setDetectedBookTypeName("");

      const googleBook = await fetchFromGoogleBooks(normalizedIsbn);
      if (googleBook) {
        await applyAutofillBook(googleBook);
        showToast({
          title: "Book details filled",
          message: "Book details were autofilled from Google Books.",
          type: "success",
        });
        return;
      }

      const openLibraryBook = await fetchFromOpenLibrary(normalizedIsbn);
      if (openLibraryBook) {
        await applyAutofillBook(openLibraryBook);
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

    if (!categoryId) {
      showToast({
        title: "Category required",
        message: "Please select a category.",
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

    if (normalizedCustomCoverUrl) {
      imageUrl = normalizedCustomCoverUrl;
    }

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

    const { error } = await supabase.from("books").insert([
      {
        seller_id: user.id,
        category_id: Number(categoryId),
        genre_id: genreId ? Number(genreId) : null,
        book_type_id: bookTypeId ? Number(bookTypeId) : null,
        isbn: cleanedIsbn || null,
        title,
        author,
        publisher: publisher || null,
        published_date: publishedDate || null,
        description,
        price: parsedPrice,
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
    setGenreId("");
    setBookTypeId("");
    setFetchedCover("");
    setCustomCoverUrl("");
    setCoverCandidates([]);
    setCoverIndex(0);
    setImageFile(null);
    setApiCategories([]);
    setStockQuantity("1");
    setDetectedCategoryName("");
    setDetectedGenreName("");
    setDetectedBookTypeName("");
    setCategoryTouched(false);
    setGenreTouched(false);
    setBookTypeTouched(false);
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
            adjust, and publish your listing with a proper category, genre, and
            type.
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

                {(selectedGenreName || detectedGenreName) && (
                  <p className="mt-2 text-sm text-[#6B6B6B]">
                    Suggested genre:{" "}
                    <span className="font-semibold text-[#1F1F1F]">
                      {selectedGenreName || detectedGenreName}
                    </span>
                  </p>
                )}

                {(selectedBookTypeName || detectedBookTypeName) && (
                  <p className="mt-1 text-sm text-[#6B6B6B]">
                    Suggested type:{" "}
                    <span className="font-semibold text-[#1F1F1F]">
                      {selectedBookTypeName || detectedBookTypeName}
                    </span>
                  </p>
                )}

                {(selectedCategoryName || detectedCategoryName) && (
                  <p className="mt-1 text-sm text-[#6B6B6B]">
                    Suggested category:{" "}
                    <span className="font-semibold text-[#1F1F1F]">
                      {selectedCategoryName || detectedCategoryName}
                    </span>
                  </p>
                )}
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
                className="h-[52px] rounded-2xl bg-[#E67E22] px-5 font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-50"
              >
                {lookupLoading ? "Looking up..." : "Autofill"}
              </button>
            </div>

            <div className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="min-w-0">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <BookOpen size={16} className="shrink-0" />
                    <span>Book Title</span>
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

                <div className="min-w-0">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <User size={16} className="shrink-0" />
                    <span>Author</span>
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
                <div className="min-w-0">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <Building2 size={16} className="shrink-0" />
                    <span>Publisher</span>
                  </label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Publisher"
                    className={inputClass}
                  />
                </div>

                <div className="min-w-0">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <CalendarDays size={16} className="shrink-0" />
                    <span>Published Date</span>
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

              <div className="grid gap-5 md:grid-cols-2">
                <div className="min-w-0">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <Tag size={16} className="shrink-0" />
                    <span>Genre</span>
                    <span className="text-xs text-[#8A8175]">(Optional)</span>
                  </label>
                  <select
                    value={genreId}
                    onChange={(e) => {
                      setGenreTouched(true);
                      setGenreId(e.target.value);
                    }}
                    className={selectClass}
                  >
                    <option value="">Select genre (optional)</option>
                    {genres.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <Shapes size={16} className="shrink-0" />
                    <span>Book Type</span>
                    <span className="text-xs text-[#8A8175]">(Optional)</span>
                  </label>
                  <select
                    value={bookTypeId}
                    onChange={(e) => {
                      setBookTypeTouched(true);
                      setBookTypeId(e.target.value);
                    }}
                    className={selectClass}
                  >
                    <option value="">Select type (optional)</option>
                    {bookTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="min-w-0">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                  <Library size={16} className="shrink-0" />
                  <span>Category</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryTouched(true);
                    setCategoryId(e.target.value);
                  }}
                  className={selectClass}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                  <FileText size={16} className="shrink-0" />
                  <span>Description</span>
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
                <div className="min-w-0">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <BadgeDollarSign size={16} className="shrink-0" />
                    <span>Price</span>
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

                <div className="min-w-0">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <Package size={16} className="shrink-0" />
                    <span>Stock Quantity</span>
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
                <div className="min-w-0">
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

                <div className="min-w-0">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <MapPin size={16} className="shrink-0" />
                    <span>Location</span>
                  </label>
                  <input
                    type="text"
                    list="location-suggestions"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Choose or type your location"
                    className={inputClass}
                    required
                  />
                  <datalist id="location-suggestions">
                    {locationSuggestions.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="min-w-0">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <ImagePlus size={16} className="shrink-0" />
                    <span>Upload Book Image</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="block h-[52px] w-full rounded-2xl border border-[#DED8CF] bg-white px-4 py-2 text-sm text-[#5F5A52] file:mr-4 file:rounded-full file:border-0 file:bg-[#E67E22] file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-[#cf6f1c]"
                  />
                  <p className="mt-2 text-xs leading-6 text-[#8A8175]">
                    Use this for photos of the actual book, especially for used
                    books.
                  </p>
                </div>

                <div className="min-w-0">
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <Link2 size={16} className="shrink-0" />
                    <span>Custom Cover URL</span>
                  </label>
                  <input
                    type="url"
                    value={customCoverUrl}
                    onChange={(e) => setCustomCoverUrl(e.target.value)}
                    placeholder="Paste a clearer image URL here"
                    className={inputClass}
                  />
                  <p className="mt-2 text-xs leading-6 text-[#8A8175]">
                    Use this if a cover photo is missing or if the public ISBN
                    image is blurry.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#F7F4EE] p-4 text-sm leading-7 text-[#6B6B6B]">
                BookBazaar applies a 4% platform commission per sale. If you set
                your book price at{" "}
                <span className="font-semibold text-[#1F1F1F]">₱100</span>, the
                buyer will see{" "}
                <span className="font-semibold text-[#1F1F1F]">₱100</span>, and
                you will receive{" "}
                <span className="font-semibold text-[#E67E22]">₱96</span> after
                the sale.
              </div>

              <button
                type="submit"
                disabled={posting}
                className="w-full rounded-full bg-[#E67E22] px-6 py-3 font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-50"
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
                ) : normalizedCustomCoverUrl ? (
                  <img
                    src={normalizedCustomCoverUrl}
                    alt={title || "Custom cover"}
                    className="h-72 w-full object-contain bg-[#F7F4EE]"
                    onError={() => setCustomCoverUrl("")}
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
                    {price ? `₱${Number(price).toFixed(2)}` : "₱0.00"}
                  </p>
                  {!!price && (
                    <p className="mt-2 text-sm text-[#8A8175]">
                      You will receive ₱{(Number(price) * 0.96).toFixed(2)}{" "}
                      after 4% commission
                    </p>
                  )}
                  <p className="mt-2 break-words text-sm text-[#8A8175]">
                    {location || "Location"}
                  </p>
                  <p className="mt-2 break-words text-sm text-[#8A8175]">
                    Stock: {stockQuantity || "0"}
                  </p>
                  <p className="mt-2 break-words text-sm text-[#8A8175]">
                    Genre:{" "}
                    {selectedGenreName || detectedGenreName || "Not selected"}
                  </p>
                  <p className="mt-2 break-words text-sm text-[#8A8175]">
                    Type:{" "}
                    {selectedBookTypeName ||
                      detectedBookTypeName ||
                      "Not selected"}
                  </p>
                  <p className="mt-2 break-words text-sm text-[#8A8175]">
                    Category:{" "}
                    {selectedCategoryName ||
                      detectedCategoryName ||
                      "Not selected"}
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
