"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

type ExistingReview = {
  id: number;
  rating: number;
  review_text: string | null;
} | null;

type ReviewFormProps = {
  bookId: number;
  canReview: boolean;
  existingReview: ExistingReview;
};

export default function ReviewForm({
  bookId,
  canReview,
  existingReview,
}: ReviewFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createSupabaseBrowser();

  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [hovered, setHovered] = useState<number>(0);
  const [reviewText, setReviewText] = useState(
    existingReview?.review_text || "",
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEditing = !!existingReview;

  const helperText = useMemo(() => {
    if (canReview) {
      return isEditing
        ? "You can update your review anytime."
        : "Only buyers who already received the item can review this book.";
    }

    return "You can review this book only after you buy it and mark the item as received.";
  }, [canReview, isEditing]);

  const handleSubmit = async () => {
    if (!canReview) {
      showToast({
        title: "Review not allowed",
        message: "Only eligible buyers can review this book.",
        type: "info",
      });
      return;
    }

    if (!rating) {
      showToast({
        title: "Rating required",
        message: "Please choose a star rating first.",
        type: "info",
      });
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast({
          title: "Login required",
          message: "Please log in first.",
          type: "info",
        });
        return;
      }

      if (existingReview) {
        const { error } = await supabase
          .from("book_reviews")
          .update({
            rating,
            review_text: reviewText.trim() || null,
          })
          .eq("id", existingReview.id);

        if (error) throw error;

        showToast({
          title: "Review updated",
          message: "Your review was updated successfully.",
          type: "success",
        });
      } else {
        const { error } = await supabase.from("book_reviews").insert([
          {
            book_id: bookId,
            user_id: user.id,
            rating,
            review_text: reviewText.trim() || null,
          },
        ]);

        if (error) throw error;

        showToast({
          title: "Review submitted",
          message: "Thank you for rating this book.",
          type: "success",
        });
      }

      router.refresh();
    } catch (error: any) {
      showToast({
        title: "Review failed",
        message:
          error?.message || "Something went wrong while saving your review.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;

    try {
      setDeleting(true);

      const { error } = await supabase
        .from("book_reviews")
        .delete()
        .eq("id", existingReview.id);

      if (error) throw error;

      showToast({
        title: "Review removed",
        message: "Your review was deleted.",
        type: "success",
      });

      router.refresh();
    } catch (error: any) {
      showToast({
        title: "Delete failed",
        message: error?.message || "Could not delete your review.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-[#1F1F1F]">
        {isEditing ? "Your Review" : "Write a Review"}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">{helperText}</p>

      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => {
          const active = (hovered || rating) >= value;

          return (
            <button
              key={value}
              type="button"
              disabled={!canReview || saving}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(value)}
              className="rounded-full p-1 disabled:cursor-not-allowed"
            >
              <Star
                size={24}
                className={
                  active ? "fill-[#E67E22] text-[#E67E22]" : "text-[#D6CEC2]"
                }
              />
            </button>
          );
        })}
      </div>

      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        disabled={!canReview || saving}
        rows={4}
        placeholder="Share your experience with this book..."
        className="mt-4 w-full rounded-2xl border border-[#DED8CF] bg-white px-4 py-3 text-sm text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22] disabled:bg-[#F7F4EE]"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canReview || saving}
          className="inline-flex items-center justify-center rounded-full bg-[#E67E22] px-5 py-3 font-semibold text-white transition hover:bg-[#cf6f1c] disabled:opacity-50"
        >
          {saving ? "Saving..." : isEditing ? "Update Review" : "Submit Review"}
        </button>

        {existingReview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="inline-flex items-center justify-center rounded-full border border-[#D9D1C6] bg-white px-5 py-3 font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE] disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Review"}
          </button>
        )}
      </div>
    </div>
  );
}
