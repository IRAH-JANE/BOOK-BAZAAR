import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";
import BookActions from "@/components/BookActions";
import BookImageWithFallback from "@/components/BookImageWithFallback";
import BookReviewsSection from "@/components/BookReviewsSection";
import {
  MapPin,
  Tag,
  ArrowLeft,
  Star,
  CalendarDays,
  Building2,
  Hash,
  Shapes,
  Library,
} from "lucide-react";

export const dynamic = "force-dynamic";

type BookPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type RelatedBook = {
  id: number;
  title: string;
  author: string;
  price: number;
  image_url: string | null;
  location: string | null;
  condition: string | null;
  isbn?: string | null;
};

type LookupRelation =
  | {
      name?: string | null;
    }
  | {
      name?: string | null;
    }[]
  | null;

type BookData = {
  id: number;
  category_id: number | null;
  genre_id: number | null;
  book_type_id: number | null;
  title: string;
  author: string;
  description: string | null;
  price: number;
  condition: string | null;
  location: string | null;
  status: string | null;
  image_url: string | null;
  isbn: string | null;
  publisher: string | null;
  published_date: string | null;
  stock_quantity: number | null;
  categories: LookupRelation;
  genres: LookupRelation;
  book_types: LookupRelation;
};

type BookReviewStat = {
  rating: number;
};

function extractRelationName(relation: LookupRelation) {
  if (Array.isArray(relation)) {
    return relation[0]?.name || null;
  }
  return relation?.name || null;
}

