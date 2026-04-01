import Link from "next/link";
import LoggedInHeroCarousel from "@/components/LoggedInHeroCarousel";
import { createSupabaseServer } from "@/lib/supabase-server";
import {
  BookOpen,
  BadgeDollarSign,
  Heart,
  Sparkles,
  Compass,
  Store,
  Eye,
  MapPin,
  ArrowUpRight,
  ScanSearch,
} from "lucide-react";

type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  image_url: string | null;
  location?: string | null;
  category_id?: number | null;
  seller_id?: string | null;
};

type Profile = {
  full_name?: string | null;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#E67E22]">
      {children}
    </p>
  );
}

function InfoStripItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-[#EFE4D7] bg-[#FFFDF9] p-5 transition duration-300">
      <div className="relative flex items-start gap-4 lg:block">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3E8] text-[#E67E22] lg:mb-4">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[#2A211B]">{title}</p>
          <p className="mt-2 text-[13px] leading-6 text-[#6F655B]">{text}</p>
        </div>
      </div>
    </div>
  );
}

function EqualRailCard({ book, badge }: { book: Book; badge?: string }) {
  return (
    <Link href={`/book/${book.id}`} className="group block h-full snap-start">
      <div className="h-full overflow-hidden rounded-xl border border-[#EEE4D8] bg-[#FFFDF9] transition duration-300 hover:bg-white">
        <div className="relative overflow-hidden bg-[#EEE6DB]">
          {book.image_url ? (
            <img
              src={book.image_url}
              alt={book.title}
              className="h-[250px] w-full object-cover transition duration-500"
            />
          ) : (
            <div className="flex h-[250px] items-center justify-center text-[#7B7368]">
              No Image
            </div>
          )}

          {badge ? (
            <div className="absolute left-3 top-3 rounded bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#E67E22]">
              {badge}
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2A211B]/18 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="rounded-xl border border-[#F1E7DB] bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2A211B]">
                  <Eye size={12} />
                  Quick view
                </span>
                <span className="text-[11px] font-medium text-[#E67E22]">
                  View
                </span>
              </div>

              <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#6F655B]">
                Browse this listing and view more details from the marketplace.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="line-clamp-2 min-h-[46px] text-[14px] font-medium leading-6 text-[#2A211B]">
            {book.title}
          </h3>

          <p className="mt-1 line-clamp-1 text-[12px] text-[#6E6257]">
            {book.author}
          </p>

          <div className="mt-4 flex items-end justify-between gap-3">
            <p className="text-[18px] font-semibold text-[#E67E22]">
              ₱{book.price}
            </p>
            <p className="line-clamp-1 inline-flex items-center gap-1 text-[11px] text-[#8A7C6C]">
              <MapPin size={11} />
              {book.location || "Community listing"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function RailSection({
  title,
  subtitle,
  href,
  books,
  badge,
}: {
  title: string;
  subtitle?: string;
  href: string;
  books: Book[];
  badge?: string;
}) {
  if (!books.length) return null;

  return (
    <section className="relative z-10 mx-auto max-w-7xl bg-transparent px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between gap-4 bg-transparent">
        <div>
          <h2 className="text-[1.7rem] font-semibold tracking-tight text-[#2A211B] sm:text-[2rem]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-[13px] leading-7 text-[#6F655B]">
              {subtitle}
            </p>
          ) : null}
        </div>

        <Link
          href={href}
          className="hidden text-[13px] font-medium text-[#7A6B5D] transition hover:text-[#E67E22] sm:block"
        >
          View more
        </Link>
      </div>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto bg-transparent pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-nowrap lg:overflow-x-hidden">
        {books.map((book) => (
          <div
            key={book.id}
            className="min-w-[210px] max-w-[210px] bg-transparent sm:min-w-[220px] sm:max-w-[220px] lg:w-[calc((100%-4rem)/5)] lg:min-w-[calc((100%-4rem)/5)] lg:max-w-[calc((100%-4rem)/5)] lg:flex-none"
          >
            <EqualRailCard book={book} badge={badge} />
          </div>
        ))}
      </div>
    </section>
  );
}

function InfoFeatureSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-6 rounded-2xl border border-[#EFE4D7] bg-[#FFFDF9] p-6 lg:grid-cols-2 lg:p-8">
        <div>
          <SectionLabel>Why BookBazaar</SectionLabel>
          <h2 className="mt-3 text-[2rem] font-semibold leading-tight tracking-tight text-[#2A211B]">
            Less clutter. Better book discovery.
          </h2>
          <p className="mt-4 max-w-xl text-[14px] leading-7 text-[#6F655B]">
            Find books faster, explore curated listings, and enjoy a cleaner,
            more focused browsing experience.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#EFE4D7] bg-[#FFFDF9] p-5">
            <p className="text-[13px] font-medium text-[#2A211B]">For Buyers</p>
            <p className="mt-2 text-[13px] leading-6 text-[#6F655B]">
              Browse books faster, save favorites, and explore listings in a
              cleaner interface.
            </p>
          </div>

          <div className="rounded-xl border border-[#EFE4D7] bg-[#FFFDF9] p-5">
            <p className="text-[13px] font-medium text-[#2A211B]">
              For Sellers
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[#6F655B]">
              Post books, reach more readers, and present listings in a more
              organized and user-friendly marketplace.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function GuestIntroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-6 rounded-2xl border border-[#EFE4D7] bg-[#FFFDF9] p-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[#EFE4D7] bg-[#FFFDF9] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E67E22]/12 text-[#E67E22]">
            <BookOpen size={18} />
          </div>
          <p className="mt-4 text-[13px] font-medium text-[#2A211B]">
            Browse Books
          </p>
          <p className="mt-2 text-[13px] leading-6 text-[#6F655B]">
            Explore listings with stronger cover presentation and easier
            scrolling.
          </p>
        </div>

        <div className="rounded-xl border border-[#EFE4D7] bg-[#FFFDF9] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E67E22]/12 text-[#E67E22]">
            <BadgeDollarSign size={18} />
          </div>
          <p className="mt-4 text-[13px] font-medium text-[#2A211B]">
            Sell Easily
          </p>
          <p className="mt-2 text-[13px] leading-6 text-[#6F655B]">
            Post your books and give them a cleaner marketplace presence.
          </p>
        </div>

        <div className="rounded-xl border border-[#EFE4D7] bg-[#FFFDF9] p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E67E22]/12 text-[#E67E22]">
            <Sparkles size={18} />
          </div>
          <p className="mt-4 text-[13px] font-medium text-[#2A211B]">
            Discover Faster
          </p>
          <p className="mt-2 text-[13px] leading-6 text-[#6F655B]">
            Find books quickly through simpler homepage sections and clearer
            browsing flow.
          </p>
        </div>
      </div>
    </section>
  );
}

function uniqueBooks(books: Book[] = []) {
  const map = new Map<number, Book>();
  for (const book of books) {
    if (!map.has(book.id)) {
      map.set(book.id, book);
    }
  }
  return Array.from(map.values());
}

async function getBooksWithFallback({
  supabase,
  userId,
  limit,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>;
  userId: string;
  limit: number;
}) {
  const baseSelect =
    "id, title, author, price, image_url, location, category_id, seller_id";

  const { data: nonOwnBooks } = await supabase
    .from("books")
    .select(baseSelect)
    .neq("seller_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (nonOwnBooks && nonOwnBooks.length > 0) {
    return nonOwnBooks as Book[];
  }

  const { data: allBooks } = await supabase
    .from("books")
    .select(baseSelect)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (allBooks || []) as Book[];
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guestBooksQuery = supabase
    .from("books")
    .select(
      "id, title, author, price, image_url, location, category_id, seller_id",
    )
    .order("created_at", { ascending: false });

  const [{ data: featuredBooks }, { data: freshGuestBooks }] =
    await Promise.all([
      guestBooksQuery.limit(10),
      supabase
        .from("books")
        .select(
          "id, title, author, price, image_url, location, category_id, seller_id",
        )
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  if (!user) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#F8F3EC_0%,#F7EFE4_35%,#FFFDF9_100%)]">
        <section className="relative overflow-hidden border-b border-[#EADFD2] bg-[#F7F1E8]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(230,126,34,0.14)_0%,rgba(247,241,232,0.92)_34%,rgba(255,253,249,1)_72%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.12),rgba(247,241,232,0.82),#FFFDF9)]" />

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <SectionLabel>Community Book Marketplace</SectionLabel>

              <h1 className="mt-4 text-[2.7rem] font-semibold leading-[1.02] tracking-tight text-[#2A211B] md:text-[3.4rem] lg:text-[4rem]">
                Buy, sell, and discover books in a marketplace that feels alive
              </h1>

              <p className="mt-5 max-w-2xl text-[14px] leading-7 text-[#6F655B] sm:text-[15px]">
                BookBazaar helps readers find affordable books and gives sellers
                a more modern place to showcase listings with better visibility.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/marketplace"
                  className="rounded-md bg-[#E67E22] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#cf6f1c]"
                >
                  Browse Books
                </Link>
                <Link
                  href="/sell"
                  className="rounded-md border border-[#EADFD2] bg-[#FFFDF9] px-5 py-3 text-sm font-medium text-[#2A211B] transition hover:bg-white"
                >
                  Sell Your Book
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#EADFD2] bg-[#FBF7F1]">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:px-8">
            <InfoStripItem
              icon={<Compass size={18} />}
              title="How it works"
              text="Browse, save, buy, or list books in one cleaner reading marketplace."
            />
            <InfoStripItem
              icon={<Sparkles size={18} />}
              title="Why BookBazaar"
              text="A more visual and premium experience for both buyers and sellers."
            />
            <InfoStripItem
              icon={<BookOpen size={18} />}
              title="Community-first"
              text="Built for readers, collectors, students, and anyone looking for books."
            />
          </div>
        </section>

        <GuestIntroSection />

        <RailSection
          title="Trending Now"
          subtitle="Books currently catching attention in the marketplace."
          href="/marketplace"
          books={featuredBooks || []}
          badge="Trending"
        />

        <InfoFeatureSection />

        <RailSection
          title="Fresh Listings"
          subtitle="Newly added books from sellers in the marketplace."
          href="/marketplace"
          books={freshGuestBooks || []}
          badge="New Listing"
        />
      </main>
    );
  }

  const [
    { data: profileData },
    { data: wishlistRows },
    { data: cartRows },
    trendingBooksRaw,
    freshBooksRaw,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("wishlists").select("book_id").eq("user_id", user.id),
    supabase.from("cart_items").select("book_id").eq("user_id", user.id),
    getBooksWithFallback({ supabase, userId: user.id, limit: 10 }),
    getBooksWithFallback({ supabase, userId: user.id, limit: 10 }),
  ]);

  const profile = profileData as Profile | null;
  const firstName =
    profile?.full_name?.trim()?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "Reader";

  const wishlistBookIds = (wishlistRows || []).map((item) => item.book_id);
  const cartBookIds = (cartRows || []).map((item) => item.book_id);
  const interestBookIds = [...new Set([...wishlistBookIds, ...cartBookIds])];

  const trendingBooks = uniqueBooks(trendingBooksRaw || []);
  const freshBooks = uniqueBooks(freshBooksRaw || []);

  let interestCategoryIds: number[] = [];

  if (interestBookIds.length > 0) {
    const { data: interestBooks } = await supabase
      .from("books")
      .select("id, category_id")
      .in("id", interestBookIds);

    interestCategoryIds = [
      ...new Set(
        (interestBooks || [])
          .map((book) => book.category_id)
          .filter((value): value is number => typeof value === "number"),
      ),
    ];
  }

  let recommendedBooks: Book[] = [];

  if (interestCategoryIds.length > 0) {
    const { data: recBooksNonOwn } = await supabase
      .from("books")
      .select(
        "id, title, author, price, image_url, location, category_id, seller_id",
      )
      .in("category_id", interestCategoryIds)
      .neq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const recNonOwn = uniqueBooks((recBooksNonOwn || []) as Book[]);

    if (recNonOwn.length > 0) {
      recommendedBooks = recNonOwn;
    } else {
      const { data: recFallback } = await supabase
        .from("books")
        .select(
          "id, title, author, price, image_url, location, category_id, seller_id",
        )
        .in("category_id", interestCategoryIds)
        .order("created_at", { ascending: false })
        .limit(10);

      recommendedBooks = uniqueBooks((recFallback || []) as Book[]);
    }
  }

  if (!recommendedBooks.length) {
    recommendedBooks = freshBooks.slice(0, 10);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#F8F3EC_0%,#F7EFE4_35%,#FFFDF9_100%)]">
      <LoggedInHeroCarousel books={recommendedBooks.slice(0, 6)} />

      <section className="border-b border-[#EADFD2] bg-[#FBF7F1]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:px-8">
          <InfoStripItem
            icon={<Heart size={18} />}
            title="Recommended for you"
            text="Books shaped by what you save and add to cart."
          />
          <InfoStripItem
            icon={<ArrowUpRight size={18} />}
            title="Clearer browsing"
            text="See the most relevant shelves first without repeated homepage sections."
          />
          <InfoStripItem
            icon={<ScanSearch size={18} />}
            title="Smoother discovery"
            text="Browse the marketplace faster with a cleaner and more focused layout."
          />
        </div>
      </section>

      <RailSection
        title={`Recommended for You${firstName ? `, ${firstName}` : ""}`}
        subtitle="Because of the categories you save, like, and add to cart."
        href="/marketplace"
        books={recommendedBooks}
        badge="For You"
      />

      <InfoFeatureSection />

      <RailSection
        title="Trending Now"
        subtitle="Books currently making the marketplace feel active and fresh."
        href="/marketplace"
        books={trendingBooks}
        badge="Trending"
      />

      <RailSection
        title="Fresh Listings"
        subtitle="Newly added books from sellers in the marketplace."
        href="/marketplace"
        books={freshBooks}
        badge="New Listing"
      />
    </main>
  );
}
