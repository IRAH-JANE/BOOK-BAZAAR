import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import ShopClient from "./ShopClient";

export default async function ShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServer();

  const { data: seller, error: sellerError } = await supabase
    .from("profiles")
    .select("*")
    .eq("shop_slug", slug)
    .single();

  if (sellerError || !seller) notFound();

  const { data: books, error: booksError } = await supabase
    .from("books")
    .select("*")
    .eq("seller_id", seller.id);

  if (booksError) {
    console.error("Error fetching books:", booksError);
  }

  const safeBooks = books || [];
  const bookIds = safeBooks.map((book) => book.id).filter(Boolean);

  let sellerAverageRating = 0;
  let sellerReviewCount = 0;

  if (bookIds.length > 0) {
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("book_reviews")
      .select("rating")
      .in("book_id", bookIds);

    if (reviewsError) {
      console.error("Error fetching seller reviews:", reviewsError);
    }

    const reviews = reviewsData || [];

    sellerReviewCount = reviews.length;

    sellerAverageRating =
      sellerReviewCount > 0
        ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
          sellerReviewCount
        : 0;
  }

  return (
    <ShopClient
      profile={{
        ...seller,
        seller_rating: sellerAverageRating,
        seller_review_count: sellerReviewCount,
      }}
      books={safeBooks}
    />
  );
}
