import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BookActions from "@/components/BookActions";
import BookImageWithFallback from "@/components/BookImageWithFallback";
import {
  MapPin,
  Tag,
  ArrowLeft,
  Star,
  CalendarDays,
  Building2,
  Hash,
  PackageCheck,
} from "lucide-react";

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

type CategoryRelation =
  | {
      name?: string;
    }
  | {
      name?: string;
    }[]
  | null;

type BookData = {
  id: number;
  category_id: number | null;
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
  categories: CategoryRelation;
};

export default async function BookDetailsPage({ params }: BookPageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("books")
    .select(
      `
      id,
      category_id,
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
      categories (
        name
      )
      `,
    )
    .eq("id", Number(id))
    .single();

  if (error || !data) {
    notFound();
  }

  const book = data as BookData;

  const categoryName = Array.isArray(book.categories)
    ? book.categories[0]?.name || null
    : book.categories?.name || null;

  const shortDescription =
    book.description && book.description.length > 320
      ? `${book.description.slice(0, 320)}...`
      : book.description || "No description available.";

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

  if (relatedBooks.length === 0) {
    const { data: fallbackBooks } = await supabase
      .from("books")
      .select("id, title, author, price, image_url, location, condition, isbn")
      .neq("id", book.id)
      .limit(4);

    relatedBooks = (fallbackBooks as RelatedBook[]) || [];
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1]">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-full border border-[#D9D1C6] bg-white px-4 py-2 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,620px)] lg:justify-center lg:items-start">
          <div className="rounded-[24px] border border-[#E5E0D8] bg-white p-4 shadow-sm">
            <BookImageWithFallback
              imageUrl={book.image_url}
              isbn={book.isbn}
              title={book.title}
              wrapperClassName="flex min-h-[460px] items-center justify-center rounded-[20px] border border-[#ECE6DC] bg-[#F7F4EE] p-5"
              className="max-h-[420px] w-auto max-w-full object-contain"
              emptyClassName="flex h-[380px] w-full items-center justify-center text-[#8A8175]"
              emptyText="No Image Available"
            />
          </div>

          <div className="space-y-5">
            <div className="rounded-[24px] border border-[#E5E0D8] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E67E22]">
                Book Information
              </p>

              <h1 className="mt-3 break-words text-3xl font-bold leading-tight text-[#1F1F1F] sm:text-[42px]">
                {book.title}
              </h1>

              <p className="mt-2 text-base text-[#6B6B6B] sm:text-lg">
                {book.author}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-full bg-[#F7F4EE] px-3 py-2 text-sm font-medium text-[#1F1F1F]">
                  <Star size={15} className="fill-[#E67E22] text-[#E67E22]" />
                  <span>0.0</span>
                  <span className="text-[#8A8175]">(No ratings yet)</span>
                </div>

                {categoryName && (
                  <div className="rounded-full bg-[#F7F4EE] px-3 py-2 text-sm font-medium text-[#1F1F1F]">
                    {categoryName}
                  </div>
                )}
              </div>

              <p className="mt-5 text-2xl font-bold text-[#E67E22] sm:text-3xl">
                ₱{book.price}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#F7F4EE] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                    Condition
                  </p>
                  <p className="mt-2 font-semibold text-[#1F1F1F]">
                    {book.condition || "Not specified"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F7F4EE] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                    Status
                  </p>
                  <p className="mt-2 font-semibold capitalize text-[#1F1F1F]">
                    {book.status || "Available"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F7F4EE] p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                    Location
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[#1F1F1F]">
                    <MapPin size={16} className="text-[#E67E22]" />
                    <span className="font-semibold">
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
                        <Tag size={16} className="text-[#E67E22]" />
                        <span className="font-semibold">{categoryName}</span>
                      </div>
                    </div>
                  )}

                  {book.isbn && (
                    <div className="rounded-2xl bg-[#F7F4EE] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                        ISBN
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[#1F1F1F]">
                        <Hash size={16} className="text-[#E67E22]" />
                        <span className="break-all font-semibold">
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
                        <Building2 size={16} className="text-[#E67E22]" />
                        <span className="break-words font-semibold">
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
                        <CalendarDays size={16} className="text-[#E67E22]" />
                        <span className="font-semibold">
                          {book.published_date}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl bg-[#F7F4EE] p-4 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8175]">
                      Availability
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[#1F1F1F]">
                      <PackageCheck size={16} className="text-[#E67E22]" />
                      <span className="font-semibold">
                        {book.status || "Available for buyer inquiry"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-bold text-[#1F1F1F] sm:text-xl">
                  Description
                </h2>

                <div className="mt-4 rounded-2xl bg-[#F7F4EE] p-5">
                  <details className="group">
                    <summary className="cursor-pointer list-none outline-none">
                      <p className="break-words leading-7 text-[#4F4A43] group-open:hidden">
                        {shortDescription}
                      </p>

                      <p className="hidden break-words leading-7 text-[#4F4A43] group-open:block">
                        {book.description || "No description available."}
                      </p>

                      <span className="mt-4 inline-block font-semibold text-[#E67E22]">
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

        <section className="mt-14">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E67E22]">
              You may also like
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[#1F1F1F]">
              Related Books
            </h2>
            <p className="mt-2 text-[#6B6B6B]">
              Explore more books similar to this listing.
            </p>
          </div>

          {relatedBooks.length === 0 ? (
            <div className="rounded-[24px] border border-[#E5E0D8] bg-white p-8 text-[#6B6B6B] shadow-sm">
              No related books available yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedBooks.map((related) => (
                <Link
                  key={related.id}
                  href={`/book/${related.id}`}
                  className="group rounded-[24px] border border-[#E5E0D8] bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <BookImageWithFallback
                    imageUrl={related.image_url}
                    isbn={related.isbn || null}
                    title={related.title}
                    wrapperClassName="overflow-hidden rounded-2xl bg-[#F7F4EE]"
                    className="h-64 w-full object-contain bg-[#F7F4EE] transition duration-300 group-hover:scale-[1.02]"
                    emptyClassName="flex h-64 items-center justify-center text-[#8A8175]"
                    emptyText="No Image"
                  />

                  <div className="pt-4">
                    <h3 className="line-clamp-2 min-h-[52px] text-base font-semibold text-[#1F1F1F]">
                      {related.title}
                    </h3>

                    <p className="mt-1 line-clamp-1 text-sm text-[#8A8175]">
                      {related.author}
                    </p>

                    <p className="mt-3 text-lg font-bold text-[#E67E22]">
                      ₱{related.price}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-sm text-[#8A8175]">
                      <MapPin size={14} />
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
