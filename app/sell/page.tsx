"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Link2,
} from "lucide-react";

type Category = {
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
  subtitle?: string;
  authors: string[];
  description: string;
  publisher: string;
  publishedDate: string;
  categories: string[];
  coverUrls: string[];
};

type AIPredictionResponse = {
  category: string | null;
  subgenres: string[];
  confidence: number;
};

export default function SellPage() {
  const { showToast } = useToast();

  const [subgenres, setSubgenres] = useState<string[]>([]);

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
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const [googleCategories, setGoogleCategories] = useState<string[]>([]);
  const [stockQuantity, setStockQuantity] = useState("1");

  const [coverCandidates, setCoverCandidates] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [detectedCategoryName, setDetectedCategoryName] = useState("");
  const [categoryTouched, setCategoryTouched] = useState(false);

  const aiDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const cleanedIsbn = useMemo(() => isbn.replace(/[^0-9Xx]/g, ""), [isbn]);

  const localImagePreview = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  const normalizedCustomCoverUrl = useMemo(() => {
    const trimmed = customCoverUrl.trim();
    if (!trimmed) return "";
    return trimmed.replace("http://", "https://");
  }, [customCoverUrl]);

  useEffect(() => {
    return () => {
      if (localImagePreview) {
        URL.revokeObjectURL(localImagePreview);
      }
    };
  }, [localImagePreview]);

  useEffect(() => {
    return () => {
      if (aiDebounceRef.current) {
        clearTimeout(aiDebounceRef.current);
      }
    };
  }, []);

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

  const normalizeText = (value: string | null | undefined) => {
    return (value || "").toLowerCase().trim();
  };

  const hasAnyKeyword = (text: string, keywords: string[]) => {
    return keywords.some((keyword) => text.includes(keyword));
  };

  const detectBookCategoryName = ({
    sourceCategories = [],
    bookTitle = "",
    bookSubtitle = "",
    bookDescription = "",
    bookAuthor = "",
    bookPublisher = "",
  }: {
    sourceCategories?: string[];
    bookTitle?: string;
    bookSubtitle?: string;
    bookDescription?: string;
    bookAuthor?: string;
    bookPublisher?: string;
  }) => {
    const combinedText = [
      ...sourceCategories,
      bookTitle,
      bookSubtitle,
      bookDescription,
      bookAuthor,
      bookPublisher,
    ]
      .join(" ")
      .toLowerCase();

    if (!combinedText.trim()) {
      return "Non-fiction";
    }

    if (
      hasAnyKeyword(combinedText, [
        "wattpad",
        "wattys",
        "fanfiction",
        "online story",
        "online stories",
        "campus romance",
        "teen fiction",
        "viral story",
        "published on wattpad",
        "wattpad sensation",
      ])
    ) {
      return "Wattpad";
    }

    if (
      hasAnyKeyword(combinedText, [
        "manga",
        "comic",
        "comics",
        "graphic novel",
        "graphic novels",
        "manhwa",
        "webtoon",
        "illustrated novel",
      ])
    ) {
      return "Manga / Comics";
    }

    if (
      hasAnyKeyword(combinedText, [
        "programming",
        "computer",
        "computers",
        "coding",
        "software",
        "web development",
        "javascript",
        "typescript",
        "python",
        "java",
        "c++",
        "c#",
        "php",
        "database",
        "sql",
        "cybersecurity",
        "networking",
        "information technology",
        "data structures",
        "algorithms",
        "developer",
        "computer science",
      ])
    ) {
      return "Programming";
    }

    if (
      hasAnyKeyword(combinedText, [
        "engineering",
        "civil engineering",
        "mechanical engineering",
        "electrical engineering",
        "electronics engineering",
        "industrial engineering",
        "engineering drawing",
        "thermodynamics",
        "strength of materials",
      ])
    ) {
      return "Academic";
    }

    if (
      hasAnyKeyword(combinedText, [
        "mathematics",
        "math",
        "algebra",
        "geometry",
        "calculus",
        "statistics",
        "trigonometry",
        "quantitative",
        "mathematical",
      ])
    ) {
      return "Academic";
    }

    if (
      hasAnyKeyword(combinedText, [
        "biology",
        "chemistry",
        "physics",
        "earth science",
        "life science",
        "general science",
        "scientific",
        "laboratory",
        "astronomy",
        "environmental science",
      ])
    ) {
      return "Science";
    }

    if (
      hasAnyKeyword(combinedText, [
        "medical",
        "medicine",
        "nursing",
        "anatomy",
        "physiology",
        "pharmacology",
        "clinical",
        "health care",
        "healthcare",
        "pathology",
        "surgery",
        "diagnosis",
      ])
    ) {
      return "Science";
    }

    if (
      hasAnyKeyword(combinedText, [
        "law",
        "legal",
        "jurisprudence",
        "constitution",
        "criminal law",
        "civil law",
        "political law",
        "revised penal code",
        "evidence",
        "taxation law",
      ])
    ) {
      return "Academic";
    }

    if (
      hasAnyKeyword(combinedText, [
        "psychology",
        "mental health",
        "behavior",
        "behaviour",
        "cognitive",
        "personality",
        "therapy",
        "counseling",
        "emotions",
      ])
    ) {
      return "Non-fiction";
    }

    if (
      hasAnyKeyword(combinedText, [
        "religion",
        "christian",
        "catholic",
        "bible",
        "theology",
        "faith",
        "spirituality",
        "church",
        "prayer",
        "devotional",
        "ministry",
      ])
    ) {
      return "Religion";
    }

    if (
      hasAnyKeyword(combinedText, [
        "business",
        "entrepreneurship",
        "marketing",
        "finance",
        "economics",
        "management",
        "leadership",
        "startup",
        "accounting",
        "investing",
        "sales",
        "business & economics",
      ])
    ) {
      return "Business";
    }

    if (
      hasAnyKeyword(combinedText, [
        "self-help",
        "self help",
        "motivation",
        "motivational",
        "productivity",
        "personal growth",
        "success",
        "habits",
        "mindset",
        "discipline",
      ])
    ) {
      return "Self-help";
    }

    if (
      hasAnyKeyword(combinedText, [
        "biography",
        "memoir",
        "autobiography",
        "life of",
        "personal account",
        "memories",
      ])
    ) {
      return "Non-fiction";
    }

    if (
      hasAnyKeyword(combinedText, [
        "history",
        "historical account",
        "world war",
        "ancient",
        "civilization",
        "philippine history",
        "historian",
      ])
    ) {
      return "History";
    }

    if (
      hasAnyKeyword(combinedText, [
        "poetry",
        "poems",
        "poet",
        "verse",
        "sonnet",
        "spoken word",
        "collection of poems",
      ])
    ) {
      return "Fiction";
    }

    if (
      hasAnyKeyword(combinedText, [
        "children",
        "kids",
        "storybook",
        "picture book",
        "bedtime story",
        "juvenile",
        "early reader",
        "ages 3-5",
        "ages 6-8",
        "children's books",
      ])
    ) {
      return "Children";
    }

    if (
      hasAnyKeyword(combinedText, [
        "young adult",
        "ya fiction",
        "teen",
        "coming of age",
        "adolescent",
        "high school",
      ])
    ) {
      return "Fiction";
    }

    if (
      hasAnyKeyword(combinedText, [
        "romance",
        "love story",
        "falling in love",
        "heartbreak",
        "relationship",
        "boyfriend",
        "girlfriend",
        "romantic",
      ])
    ) {
      return "Romance";
    }

    if (
      hasAnyKeyword(combinedText, [
        "mystery",
        "thriller",
        "crime",
        "detective",
        "suspense",
        "investigation",
        "serial killer",
        "murder",
      ])
    ) {
      return "Mystery";
    }

    if (
      hasAnyKeyword(combinedText, [
        "fantasy",
        "magic",
        "sorcery",
        "dragon",
        "kingdom",
        "fae",
        "mythical",
        "enchanted",
      ])
    ) {
      return "Fantasy";
    }

    if (
      hasAnyKeyword(combinedText, [
        "science fiction",
        "sci-fi",
        "scifi",
        "space",
        "alien",
        "robot",
        "future world",
        "dystopian",
        "utopian",
      ])
    ) {
      return "Fiction";
    }

    if (
      hasAnyKeyword(combinedText, [
        "horror",
        "ghost",
        "haunted",
        "monster",
        "paranormal",
        "demon",
        "terror",
        "supernatural horror",
      ])
    ) {
      return "Fiction";
    }

    if (
      hasAnyKeyword(combinedText, [
        "historical fiction",
        "period fiction",
        "wartime fiction",
        "set in world war",
        "set in the 18th century",
        "set in the 19th century",
      ])
    ) {
      return "Fiction";
    }

    if (
      hasAnyKeyword(combinedText, [
        "textbook",
        "reviewer",
        "review book",
        "study guide",
        "curriculum",
        "education",
        "educational",
        "school",
        "lesson",
        "course",
        "exam prep",
        "board exam",
        "reference",
      ])
    ) {
      return "Academic";
    }

    if (
      hasAnyKeyword(combinedText, [
        "non-fiction",
        "nonfiction",
        "essay",
        "essays",
        "documentary",
        "true story",
        "real life",
      ])
    ) {
      return "Non-fiction";
    }

    if (
      hasAnyKeyword(combinedText, [
        "fiction",
        "novel",
        "literary fiction",
        "contemporary fiction",
        "short stories",
        "story",
        "drama",
      ])
    ) {
      return "Fiction";
    }

    return "Non-fiction";
  };

  const detectFallbackSubgenres = ({
    category = "",
    bookTitle = "",
    bookDescription = "",
    bookPublisher = "",
  }: {
    category?: string;
    bookTitle?: string;
    bookDescription?: string;
    bookPublisher?: string;
  }) => {
    const text =
      `${bookTitle} ${bookDescription} ${bookPublisher}`.toLowerCase();
    const tags: string[] = [];

    const addTag = (tag: string) => {
      if (!tags.includes(tag)) tags.push(tag);
    };

    if (
      hasAnyKeyword(text, [
        "memoir",
        "autobiography",
        "true story",
        "real life",
        "personal story",
      ])
    ) {
      addTag("Memoir");
    }

    if (
      hasAnyKeyword(text, [
        "biography",
        "biographical",
        "life of",
        "based on a real person",
      ])
    ) {
      addTag("Biography");
    }

    if (
      hasAnyKeyword(text, [
        "history",
        "historical",
        "world war",
        "wwii",
        "wwi",
        "president",
        "century",
      ])
    ) {
      addTag("History");
    }

    if (
      hasAnyKeyword(text, [
        "true crime",
        "crime case",
        "murder case",
        "real murder",
      ])
    ) {
      addTag("True Crime");
    }

    if (
      hasAnyKeyword(text, [
        "adventure",
        "survival",
        "journey",
        "expedition",
        "exploration",
      ])
    ) {
      addTag("Adventure");
    }

    if (
      hasAnyKeyword(text, [
        "mountain",
        "mountaineering",
        "everest",
        "climb",
        "climber",
        "summit",
      ])
    ) {
      addTag("Mountaineering");
    }

    if (
      hasAnyKeyword(text, [
        "psychology",
        "decision making",
        "behavior",
        "behaviour",
        "mind",
        "thinking",
        "cognitive",
        "bias",
      ])
    ) {
      addTag("Psychology");
    }

    if (
      hasAnyKeyword(text, [
        "personal development",
        "self improvement",
        "growth mindset",
        "personal growth",
      ])
    ) {
      addTag("Personal Development");
    }

    if (
      hasAnyKeyword(text, [
        "productivity",
        "focus",
        "discipline",
        "deep work",
        "time management",
      ])
    ) {
      addTag("Productivity");
    }

    if (
      hasAnyKeyword(text, ["habit", "habits", "routine", "behavior change"])
    ) {
      addTag("Habits");
    }

    if (
      hasAnyKeyword(text, [
        "startup",
        "startups",
        "founder",
        "entrepreneur",
        "entrepreneurship",
        "lean startup",
      ])
    ) {
      addTag("Startup");
    }

    if (
      hasAnyKeyword(text, ["leadership", "leader", "leading", "management"])
    ) {
      addTag("Leadership");
    }

    if (
      hasAnyKeyword(text, [
        "innovation",
        "innovative",
        "disruption",
        "new ideas",
      ])
    ) {
      addTag("Innovation");
    }

    if (
      hasAnyKeyword(text, [
        "finance",
        "money",
        "wealth",
        "investing",
        "financial",
        "income",
        "assets",
      ])
    ) {
      addTag("Finance");
    }

    if (hasAnyKeyword(text, ["young adult", "teen", "high school"])) {
      addTag("Young Adult");
    }

    if (hasAnyKeyword(text, ["magic", "wizard", "spell", "sorcery"])) {
      addTag("Magic");
    }

    if (hasAnyKeyword(text, ["dragon", "kingdom", "quest", "throne"])) {
      addTag("Epic Fantasy");
    }

    if (hasAnyKeyword(text, ["detective", "clue", "investigator", "case"])) {
      addTag("Detective");
    }

    if (hasAnyKeyword(text, ["thriller", "suspense", "serial killer"])) {
      addTag("Thriller");
    }

    if (hasAnyKeyword(text, ["manga", "volume", "mangaka"])) {
      addTag("Manga");
    }

    if (hasAnyKeyword(text, ["comic", "comics", "graphic novel"])) {
      addTag("Comics");
    }

    if (category === "Business" && tags.length === 0) {
      addTag("Business");
    }

    return tags.slice(0, 5);
  };

  const findMatchingCategoryId = (
    detectedName: string,
    dbCategories: Category[] = categories,
  ) => {
    if (!dbCategories.length || !detectedName) return "";

    const normalizedDetected = normalizeText(detectedName);

    const exactMatch = dbCategories.find(
      (category) => normalizeText(category.name) === normalizedDetected,
    );

    if (exactMatch) {
      return String(exactMatch.id);
    }

    const aliasMap: Record<string, string[]> = {
      Academic: ["academic", "school books", "textbooks", "reviewers"],
      Fiction: ["novels", "fiction books"],
      "Non-fiction": [
        "nonfiction",
        "general non-fiction",
        "general nonfiction",
      ],
      Romance: ["romance books"],
      Mystery: ["mystery books", "thriller", "crime thriller"],
      Fantasy: ["fantasy books"],
      Children: ["children", "kids books", "juvenile books"],
      "Self-help": ["self help", "personal development"],
      Business: ["business books", "finance", "management"],
      Religion: ["religious books", "christian books", "catholic books"],
      Programming: ["computers", "computer", "programming books", "it books"],
      Science: ["science books", "medical books", "medicine"],
      History: ["history books"],
      "Manga / Comics": ["manga", "comics", "graphic novels"],
      Wattpad: ["wattpad", "wattpad books", "wattpad stories"],
    };

    const aliases = aliasMap[detectedName] || [];

    const aliasMatch = dbCategories.find((category) => {
      const normalizedCategoryName = normalizeText(category.name);

      return aliases.some(
        (alias) => normalizedCategoryName === normalizeText(alias),
      );
    });

    if (aliasMatch) {
      return String(aliasMatch.id);
    }

    const partialMatch = dbCategories.find((category) => {
      const name = normalizeText(category.name);
      return (
        name.includes(normalizedDetected) || normalizedDetected.includes(name)
      );
    });

    return partialMatch ? String(partialMatch.id) : "";
  };

  const getAICategoryPrediction = async (
    bookTitle: string,
    bookDescription: string,
  ): Promise<AIPredictionResponse | null> => {
    try {
      const response = await fetch("http://localhost:8000/predict-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: bookTitle,
          description: bookDescription,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as AIPredictionResponse;
      return data;
    } catch (error) {
      console.error("AI prediction failed:", error);
      return null;
    }
  };

  const runCategoryPrediction = async ({
    nextTitle = title,
    nextDescription = description,
    nextAuthor = author,
    nextPublisher = publisher,
    nextGoogleCategories = googleCategories,
    nextSubtitle = "",
    skipIfTouched = true,
  }: {
    nextTitle?: string;
    nextDescription?: string;
    nextAuthor?: string;
    nextPublisher?: string;
    nextGoogleCategories?: string[];
    nextSubtitle?: string;
    skipIfTouched?: boolean;
  }) => {
    if (!categories.length) return;
    if (skipIfTouched && categoryTouched) return;

    const hasEnoughText =
      nextTitle.trim() ||
      nextDescription.trim() ||
      nextAuthor.trim() ||
      nextPublisher.trim() ||
      nextGoogleCategories.length;

    if (!hasEnoughText) {
      setDetectedCategoryName("");
      setSubgenres([]);
      return;
    }

    const aiResult = await getAICategoryPrediction(nextTitle, nextDescription);

    if (aiResult?.category) {
      const matchedId = findMatchingCategoryId(aiResult.category, categories);

      setDetectedCategoryName(aiResult.category);
      setSubgenres(aiResult.subgenres || []);

      if (matchedId) {
        setCategoryId(matchedId);
        return;
      }
    }

    const fallbackDetectedName = detectBookCategoryName({
      sourceCategories: nextGoogleCategories,
      bookTitle: nextTitle,
      bookSubtitle: nextSubtitle,
      bookDescription: nextDescription,
      bookAuthor: nextAuthor,
      bookPublisher: nextPublisher,
    });

    const fallbackMatchedId = findMatchingCategoryId(
      fallbackDetectedName,
      categories,
    );

    const fallbackSubgenres = detectFallbackSubgenres({
      category: fallbackDetectedName,
      bookTitle: nextTitle,
      bookDescription: nextDescription,
      bookPublisher: nextPublisher,
    });

    setDetectedCategoryName(fallbackDetectedName);
    setSubgenres(fallbackSubgenres);

    if (fallbackMatchedId) {
      setCategoryId(fallbackMatchedId);
    }
  };

  useEffect(() => {
    if (!categories.length) return;
    if (categoryTouched) return;

    const hasEnoughText =
      title.trim() ||
      description.trim() ||
      author.trim() ||
      publisher.trim() ||
      googleCategories.length;

    if (!hasEnoughText) return;

    if (aiDebounceRef.current) {
      clearTimeout(aiDebounceRef.current);
    }

    aiDebounceRef.current = setTimeout(() => {
      runCategoryPrediction({
        nextTitle: title,
        nextDescription: description,
        nextAuthor: author,
        nextPublisher: publisher,
        nextGoogleCategories: googleCategories,
      });
    }, 600);

    return () => {
      if (aiDebounceRef.current) {
        clearTimeout(aiDebounceRef.current);
      }
    };
  }, [
    title,
    description,
    author,
    publisher,
    googleCategories,
    categories,
    categoryTouched,
  ]);

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
      subtitle: info.subtitle ?? "",
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
      subtitle: "",
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

  const applyAutofillBook = async (book: AutofillBook) => {
    const nextTitle = book.title ?? "";
    const nextSubtitle = book.subtitle ?? "";
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
    setGoogleCategories(nextCategories);

    setCoverCandidates(nextCoverUrls);
    setCoverIndex(0);
    setFetchedCover(nextCoverUrls[0] || "");

    await runCategoryPrediction({
      nextTitle,
      nextDescription,
      nextAuthor,
      nextPublisher,
      nextGoogleCategories: nextCategories,
      nextSubtitle,
      skipIfTouched: true,
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
      setSubgenres([]);

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

    const finalPrice = parsedPrice;

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
        subgenres: subgenres,
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
    setCustomCoverUrl("");
    setCoverCandidates([]);
    setCoverIndex(0);
    setImageFile(null);
    setGoogleCategories([]);
    setStockQuantity("1");
    setDetectedCategoryName("");
    setCategoryTouched(false);
    setSubgenres([]);
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
            adjust, upload your own image if needed, publish the listing, or
            paste your own cover URL if the public cover looks blurry.
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

                {detectedCategoryName && (
                  <p className="mt-2 text-sm text-[#6B6B6B]">
                    Suggested category:{" "}
                    <span className="font-semibold text-[#1F1F1F]">
                      {detectedCategoryName}
                    </span>
                  </p>
                )}

                {subgenres.length > 0 && (
                  <p className="mt-2 text-sm text-[#6B6B6B]">
                    Suggested subgenres:{" "}
                    <span className="font-semibold text-[#1F1F1F]">
                      {subgenres.join(", ")}
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
                    onChange={(e) => {
                      setCategoryTouched(true);
                      setCategoryId(e.target.value);
                    }}
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

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <ImagePlus size={16} />
                    Upload Book Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full rounded-2xl border border-[#DED8CF] bg-white px-4 py-1.5 text-sm text-[#5F5A52] file:mr-4 file:rounded-full file:border-0 file:bg-[#E67E22] file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-[#cf6f1c]"
                  />
                  <p className="mt-2 text-xs leading-6 text-[#8A8175]">
                    Use this for photos of the actual book,especially for used
                    books.
                  </p>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B6B6B]">
                    <Link2 size={16} />
                    Custom Cover URL
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
                    Category: {detectedCategoryName || "Not detected yet"}
                  </p>
                  {subgenres.length > 0 && (
                    <p className="mt-2 break-words text-sm text-[#8A8175]">
                      Subgenres: {subgenres.join(", ")}
                    </p>
                  )}
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
