"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";
import { Heart, MessageCircle, ShoppingCart } from "lucide-react";

type BookActionsProps = {
  bookId: number;
};

export default function BookActions({ bookId }: BookActionsProps) {
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const { showToast } = useToast();
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    const loadWishlistState = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .maybeSingle();

      setWishlisted(!!data);
    };

    loadWishlistState();
  }, [bookId]);

  const handleAddToCart = async () => {
    setLoadingCart(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showToast({
        title: "Login required",
        message: "Please log in first.",
        type: "info",
      });
      setLoadingCart(false);
      return;
    }

    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .maybeSingle();

    if (existingItem) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);

      setLoadingCart(false);

      if (error) {
        showToast({
          title: "Cart update failed",
          message: error.message,
          type: "error",
        });
        return;
      }

      showToast({
        title: "Cart updated",
        message: "Book quantity updated in cart.",
        type: "success",
      });
      return;
    }

    const { error } = await supabase.from("cart_items").insert([
      {
        user_id: user.id,
        book_id: bookId,
        quantity: 1,
      },
    ]);

    setLoadingCart(false);

    if (error) {
      showToast({
        title: "Add to cart failed",
        message: error.message,
        type: "error",
      });
      return;
    }

    showToast({
      title: "Added to cart",
      message: "Book added to cart.",
      type: "success",
    });
  };

  const handleWishlist = async () => {
    setLoadingWishlist(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showToast({
        title: "Login required",
        message: "Please log in first.",
        type: "info",
      });
      setLoadingWishlist(false);
      return;
    }

    const { data: existing } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", bookId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("id", existing.id);

      setLoadingWishlist(false);

      if (error) {
        showToast({
          title: "Wishlist update failed",
          message: error.message,
          type: "error",
        });
        return;
      }

      setWishlisted(false);
      showToast({
        title: "Removed from wishlist",
        message: "The book was removed from your wishlist.",
        type: "success",
      });
      return;
    }

    const { error } = await supabase.from("wishlists").insert([
      {
        user_id: user.id,
        book_id: bookId,
      },
    ]);

    setLoadingWishlist(false);

    if (error) {
      showToast({
        title: "Wishlist update failed",
        message: error.message,
        type: "error",
      });
      return;
    }

    setWishlisted(true);
    showToast({
      title: "Saved to wishlist",
      message: "The book was added to your wishlist.",
      type: "success",
    });
  };

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <button className="inline-flex items-center gap-2 rounded-full bg-[#E67E22] px-5 py-3 font-semibold text-white transition hover:bg-[#cf6f1c]">
        <MessageCircle size={16} />
        Contact Seller
      </button>

      <button
        onClick={handleAddToCart}
        disabled={loadingCart}
        className="inline-flex items-center gap-2 rounded-full border border-[#E67E22] bg-white px-5 py-3 font-semibold text-[#E67E22] transition hover:bg-[#E67E22] hover:text-white disabled:opacity-50"
      >
        <ShoppingCart size={16} />
        {loadingCart ? "Adding..." : "Add to Cart"}
      </button>

      <button
        onClick={handleWishlist}
        disabled={loadingWishlist}
        className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 font-semibold transition disabled:opacity-50 ${
          wishlisted
            ? "border-red-500 bg-red-50 text-red-500"
            : "border-[#D9D1C6] bg-white text-[#1F1F1F] hover:bg-[#F7F4EE]"
        }`}
      >
        <Heart
          size={16}
          className={wishlisted ? "fill-red-500 text-red-500" : ""}
        />
        {loadingWishlist
          ? "Saving..."
          : wishlisted
            ? "Saved"
            : "Save to Wishlist"}
      </button>
    </div>
  );
}
