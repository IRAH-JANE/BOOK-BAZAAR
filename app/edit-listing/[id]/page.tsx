"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
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
  ScanSearch,
  ImagePlus,
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

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

function EditListingPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 text-[#1F1F1F] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <SkeletonBox className="h-10 w-44 rounded-full" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[28px] border border-[#E5E0D8] bg-white p-8 shadow-sm">
            <SkeletonBox className="mb-6 h-20 w-full rounded-3xl" />
            <SkeletonBox className="mb-6 h-12 w-full rounded-2xl" />
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <SkeletonBox className="h-12 w-full rounded-2xl" />
                <SkeletonBox className="h-12 w-full rounded-2xl" />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <SkeletonBox className="h-12 w-full rounded-2xl" />
                <SkeletonBox className="h-12 w-full rounded-2xl" />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <SkeletonBox className="h-12 w-full rounded-2xl" />
                <SkeletonBox className="h-12 w-full rounded-2xl" />
              </div>
              <SkeletonBox className="h-12 w-full rounded-2xl" />
              <SkeletonBox className="h-32 w-full rounded-2xl" />
              <div className="grid gap-5 md:grid-cols-2">
                <SkeletonBox className="h-12 w-full rounded-2xl" />
                <SkeletonBox className="h-12 w-full rounded-2xl" />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <SkeletonBox className="h-12 w-full rounded-2xl" />
                <SkeletonBox className="h-12 w-full rounded-2xl" />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <SkeletonBox className="h-12 w-full rounded-2xl" />
                <SkeletonBox className="h-12 w-full rounded-2xl" />
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-8 shadow-sm">
              <SkeletonBox className="h-6 w-44" />
              <SkeletonBox className="mt-6 h-72 w-full rounded-3xl" />
              <SkeletonBox className="mt-5 h-8 w-3/4" />
              <SkeletonBox className="mt-3 h-4 w-1/2" />
              <SkeletonBox className="mt-3 h-6 w-32" />
            </div>

            <div className="rounded-[28px] border border-[#E5E0D8] bg-white p-8 shadow-sm">
              <SkeletonBox className="h-6 w-52" />
              <div className="mt-5 space-y-3">
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

function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const supabase = createSupabaseBrowser();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [isbn, setIsbn] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [stockQuantity, setStockQuantity] = useState("1");

  const [categoryId, setCategoryId] = useState("");
  const [genreId, setGenreId] = useState("");
  const [bookTypeId, setBookTypeId] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [bookTypes, setBookTypes] = useState<BookType[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const [fetchedCover, setFetchedCover] = useState("");
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [apiCategories, setApiCategories] = useState<string[]>([]);
  const [coverCandidates, setCoverCandidates] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  const [detectedCategoryName, setDetectedCategoryName] = useState("");
  const [detectedGenreName, setDetectedGenreName] = useState("");
  const [detectedBookTypeName, setDetectedBookTypeName] = useState("");

  const [categoryTouched, setCategoryTouched] = useState(false);
  const [genreTouched, setGenreTouched] = useState(false);
  const [bookTypeTouched, setBookTypeTouched] = useState(false);

  const cleanedIsbn = useMemo(() => isbn.replace(/[^0-9Xx]/g, ""), [isbn]);

  const localImagePreview = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (localImagePreview) URL.revokeObjectURL(localImagePreview);
    };
  }, [localImagePreview]);

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

  const inputClass =
    "h-[52px] w-full rounded-2xl border border-[#DED8CF] bg-white px-4 text-[15px] text-[#5F5A52] placeholder:text-[#8A8175] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]";

  const textareaClass =
    "w-full rounded-2xl border border-[#DED8CF] bg-white px-4 py-3 text-[15px] text-[#5F5A52] placeholder:text-[#8A8175] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]";

  const selectClass =
    "h-[52px] w-full appearance-none rounded-2xl border border-[#DED8CF] bg-white px-4 pr-10 text-[15px] text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]";

  const locationSuggestions = [
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
    }

    if (!genresRes.error && genresRes.data) {
      const sortedGenres = sortByName(genresRes.data);
      setGenres(sortedGenres);
    }

    if (!bookTypesRes.error && bookTypesRes.data) {
      const sortedBookTypes = sortByName(bookTypesRes.data);
      setBookTypes(sortedBookTypes);
    }
  }, [supabase]);

  useEffect(() => {
    loadLookups();
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
        setCategoryId(matchedCategory ? String(matchedCategory.id) : "");
      } else {
        setCategoryId("");
      }
    }

    if (!genreTouched) {
      if (mappedGenre) {
        const matchedGenre = findByName(genres, mappedGenre);
        setGenreId(matchedGenre ? String(matchedGenre.id) : "");
      } else {
        setGenreId("");
      }
    }

    if (!bookTypeTouched) {
      if (mappedBookType) {
        const matchedBookType = findByName(bookTypes, mappedBookType);
        setBookTypeId(matchedBookType ? String(matchedBookType.id) : "");
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

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
      setPrice(book.price ? String(book.price) : "");
      setCondition(book.condition || "");
      setLocation(book.location || "");
      setImageUrl(book.image_url || "");
      setFetchedCover(book.image_url || "");
      setCategoryId(book.category_id ? String(book.category_id) : "");
      setGenreId(book.genre_id ? String(book.genre_id) : "");
      setBookTypeId(book.book_type_id ? String(book.book_type_id) : "");
      setIsbn(book.isbn || "");
      setPublisher(book.publisher || "");
      setPublishedDate(book.published_date || "");
      setStockQuantity(book.stock_quantity ? String(book.stock_quantity) : "1");
      setCustomCoverUrl(book.image_url || "");

      setCategoryTouched(!!book.category_id);
      setGenreTouched(!!book.genre_id);
      setBookTypeTouched(!!book.book_type_id);

      setLoading(false);
    };

    fetchData();
  }, [id, router, showToast, supabase]);

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
    setImageUrl(nextCoverUrls[0] || "");

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
      setDetectedCategoryName("");
      setDetectedGenreName("");
      setDetectedBookTypeName("");
      setCoverCandidates([]);
      setCoverIndex(0);

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
      setImageUrl(coverCandidates[nextIndex]);
      return;
    }
    setFetchedCover("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const parsedPrice = Number(price);
    const parsedStock = Number(stockQuantity);

    if (!parsedPrice || parsedPrice <= 0) {
      showToast({
        title: "Invalid price",
        message: "Please enter a valid price.",
        type: "error",
      });
      setSaving(false);
      return;
    }

    if (!parsedStock || parsedStock < 1) {
      showToast({
        title: "Invalid stock quantity",
        message: "Stock quantity must be at least 1.",
        type: "error",
      });
      setSaving(false);
      return;
    }

    if (!categoryId) {
      showToast({
        title: "Category required",
        message: "Please select a category.",
        type: "error",
      });
      setSaving(false);
      return;
    }

    let finalImageUrl = imageUrl || fetchedCover || "";

    if (normalizedCustomCoverUrl) {
      finalImageUrl = normalizedCustomCoverUrl;
    }

    if (imageFile) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        showToast({
          title: "Login required",
          message: "You must be logged in to update a listing image.",
          type: "error",
        });
        setSaving(false);
        return;
      }

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
        setSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("book-images")
        .getPublicUrl(filePath);

      finalImageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("books")
      .update({
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
        image_url: finalImageUrl || null,
        stock_quantity: parsedStock,
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

  if (loading) {
    return <EditListingPageSkeleton />;
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 text-[#1F1F1F] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
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

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <form
            onSubmit={handleUpdate}
            className="rounded-[28px] border border-[#E5E0D8] bg-white p-8 shadow-sm"
          >
            <div className="mb-8 flex items-start gap-4 rounded-3xl bg-[#FFF7EF] p-5">
              <div className="mt-1 rounded-2xl bg-white p-3 text-[#E67E22] shadow-sm">
                <PencilLine size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1F1F1F]">
                  Edit Listing
                </h1>
                <p className="mt-2 text-sm leading-7 text-[#6B6B6B]">
                  Update your listing using the same connected fields as the
                  sell page so your book details stay complete and consistent.
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
                    Upload a new image only if you want to replace the current
                    book cover.
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
                    Use this if you want to replace the current cover using a
                    direct image link.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#F7F4EE] p-4 text-sm leading-7 text-[#6B6B6B]">
                BookBazaar applies a 4% platform commission per sale. If your
                listing price is{" "}
                <span className="font-semibold text-[#1F1F1F]">₱100</span>, you
                will receive{" "}
                <span className="font-semibold text-[#E67E22]">₱96</span> after
                the sale.
              </div>

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
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title || "Book cover preview"}
                    className="h-72 w-full object-contain bg-[#F7F4EE]"
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
                Editing Tips
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-[#6B6B6B]">
                <li>
                  • Keep book details consistent with your sell page fields
                </li>
                <li>• Use ISBN autofill when you want faster corrections</li>
                <li>• Replace blurry covers with upload or custom URL</li>
                <li>• Update stock, category, genre, and type properly</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