export default async function BookDetailsPage({ params }: BookPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("books")
    .select(
      `
      id,
      category_id,
      genre_id,
      book_type_id,
      title,
      author,
      description,
      price,
      condition,
      location,
      status,
      image_url,
      isbn,
      publisher,
      published_date,
      stock_quantity,
      categories (
        name
      ),
      genres (
        name
      ),
      book_types (
        name
      )
      `,
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const book = data as BookData;

  const categoryName = extractRelationName(book.categories);
  const genreName = extractRelationName(book.genres);
  const bookTypeName = extractRelationName(book.book_types);

  const fullDescription = book.description || "No description available.";

  const shortDescription =
    fullDescription.length > 320
      ? `${fullDescription.slice(0, 320)}...`
      : fullDescription;

  const { data: reviewStatsData } = await supabase
    .from("book_reviews")
    .select("rating")
    .eq("book_id", book.id);

  const reviewStats = (reviewStatsData as BookReviewStat[]) || [];
  const reviewCount = reviewStats.length;
  const averageRating =
    reviewCount > 0
      ? reviewStats.reduce(
          (sum, review) => sum + Number(review.rating || 0),
          0,
        ) / reviewCount
      : 0;

  let relatedBooks: RelatedBook[] = [];

  if (book.category_id) {
    const { data: sameCategoryBooks } = await supabase
      .from("books")
      .select("id, title, author, price, image_url, location, condition, isbn")
      .eq("category_id", book.category_id)
      .neq("id", book.id)
      .limit(4);

    relatedBooks = (sameCategoryBooks as RelatedBook[]) || [];
  }

  if (relatedBooks.length < 4 && book.genre_id) {
    const excludeIds = [book.id, ...relatedBooks.map((item) => item.id)];

    const { data: sameGenreBooks } = await supabase
      .from("books")
      .select("id, title, author, price, image_url, location, condition, isbn")
      .eq("genre_id", book.genre_id)
      .not("id", "in", `(${excludeIds.join(",")})`)
      .limit(4 - relatedBooks.length);

    relatedBooks = [
      ...relatedBooks,
      ...((sameGenreBooks as RelatedBook[]) || []).filter(
        (item) => !relatedBooks.some((existing) => existing.id === item.id),
      ),
    ];
  }

  if (relatedBooks.length < 4) {
    const excludeIds = [book.id, ...relatedBooks.map((item) => item.id)];

    const { data: fallbackBooks } = await supabase
      .from("books")
      .select("id, title, author, price, image_url, location, condition, isbn")
      .not("id", "in", `(${excludeIds.join(",")})`)
      .limit(4 - relatedBooks.length);

    relatedBooks = [
      ...relatedBooks,
      ...((fallbackBooks as RelatedBook[]) || []).filter(
        (item) => !relatedBooks.some((existing) => existing.id === item.id),
      ),
    ];
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1]">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-4 sm:mb-5">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-full border border-[#D9D1C6] bg-white px-4 py-2 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>

        <div className="grid gap-5 sm:gap-6 lg:grid-cols-[340px_minmax(0,620px)] lg:items-start lg:justify-center lg:gap-8">
          <div className="rounded-[20px] border border-[#E5E0D8] bg-white p-3 shadow-sm sm:rounded-[24px] sm:p-4">
            <BookImageWithFallback
              imageUrl={book.image_url}
              isbn={book.isbn}
              title={book.title}
              wrapperClassName="overflow-hidden rounded-[18px] border border-[#ECE6DC] bg-[#F7F4EE] sm:rounded-[20px]"
              className="h-[420px] w-full rounded-[16px] object-cover sm:h-[520px]"
              emptyClassName="flex h-[240px] w-full items-center justify-center text-[#8A8175] sm:h-[380px]"
              emptyText="No Image Available"
            />
          </div>

          <div className="space-y-5">
            <div className="rounded-[20px] border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E67E22] sm:text-sm">
                Book Information
              </p>

              <h1 className="mt-3 break-words text-2xl font-bold leading-tight text-[#1F1F1F] sm:text-3xl lg:text-[42px]">
                {book.title}
              </h1>

              <p className="mt-2 text-sm text-[#6B6B6B] sm:text-base lg:text-lg">
                {book.author}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 rounded-full bg-[#F7F4EE] px-3 py-2 text-xs font-medium text-[#1F1F1F] sm:text-sm">
                  <Star size={15} className="fill-[#E67E22] text-[#E67E22]" />
                  <span>{averageRating.toFixed(1)}</span>
                  <span className="text-[#8A8175]">
                    {reviewCount > 0
                      ? `(${reviewCount} review${reviewCount === 1 ? "" : "s"})`
                      : "(No ratings yet)"}
                  </span>
                </div>

                {book.condition && (
                  <div className="rounded-full bg-[#F7F4EE] px-3 py-2 text-xs font-medium text-[#1F1F1F] sm:text-sm">
                    {book.condition}
                  </div>
                )}

                {categoryName && (
                  <div className="rounded-full bg-[#F7F4EE] px-3 py-2 text-xs font-medium text-[#1F1F1F] sm:text-sm">
                    {categoryName}
                  </div>
                )}

                {genreName && (
                  <div className="rounded-full bg-[#FFF4E8] px-3 py-2 text-xs font-medium text-[#8A5B24] sm:text-sm">
                    {genreName}
                  </div>
                )}

                {bookTypeName && (
                  <div className="rounded-full bg-[#F2EEE8] px-3 py-2 text-xs font-medium text-[#5F5A52] sm:text-sm">
                    {bookTypeName}
                  </div>
                )}
              </div>

              <p className="mt-5 text-2xl font-bold text-[#E67E22] sm:text-3xl">
                ₱{Number(book.price).toFixed(2)}
              </p>

              <div className="mt-5">
                <div className="rounded-2xl bg-[#F7F4EE] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                    Location
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[#1F1F1F]">
                    <MapPin size={16} className="shrink-0 text-[#E67E22]" />
                    <span className="text-sm font-semibold sm:text-base">
                      {book.location || "No location provided"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <h2 className="text-lg font-bold text-[#1F1F1F] sm:text-xl">
                  Book Specifications
                </h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {categoryName && (
                    <div className="rounded-2xl bg-[#F7F4EE] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                        Category
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[#1F1F1F]">
                        <Library
                          size={16}
                          className="shrink-0 text-[#E67E22]"
                        />
                        <span className="text-sm font-semibold sm:text-base">
                          {categoryName}
                        </span>
                      </div>
                    </div>
                  )}

                  {genreName && (
                    <div className="rounded-2xl bg-[#F7F4EE] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                        Genre
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[#1F1F1F]">
                        <Tag size={16} className="shrink-0 text-[#E67E22]" />
                        <span className="text-sm font-semibold sm:text-base">
                          {genreName}
                        </span>
                      </div>
                    </div>
                  )}

                  {bookTypeName && (
                    <div className="rounded-2xl bg-[#F7F4EE] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                        Book Type
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[#1F1F1F]">
                        <Shapes size={16} className="shrink-0 text-[#E67E22]" />
                        <span className="text-sm font-semibold sm:text-base">
                          {bookTypeName}
                        </span>
                      </div>
                    </div>
                  )}

                  {book.isbn && (
                    <div className="rounded-2xl bg-[#F7F4EE] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                        ISBN
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[#1F1F1F]">
                        <Hash size={16} className="shrink-0 text-[#E67E22]" />
                        <span className="break-all text-sm font-semibold sm:text-base">
                          {book.isbn}
                        </span>
                      </div>
                    </div>
                  )}

                  {book.publisher && (
                    <div className="rounded-2xl bg-[#F7F4EE] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                        Publisher
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[#1F1F1F]">
                        <Building2
                          size={16}
                          className="shrink-0 text-[#E67E22]"
                        />
                        <span className="break-words text-sm font-semibold sm:text-base">
                          {book.publisher}
                        </span>
                      </div>
                    </div>
                  )}

                  {book.published_date && (
                    <div className="rounded-2xl bg-[#F7F4EE] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                        Published Date
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[#1F1F1F]">
                        <CalendarDays
                          size={16}
                          className="shrink-0 text-[#E67E22]"
                        />
                        <span className="text-sm font-semibold sm:text-base">
                          {book.published_date}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-bold text-[#1F1F1F] sm:text-xl">
                  Description
                </h2>

                <div className="mt-4 rounded-2xl bg-[#F7F4EE] p-4 sm:p-5">
                  <details className="group">
                    <summary className="cursor-pointer list-none outline-none">
                      <p className="break-words text-sm leading-7 text-[#4F4A43] group-open:hidden sm:text-base">
                        {shortDescription}
                      </p>

                      <p className="hidden break-words text-sm leading-7 text-[#4F4A43] group-open:block sm:text-base">
                        {fullDescription}
                      </p>

                      <span className="mt-4 inline-block text-sm font-semibold text-[#E67E22] sm:text-base">
                        <span className="group-open:hidden">
                          Read full detail
                        </span>
                        <span className="hidden group-open:inline">
                          Show less
                        </span>
                      </span>
                    </summary>
                  </details>
                </div>
              </div>

              <div className="mt-6">
                <BookActions bookId={book.id} />
              </div>
            </div>
          </div>
        </div>

        <BookReviewsSection bookId={book.id} />

        <section className="mt-10 sm:mt-14">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E67E22] sm:text-sm">
              You may also like
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
              Related Books
            </h2>
            <p className="mt-2 text-sm text-[#6B6B6B] sm:text-base">
              Explore more books similar to this listing.
            </p>
          </div>

          {relatedBooks.length === 0 ? (
            <div className="rounded-[20px] border border-[#E5E0D8] bg-white p-6 text-sm text-[#6B6B6B] shadow-sm sm:rounded-[24px] sm:p-8 sm:text-base">
              No related books available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {relatedBooks.map((related) => (
                <Link
                  key={related.id}
                  href={`/book/${related.id}`}
                  className="group rounded-[20px] border border-[#E5E0D8] bg-white p-4 shadow-sm transition hover:shadow-md sm:rounded-[24px]"
                >
                  <BookImageWithFallback
                    imageUrl={related.image_url}
                    isbn={related.isbn || null}
                    title={related.title}
                    wrapperClassName="overflow-hidden rounded-2xl bg-[#F7F4EE]"
                    className="h-52 w-full object-contain bg-[#F7F4EE] transition duration-300 group-hover:scale-[1.02] sm:h-64"
                    emptyClassName="flex h-52 items-center justify-center text-[#8A8175] sm:h-64"
                    emptyText="No Image"
                  />

                  <div className="pt-4">
                    <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold text-[#1F1F1F] sm:min-h-[52px]">
                      {related.title}
                    </h3>

                    <p className="mt-1 line-clamp-1 text-sm text-[#8A8175]">
                      {related.author}
                    </p>

                    <p className="mt-3 text-lg font-bold text-[#E67E22]">
                      ₱{Number(related.price).toFixed(2)}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-sm text-[#8A8175]">
                      <MapPin size={14} className="shrink-0" />
                      <span className="line-clamp-1">
                        {related.location || "No location"}
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[#6B6B6B]">
                      {related.condition || "Available"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
