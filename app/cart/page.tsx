"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Minus, Plus, Trash2 } from "lucide-react";

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
      <main className="min-h-screen bg-[#F7F5F1] px-6 py-10">
        <div className="mx-auto max-w-6xl text-[#6B6B6B]">Loading cart...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E67E22]">
            Shopping Cart
          </p>
          <h1 className="mt-2 text-4xl font-bold text-[#1F1F1F]">My Cart</h1>
          <p className="mt-2 text-[#6B6B6B]">
            Review your selected books before proceeding to checkout.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-[#E5E0D8] bg-white p-8 shadow-sm">
            <p className="text-[#6B6B6B]">Your cart is empty.</p>
            <Link
              href="/marketplace"
              className="mt-4 inline-block rounded-full bg-[#E67E22] px-5 py-3 font-semibold text-white transition hover:bg-[#cf6f1c]"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-[#E5E0D8] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
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
                  className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                      className="rounded-3xl border border-[#E5E0D8] bg-white p-4 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center self-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleItemSelection(item.id)}
                              className="h-5 w-5 cursor-pointer accent-[#E67E22]"
                            />
                          </div>

                          <div className="flex flex-1 items-center gap-4">
                            {book?.image_url ? (
                              <img
                                src={book.image_url}
                                alt={book.title}
                                className="h-28 w-24 rounded-2xl object-cover"
                              />
                            ) : (
                              <div className="flex h-28 w-24 items-center justify-center rounded-2xl bg-[#F1ECE4] text-sm text-[#8A8175]">
                                No Image
                              </div>
                            )}

                            <div className="min-w-0">
                              <h2 className="text-lg font-semibold text-[#1F1F1F]">
                                {book?.title || "Unknown Book"}
                              </h2>

                              <p className="text-sm text-[#6B6B6B]">
                                {book?.author || "Unknown Author"}
                              </p>

                              <div className="mt-3 flex flex-wrap items-center gap-4">
                                <p className="font-bold text-[#E67E22]">
                                  ₱{book?.price || 0}
                                </p>

                                <p className="text-sm font-medium text-[#1F1F1F]">
                                  Subtotal: ₱{subtotal.toFixed(2)}
                                </p>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center gap-3">
                                <div className="flex items-center overflow-hidden rounded-full border border-[#E5E0D8] bg-[#FFFDF9]">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateQuantity(
                                        item.id,
                                        item.quantity - 1,
                                      )
                                    }
                                    disabled={
                                      item.quantity <= 1 || isQtyUpdating
                                    }
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
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => handleRemove(item.id)}
                            disabled={removingOneId === item.id}
                            className="inline-flex items-center gap-2 rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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

            <div className="h-fit rounded-3xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-[#1F1F1F]">
                Order Summary
              </h2>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-[#6B6B6B]">
                  <span>Selected Items</span>
                  <span>{selectedItems.length}</span>
                </div>

                <div className="flex items-center justify-between text-[#6B6B6B]">
                  <span>Total Quantity</span>
                  <span>{totalQuantity}</span>
                </div>

                <div className="border-t border-[#E5E0D8] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-[#1F1F1F]">
                      Total
                    </span>
                    <span className="text-3xl font-bold text-[#E67E22]">
                      ₱{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedItems.length > 0 ? (
                <Link
                  href={`/checkout?items=${selectedIds.join(",")}`}
                  className="mt-6 block w-full rounded-full bg-[#E67E22] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#cf6f1c]"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <div className="mt-6 block w-full rounded-full bg-gray-300 px-5 py-3 text-center font-semibold text-white">
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
