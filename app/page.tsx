import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  BookOpen,
  BadgeDollarSign,
  ShieldCheck,
  Megaphone,
} from "lucide-react";

type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  image_url: string | null;
  location?: string | null;
};

export default async function HomePage() {
  const { data: featuredBooks } = await supabase
    .from("books")
    .select("id, title, author, price, image_url, location")
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: adBooks } = await supabase
    .from("books")
    .select("id, title, author, price, image_url, location")
    .order("created_at", { ascending: false })
    .limit(2);

  return (
    <main className="min-h-screen bg-[#F7F5F1]">
      {/* HERO */}
      <section className="border-b border-[#E5E0D8] bg-[#FFFDF9]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E67E22]">
              Community Book Marketplace
            </p>

            <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight text-[#1F1F1F] md:text-6xl">
              Buy, sell, and promote books in one trusted marketplace.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6B6B6B]">
              BookBazaar helps readers discover affordable books, helps sellers
              earn from used books, and gives featured sellers a place to
              advertise directly on the homepage.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/marketplace"
                className="rounded-full bg-[#E67E22] px-6 py-3 font-semibold text-white transition hover:bg-[#cf6f1c]"
              >
                Browse Books
              </Link>

              <Link
                href="/sell"
                className="rounded-full border border-[#D8D1C6] bg-white px-6 py-3 font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
              >
                Sell Your Book
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#EDE7DE]">
                <p className="text-2xl font-bold text-[#1F1F1F]">Affordable</p>
                <p className="mt-2 text-sm text-[#6B6B6B]">
                  Find second-hand books at lower prices.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#EDE7DE]">
                <p className="text-2xl font-bold text-[#1F1F1F]">Profitable</p>
                <p className="mt-2 text-sm text-[#6B6B6B]">
                  Sellers earn while the platform grows.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#EDE7DE]">
                <p className="text-2xl font-bold text-[#1F1F1F]">Practical</p>
                <p className="mt-2 text-sm text-[#6B6B6B]">
                  Great for students, readers, and local communities.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
              <BookOpen className="text-[#E67E22]" size={28} />
              <h3 className="mt-4 text-2xl font-bold text-[#1F1F1F]">
                For Buyers
              </h3>
              <p className="mt-3 leading-7 text-[#6B6B6B]">
                Discover cheaper books, save favorites to your wishlist, and
                browse by title, category, and location.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
              <BadgeDollarSign className="text-[#E67E22]" size={28} />
              <h3 className="mt-4 text-2xl font-bold text-[#1F1F1F]">
                For Sellers
              </h3>
              <p className="mt-3 leading-7 text-[#6B6B6B]">
                List books easily, upload photos, manage listings, and reach
                more buyers through the marketplace.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
              <Megaphone className="text-[#E67E22]" size={28} />
              <h3 className="mt-4 text-2xl font-bold text-[#1F1F1F]">
                Homepage Ads
              </h3>
              <p className="mt-3 leading-7 text-[#6B6B6B]">
                Sellers can pay to feature their books on the homepage for
                better visibility and faster selling.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
              <ShieldCheck className="text-[#E67E22]" size={28} />
              <h3 className="mt-4 text-2xl font-bold text-[#1F1F1F]">
                Trusted Platform
              </h3>
              <p className="mt-3 leading-7 text-[#6B6B6B]">
                Registered users, organized profiles, and a clean marketplace
                create a more reliable buying and selling experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E67E22]">
            How It Works
          </p>
          <h2 className="mt-2 text-4xl font-bold text-[#1F1F1F]">
            A simple process for buyers and sellers
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#E67E22]">
              Step 1
            </p>
            <h3 className="mt-3 text-2xl font-bold text-[#1F1F1F]">
              Create an account
            </h3>
            <p className="mt-3 leading-7 text-[#6B6B6B]">
              Register with your details so you can buy, save, and sell books on
              the platform.
            </p>
          </div>

          <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#E67E22]">
              Step 2
            </p>
            <h3 className="mt-3 text-2xl font-bold text-[#1F1F1F]">
              Browse or list books
            </h3>
            <p className="mt-3 leading-7 text-[#6B6B6B]">
              Buyers can explore the marketplace, while sellers can post books
              with details, images, and pricing.
            </p>
          </div>

          <div className="rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#E67E22]">
              Step 3
            </p>
            <h3 className="mt-3 text-2xl font-bold text-[#1F1F1F]">
              Connect and complete the sale
            </h3>
            <p className="mt-3 leading-7 text-[#6B6B6B]">
              Buyers contact sellers, complete the transaction, and the platform
              supports discovery, visibility, and trust.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED SELLER ADS */}
      <section className="border-y border-[#E5E0D8] bg-[#FFFDF9]">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E67E22]">
                Sponsored Listings
              </p>
              <h2 className="mt-2 text-4xl font-bold text-[#1F1F1F]">
                Featured Seller Ads
              </h2>
              <p className="mt-2 max-w-2xl text-[#6B6B6B]">
                Sellers can promote their books on the homepage to get more
                attention, reach more buyers, and sell faster.
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F4EE] px-4 py-3 text-sm text-[#6B6B6B]">
              Ad slot example: sellers can pay to appear here.
            </div>
          </div>

          {adBooks && adBooks.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {adBooks.map((book: Book) => (
                <Link
                  key={book.id}
                  href={`/book/${book.id}`}
                  className="group overflow-hidden rounded-3xl border border-[#E5E0D8] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="grid md:grid-cols-[220px_1fr]">
                    {book.image_url ? (
                      <img
                        src={book.image_url}
                        alt={book.title}
                        className="h-full min-h-[240px] w-full object-cover"
                      />
                    ) : (
                      <div className="flex min-h-[240px] items-center justify-center bg-[#F1ECE4] text-[#8A8175]">
                        No Image
                      </div>
                    )}

                    <div className="p-6">
                      <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#E67E22]">
                        Sponsored
                      </span>

                      <h3 className="mt-4 text-2xl font-bold text-[#1F1F1F]">
                        {book.title}
                      </h3>

                      <p className="mt-2 text-[#6B6B6B]">{book.author}</p>

                      <p className="mt-4 text-2xl font-bold text-[#E67E22]">
                        ₱{book.price}
                      </p>

                      <p className="mt-2 text-sm text-[#8A8175]">
                        {book.location || "Community listing"}
                      </p>

                      <div className="mt-6 inline-flex rounded-full border border-[#E67E22] px-4 py-2 text-sm font-semibold text-[#E67E22] transition group-hover:bg-[#E67E22] group-hover:text-white">
                        View Sponsored Book
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#D9D1C6] bg-white p-10 text-center text-[#6B6B6B]">
              No sponsored listings yet. This space can be used for paid seller
              ads on the homepage.
            </div>
          )}
        </div>
      </section>

      {/* FEATURED BOOKS */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E67E22]">
              Marketplace Picks
            </p>
            <h2 className="mt-2 text-4xl font-bold text-[#1F1F1F]">
              Featured Books
            </h2>
            <p className="mt-2 text-[#6B6B6B]">
              Recently listed books from the BookBazaar community.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="text-sm font-semibold text-[#E67E22] hover:underline"
          >
            View all books
          </Link>
        </div>

        {featuredBooks && featuredBooks.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredBooks.map((book: Book) => (
              <Link
                key={book.id}
                href={`/book/${book.id}`}
                className="group overflow-hidden rounded-3xl border border-[#E5E0D8] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {book.image_url ? (
                  <img
                    src={book.image_url}
                    alt={book.title}
                    className="h-72 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-72 w-full items-center justify-center bg-[#F1ECE4] text-[#8A8175]">
                    No Image
                  </div>
                )}

                <div className="p-5">
                  <h3 className="line-clamp-2 text-lg font-semibold text-[#1F1F1F]">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#6B6B6B]">{book.author}</p>
                  <p className="mt-3 text-lg font-bold text-[#E67E22]">
                    ₱{book.price}
                  </p>
                  <p className="mt-1 text-sm text-[#8A8175]">
                    {book.location || "Community listing"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[#6B6B6B]">No featured books yet.</p>
        )}
      </section>

      {/* FINAL CTA */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-[32px] border border-[#E5E0D8] bg-white p-10 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E67E22]">
                  Start Using BookBazaar
                </p>
                <h2 className="mt-3 text-4xl font-bold leading-tight text-[#1F1F1F]">
                  Turn old books into income and help more readers find
                  affordable books.
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-[#6B6B6B]">
                  Whether you are a student, a casual reader, or a seller who
                  wants more visibility, BookBazaar gives you one place to buy,
                  sell, promote, and discover books.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 lg:justify-end">
                <Link
                  href="/register"
                  className="rounded-full bg-[#E67E22] px-6 py-3 font-semibold text-white transition hover:bg-[#cf6f1c]"
                >
                  Create an Account
                </Link>

                <Link
                  href="/sell"
                  className="rounded-full border border-[#D8D1C6] bg-[#FFFDF9] px-6 py-3 font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
                >
                  Start Selling
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
