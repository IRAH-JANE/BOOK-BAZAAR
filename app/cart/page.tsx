"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Minus, Plus, Trash2 } from "lucide-react";
import PageLoader from "@/components/PageLoader";

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

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [removingSelected, setRemovingSelected] = useState(false);
  const [removingOneId, setRemovingOneId] = useState<number | null>(null);
  const [updatingQtyId, setUpdatingQtyId] = useState<number | null>(null);

  const isMountedRef = useRef(true);
  const latestRequestRef = useRef(0);

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
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchCart();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchCart]);

  const handleRemove = async (cartId: number) => {
    try {
      setRemovingOneId(cartId);

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartId);

      if (error) throw error;

      setSelectedIds((prev) => prev.filter((id) => id !== cartId));
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove item:", error);
      alert("Failed to remove item from cart.");
    } finally {
      setRemovingOneId(null);
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one item.");
      return;
    }

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
    } catch (error) {
      console.error("Failed to remove selected items:", error);
      alert("Failed to remove selected items.");
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
      alert("Failed to update quantity.");
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
    return (
      <PageLoader
        title="Loading cart..."
        subtitle="Please wait while we load your cart items."
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E67E22] sm:text-sm">
            Shopping Cart
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1F1F1F] sm:text-4xl">
            My Cart
          </h1>
          <p className="mt-2 text-sm text-[#6B6B6B] sm:text-base">
            Review your selected books before proceeding to checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
            <p className="text-sm text-[#6B6B6B] sm:text-base">
              Your cart is empty.
            </p>
            <Link
              href="/marketplace"
              className="mt-4 inline-block rounded-full bg-[#E67E22] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#cf6f1c] sm:text-base"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-8">
            <div>
              <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:rounded-3xl sm:p-5">
                <label className="flex items-center gap-3 text-sm font-medium text-[#1F1F1F]">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 accent-[#E67E22]"
                  />
                  Select All
                </label>

                <button
                  onClick={handleRemoveSelected}
                  disabled={removingSelected || selectedIds.length === 0}
                  className="w-full rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {removingSelected ? "Removing..." : "Remove Selected"}
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const book = getBook(item);
                  const isSelected = selectedIds.includes(item.id);
                  const subtotal = (book?.price || 0) * item.quantity;
                  const isQtyUpdating = updatingQtyId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm transition hover:shadow-md sm:rounded-3xl"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleItemSelection(item.id)}
                              className="h-5 w-5 cursor-pointer accent-[#E67E22]"
                            />
                          </div>

                          <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                            {book?.image_url ? (
                              <img
                                src={book.image_url}
                                alt={book.title}
                                className="h-24 w-20 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-24"
                              />
                            ) : (
                              <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#F1ECE4] text-xs text-[#8A8175] sm:h-28 sm:w-24 sm:text-sm">
                                No Image
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <h2 className="break-words text-base font-semibold text-[#1F1F1F] sm:text-lg">
                                {book?.title || "Unknown Book"}
                              </h2>

                              <p className="mt-1 text-sm text-[#6B6B6B]">
                                {book?.author || "Unknown Author"}
                              </p>

                              <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                                <p className="font-bold text-[#E67E22]">
                                  ₱{book?.price || 0}
                                </p>

                                <p className="text-sm font-medium text-[#1F1F1F]">
                                  Subtotal: ₱{subtotal.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-[#F0EAE2] pt-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center overflow-hidden rounded-full border border-[#E5E0D8] bg-[#FFFDF9]">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity - 1,
                                  )
                                }
                                disabled={item.quantity <= 1 || isQtyUpdating}
                                className="flex h-10 w-10 items-center justify-center text-[#1F1F1F] transition hover:bg-[#F7F4EE] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Minus size={16} />
                              </button>

                              <div className="min-w-[48px] text-center text-sm font-semibold text-[#1F1F1F]">
                                {isQtyUpdating ? "..." : item.quantity}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.id,
                                    item.quantity + 1,
                                  )
                                }
                                disabled={isQtyUpdating}
                                className="flex h-10 w-10 items-center justify-center text-[#1F1F1F] transition hover:bg-[#F7F4EE] disabled:cursor-not-allowed disabled:opacity-40"
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
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                          >
                            <Trash2 size={16} />
                            {removingOneId === item.id
                              ? "Removing..."
                              : "Remove"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-fit rounded-2xl border border-[#E5E0D8] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
              <h2 className="text-xl font-bold text-[#1F1F1F] sm:text-2xl">
                Order Summary
              </h2>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm text-[#6B6B6B] sm:text-base">
                  <span>Selected Items</span>
                  <span>{selectedItems.length}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-[#6B6B6B] sm:text-base">
                  <span>Total Quantity</span>
                  <span>{totalQuantity}</span>
                </div>

                <div className="border-t border-[#E5E0D8] pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-lg font-semibold text-[#1F1F1F]">
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
                  className="mt-6 block w-full rounded-full bg-[#E67E22] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#cf6f1c] sm:text-base"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <div className="mt-6 block w-full rounded-full bg-gray-300 px-5 py-3 text-center text-sm font-semibold text-white sm:text-base">
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
        )}
      </div>
    </main>
  );
}
