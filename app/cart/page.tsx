"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

type CartBook = {
  id: number;
  title: string;
  author: string;
  price: number;
  image_url: string | null;
};

type CartItem = {
  id: number;
  quantity: number;
  books: CartBook | CartBook[] | null;
};

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[#E9E3D9] ${className}`} />
  );
}

function CartPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[32px] border border-[#EEE7DC] bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F9F4EC] px-6 py-8 shadow-[0_12px_40px_rgba(31,31,31,0.06)] sm:px-8 sm:py-10">
          <SkeletonBox className="h-5 w-28 rounded-full" />
          <SkeletonBox className="mt-4 h-12 w-52" />
          <SkeletonBox className="mt-3 h-5 w-80 max-w-full" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
          <div>
            <div className="mb-4 rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-4 shadow-[0_8px_24px_rgba(31,31,31,0.05)] sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <SkeletonBox className="h-5 w-5 rounded-md" />
                  <SkeletonBox className="h-4 w-24" />
                </div>

                <SkeletonBox className="h-10 w-full rounded-full sm:w-40" />
              </div>
            </div>

            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-4 shadow-[0_10px_28px_rgba(31,31,31,0.05)] sm:p-5"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-3 sm:gap-4">
                      <SkeletonBox className="mt-10 h-5 w-5 rounded-md" />
                      <SkeletonBox className="h-28 w-24 shrink-0 rounded-[22px]" />

                      <div className="min-w-0 flex-1">
                        <SkeletonBox className="h-6 w-2/3" />
                        <SkeletonBox className="mt-2 h-4 w-32" />
                        <SkeletonBox className="mt-4 h-5 w-24" />
                        <SkeletonBox className="mt-2 h-4 w-28" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-[#F0EAE2] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <SkeletonBox className="h-11 w-36 rounded-full" />
                        <SkeletonBox className="h-4 w-20" />
                      </div>

                      <SkeletonBox className="h-10 w-full rounded-full sm:w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-5 shadow-[0_12px_30px_rgba(31,31,31,0.06)] sm:p-6">
              <SkeletonBox className="h-8 w-40" />

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <SkeletonBox className="h-4 w-28" />
                  <SkeletonBox className="h-4 w-8" />
                </div>
                <div className="flex items-center justify-between">
                  <SkeletonBox className="h-4 w-28" />
                  <SkeletonBox className="h-4 w-8" />
                </div>
                <div className="border-t border-[#E5E0D8] pt-4">
                  <div className="flex items-center justify-between">
                    <SkeletonBox className="h-5 w-14" />
                    <SkeletonBox className="h-8 w-28" />
                  </div>
                </div>
              </div>

              <SkeletonBox className="mt-6 h-12 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [removingSelected, setRemovingSelected] = useState(false);
  const [removingOneId, setRemovingOneId] = useState<number | null>(null);
  const [updatingQtyId, setUpdatingQtyId] = useState<number | null>(null);

  const isMountedRef = useRef(true);
  const latestRequestRef = useRef(0);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const supabase = createSupabaseBrowser();

  const getBook = (item: CartItem): CartBook | null => {
    if (!item.books) return null;
    return Array.isArray(item.books) ? (item.books[0] ?? null) : item.books;
  };

  const fetchCart = useCallback(async () => {
    const requestId = ++latestRequestRef.current;

    try {
      if (isMountedRef.current) {
        setLoading(true);
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        if (isMountedRef.current && requestId === latestRequestRef.current) {
          setItems([]);
          setSelectedIds([]);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
          id,
          quantity,
          books (
            id,
            title,
            author,
            price,
            image_url
          )
          `,
        )
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      if (error) throw error;

      if (!isMountedRef.current || requestId !== latestRequestRef.current) {
        return;
      }

      const cartItems = (data as CartItem[]) || [];
      setItems(cartItems);

      setSelectedIds((prev) =>
        prev.filter((id) => cartItems.some((item) => item.id === id)),
      );
    } catch (error) {
      console.error("Failed to load cart:", error);

      if (isMountedRef.current && requestId === latestRequestRef.current) {
        setItems([]);
      }
    } finally {
      if (isMountedRef.current && requestId === latestRequestRef.current) {
        setLoading(false);
      }
    }
  }, [supabase]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchCart();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchCart]);

  const handleRemove = async (cartId: number) => {
    const confirmed = await confirm({
      title: "Remove Item?",
      message: "Are you sure you want to remove this item from your cart?",
      confirmText: "Remove",
      cancelText: "Keep Item",
      danger: true,
    });

    if (!confirmed) return;

    try {
      setRemovingOneId(cartId);

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartId);

      if (error) throw error;

      setSelectedIds((prev) => prev.filter((id) => id !== cartId));
      await fetchCart();

      showToast({
        title: "Item removed",
        message: "The item has been removed from your cart.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to remove item:", error);
      showToast({
        title: "Remove failed",
        message: "Failed to remove item from cart.",
        type: "error",
      });
    } finally {
      setRemovingOneId(null);
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) {
      showToast({
        title: "No items selected",
        message: "Please select at least one item.",
        type: "info",
      });
      return;
    }

    const confirmed = await confirm({
      title: "Remove Selected Items?",
      message:
        "Are you sure you want to remove all selected items from your cart?",
      confirmText: "Remove Selected",
      cancelText: "Keep Items",
      danger: true,
    });

    if (!confirmed) return;

    try {
      setRemovingSelected(true);

      const idsToRemove = [...selectedIds];

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .in("id", idsToRemove);

      if (error) throw error;

      setSelectedIds([]);
      await fetchCart();

      showToast({
        title: "Selected items removed",
        message: "The selected items have been removed from your cart.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to remove selected items:", error);
      showToast({
        title: "Remove failed",
        message: "Failed to remove selected items.",
        type: "error",
      });
    } finally {
      setRemovingSelected(false);
    }
  };

  const handleUpdateQuantity = async (cartId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingQtyId(cartId);

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", cartId);

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) =>
          item.id === cartId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    } catch (error) {
      console.error("Failed to update quantity:", error);
      showToast({
        title: "Update failed",
        message: "Failed to update quantity.",
        type: "error",
      });
    } finally {
      setUpdatingQtyId(null);
    }
  };

  const toggleItemSelection = (cartId: number) => {
    setSelectedIds((prev) =>
      prev.includes(cartId)
        ? prev.filter((id) => id !== cartId)
        : [...prev, cartId],
    );
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(items.map((item) => item.id));
  };

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.includes(item.id));
  }, [items, selectedIds]);

  const total = selectedItems.reduce((sum, item) => {
    const book = getBook(item);
    return sum + (book?.price || 0) * item.quantity;
  }, 0);

  const totalQuantity = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  if (loading) {
    return <CartPageSkeleton />;
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[32px] border border-[#EEE7DC] bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F9F4EC] px-6 py-8 shadow-[0_12px_40px_rgba(31,31,31,0.06)] sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#E67E22]/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#F3C998]/20 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="inline-flex rounded-full bg-[#E67E22]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#C96A16]">
                Shopping Cart
              </p>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#1F1F1F] sm:text-4xl lg:text-5xl">
                My Cart
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[#6B6B6B] sm:text-base">
                Review your selected books, update quantities, and prepare your
                order before proceeding to checkout.
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
              <div className="rounded-2xl border border-[#E8DED1] bg-white/80 px-5 py-4 text-center shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8175]">
                  Cart Items
                </p>
                <p className="mt-1 text-2xl font-bold text-[#1F1F1F]">
                  {items.length}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E8DED1] bg-white/80 px-5 py-4 text-center shadow-sm backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8175]">
                  Selected
                </p>
                <p className="mt-1 text-2xl font-bold text-[#1F1F1F]">
                  {selectedItems.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="mt-8 overflow-hidden rounded-[32px] border border-[#E8E1D7] bg-[#FFFDF9] p-8 text-center shadow-[0_12px_30px_rgba(31,31,31,0.05)] sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF3E7] text-[#E67E22] shadow-sm">
              <ShoppingBag size={32} />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-[#1F1F1F]">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#6B6B6B] sm:text-base">
              Add books to your cart and come back here anytime to review your
              order before checkout.
            </p>

            <Link
              href="/marketplace"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#E67E22] px-7 py-3 font-semibold text-white transition duration-200 hover:bg-[#cf6f1c]"
            >
              Browse Books
            </Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
            <div>
              <div className="mb-4 rounded-[28px] border border-[#E8E1D7] bg-[#FFFDF9] p-4 shadow-[0_8px_24px_rgba(31,31,31,0.05)] sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-3 text-sm font-semibold text-[#1F1F1F]">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 accent-[#E67E22]"
                    />
                    Select All Items
                  </label>

                  <button
                    onClick={handleRemoveSelected}
                    disabled={removingSelected || selectedIds.length === 0}
                    className="inline-flex w-full items-center justify-center rounded-full border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {removingSelected ? "Removing..." : "Remove Selected"}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const book = getBook(item);
                  const isSelected = selectedIds.includes(item.id);
                  const subtotal = (book?.price || 0) * item.quantity;
                  const isQtyUpdating = updatingQtyId === item.id;

                  return (
                    <article
                      key={item.id}
                      onClick={() => toggleItemSelection(item.id)}
                      className={`cursor-pointer overflow-hidden rounded-[28px] border bg-[#FFFDF9] p-4 shadow-[0_10px_28px_rgba(31,31,31,0.05)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(31,31,31,0.08)] sm:p-5 ${
                        isSelected
                          ? "border-[#E8B27C] ring-1 ring-[#E8B27C]/30"
                          : "border-[#E8E1D7]"
                      }`}
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-3 sm:gap-4">
                          <div className="flex items-center pt-10">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleItemSelection(item.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-5 w-5 cursor-pointer accent-[#E67E22]"
                            />
                          </div>

                          <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                            {book?.image_url ? (
                              <img
                                src={book.image_url}
                                alt={book.title}
                                className="h-28 w-24 shrink-0 rounded-[22px] object-cover shadow-sm"
                              />
                            ) : (
                              <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-[22px] bg-[#F1ECE4] px-3 text-center text-xs font-medium text-[#8A8175]">
                                No Image
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <h2 className="break-words text-lg font-bold leading-7 text-[#1F1F1F]">
                                {book?.title || "Unknown Book"}
                              </h2>

                              <p className="mt-1 text-sm text-[#6B6B6B]">
                                {book?.author || "Unknown Author"}
                              </p>

                              <div className="mt-4 flex flex-wrap items-center gap-3">
                                <span className="rounded-full bg-[#FFF3E7] px-3 py-1 text-sm font-semibold text-[#C96A16]">
                                  ₱{book?.price || 0}
                                </span>

                                <span className="text-sm font-medium text-[#7A6F61]">
                                  Subtotal: ₱{subtotal.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-[#F0EAE2] pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center overflow-hidden rounded-full border border-[#E5E0D8] bg-white shadow-sm">
                              <button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    handleUpdateQuantity(item.id, item.quantity - 1);
  }}
  disabled={item.quantity <= 1 || isQtyUpdating}
  className="flex h-11 w-11 items-center justify-center text-[#1F1F1F] transition hover:bg-[#F7F4EE] disabled:cursor-not-allowed disabled:opacity-40"
>
  <Minus size={16} />
</button>

                              <div className="min-w-[52px] text-center text-sm font-semibold text-[#1F1F1F]">
                                {isQtyUpdating ? "..." : item.quantity}
                              </div>

                              <button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    handleUpdateQuantity(item.id, item.quantity + 1);
  }}
  disabled={isQtyUpdating}
  className="flex h-11 w-11 items-center justify-center text-[#1F1F1F] transition hover:bg-[#F7F4EE] disabled:cursor-not-allowed disabled:opacity-40"
>
  <Plus size={16} />
</button>
                            </div>

                            <p className="text-sm text-[#8A8175]">
                              Quantity: {item.quantity}
                            </p>
                          </div>

                          <button
                            onClick={() => handleRemove(item.id)}
                            disabled={removingOneId === item.id}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                          >
                            <Trash2 size={16} />
                            {removingOneId === item.id
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-[30px] border border-[#E8E1D7] bg-[#FFFDF9] shadow-[0_14px_34px_rgba(31,31,31,0.07)]">
                <div className="border-b border-[#F0EAE2] bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F9F4EC] p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-[#1F1F1F] sm:text-2xl">
                    Order Summary
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
                    Only selected items will be included in checkout.
                  </p>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-[#6B6B6B] sm:text-base">
                      <span>Selected Items</span>
                      <span className="font-semibold text-[#1F1F1F]">
                        {selectedItems.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-[#6B6B6B] sm:text-base">
                      <span>Total Quantity</span>
                      <span className="font-semibold text-[#1F1F1F]">
                        {totalQuantity}
                      </span>
                    </div>

                    <div className="rounded-2xl bg-[#FCF7F0] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-base font-semibold text-[#1F1F1F]">
                          Total
                        </span>
                        <span className="break-words text-right text-2xl font-bold text-[#E67E22] sm:text-3xl">
                          ₱{total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedItems.length > 0 ? (
                    <Link
                      href={`/checkout?items=${selectedIds.join(",")}`}
                      className="mt-6 block w-full rounded-full bg-[#E67E22] px-5 py-3.5 text-center text-sm font-semibold text-white transition duration-200 hover:bg-[#cf6f1c] sm:text-base"
                    >
                      Proceed to Checkout
                    </Link>
                  ) : (
                    <div className="mt-6 block w-full rounded-full bg-gray-300 px-5 py-3.5 text-center text-sm font-semibold text-white sm:text-base">
                      Proceed to Checkout
                    </div>
                  )}

                  {selectedItems.length === 0 && (
                    <p className="mt-3 text-center text-sm text-[#8A8175]">
                      Select at least one item to continue.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
