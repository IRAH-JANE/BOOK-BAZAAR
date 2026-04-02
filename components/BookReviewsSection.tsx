import { createSupabaseServer } from "@/lib/supabase-server";
import ReviewForm from "@/components/ReviewForm";
import { Star } from "lucide-react";

type BookReviewsSectionProps = {
  bookId: number;
};

type ReviewRow = {
  id: number;
  rating: number;
  review_text: string | null;
  created_at: string;
  user_id: string;
  profiles:
    | {
        full_name?: string | null;
        email?: string | null;
      }
    | {
        full_name?: string | null;
        email?: string | null;
      }[]
    | null;
};

function getProfileName(
  profile:
    | {
        full_name?: string | null;
        email?: string | null;
      }
    | {
        full_name?: string | null;
        email?: string | null;
      }[]
    | null,
) {
  if (Array.isArray(profile)) {
    const first = profile[0];
    return first?.full_name || first?.email || "Anonymous Buyer";
  }

  return profile?.full_name || profile?.email || "Anonymous Buyer";
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }).map((_, index) => {
    const filled = index < rating;

    return (
      <Star
        key={index}
        size={16}
        className={filled ? "fill-[#E67E22] text-[#E67E22]" : "text-[#D6CEC2]"}
      />
    );
  });
}

export default async function BookReviewsSection({
  bookId,
}: BookReviewsSectionProps) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reviewsData } = await supabase
    .from("book_reviews")
    .select(
      `
      id,
      rating,
      review_text,
      created_at,
      user_id,
      profiles (
        full_name,
        email
      )
      `,
    )
    .eq("book_id", bookId)
    .order("created_at", { ascending: false });

  const reviews = (reviewsData as ReviewRow[]) || [];

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
        totalReviews
      : 0;

  let canReview = false;
  let ownReview: ReviewRow | null = null;

  if (user) {
    ownReview = reviews.find((item) => item.user_id === user.id) || null;

    const { data: eligibleOrderItem } = await supabase
      .from("order_items")
      .select(
        `
        id,
        item_status,
        order_id,
        orders!inner (
          buyer_id
        )
        `,
      )
      .eq("book_id", bookId)
      .eq("orders.buyer_id", user.id)
      .eq("item_status", "received")
      .limit(1)
      .maybeSingle();

    canReview = !!eligibleOrderItem;
  }

  return (
    <section className="mt-10 sm:mt-14">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E67E22] sm:text-sm">
          Buyer Feedback
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
          Ratings & Reviews
        </h2>
        <p className="mt-2 text-sm text-[#6B6B6B] sm:text-base">
          Reviews from buyers who already received their order.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-[20px] border border-[#E5E0D8] bg-white p-6 shadow-sm sm:rounded-[24px]">
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-[#1F1F1F]">
              {averageRating.toFixed(1)}
            </span>
            <span className="pb-1 text-sm text-[#8A8175]">
              / 5 average rating
            </span>
          </div>

          <div className="mt-4 flex items-center gap-1">
            {renderStars(Math.round(averageRating))}
          </div>

          <p className="mt-3 text-sm text-[#6B6B6B]">
            {totalReviews} review{totalReviews === 1 ? "" : "s"}
          </p>

          <div className="mt-6 border-t border-[#EEE6DB] pt-6">
            <ReviewForm
              bookId={bookId}
              canReview={canReview}
              existingReview={
                ownReview
                  ? {
                      id: ownReview.id,
                      rating: ownReview.rating,
                      review_text: ownReview.review_text,
                    }
                  : null
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="rounded-[20px] border border-[#E5E0D8] bg-white p-6 text-sm text-[#6B6B6B] shadow-sm sm:rounded-[24px] sm:p-8 sm:text-base">
              No reviews yet for this book.
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-[20px] border border-[#E5E0D8] bg-white p-5 shadow-sm sm:rounded-[24px] sm:p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-[#1F1F1F]">
                      {getProfileName(review.profiles)}
                    </p>
                    <p className="mt-1 text-sm text-[#8A8175]">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                </div>

                {review.review_text && (
                  <p className="mt-4 text-sm leading-7 text-[#4F4A43] sm:text-base">
                    {review.review_text}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
