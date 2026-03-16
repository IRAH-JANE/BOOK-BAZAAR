"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Wallet,
  CreditCard,
  Landmark,
  Truck,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import PageLoader from "@/components/PageLoader";

type CartBook = {
  id: number;
  title: string;
  author: string;
  price: number;
  image_url: string | null;
  seller_id?: string | null;
};

type CartItem = {
  id: number;
  quantity: number;
  book_id?: number;
  books: CartBook | CartBook[] | null;
};

type ProfileAddress = {
  unit_number: string | null;
  street_address: string | null;
  barangay: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  postal_code: string | null;
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [shippingAddress, setShippingAddress] = useState("");
  const [hasSavedAddress, setHasSavedAddress] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [deliveryMethod, setDeliveryMethod] = useState("Standard Delivery");
  const [shippingNote, setShippingNote] = useState("");

  const [gcashName, setGcashName] = useState("");
  const [gcashNumber, setGcashNumber] = useState("");
  const [gcashReference, setGcashReference] = useState("");

  const [cardName, setCardName] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [cardReference, setCardReference] = useState("");

  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankReference, setBankReference] = useState("");

  const inputClass =
    "w-full rounded-2xl border border-[#DED8CF] bg-white px-4 py-3 text-[16px] text-[#5F5A52] outline-none transition focus:border-[#E67E22] focus:ring-1 focus:ring-[#E67E22]";

  const selectedCartIds = useMemo(() => {
    const raw = searchParams.get("items");
    if (!raw) return [];

    return raw
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isFinite(id) && id > 0);
  }, [searchParams]);

  const getBook = (item: CartItem): CartBook | null => {
    if (!item.books) return null;
    return Array.isArray(item.books) ? (item.books[0] ?? null) : item.books;
  };

  const fetchCheckoutData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select(
        "unit_number, street_address, barangay, city, province, country, postal_code",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (profileData) {
      const addressProfile = profileData as ProfileAddress;

      const fullAddress = [
        addressProfile.unit_number,
        addressProfile.street_address,
        addressProfile.barangay,
        addressProfile.city,
        addressProfile.province,
        addressProfile.country,
        addressProfile.postal_code,
      ]
        .filter(Boolean)
        .join(", ");

      if (fullAddress.trim()) {
        setShippingAddress(fullAddress);
        setHasSavedAddress(true);
      }
    }

    let query = supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        book_id,
        books (
          id,
          title,
          author,
          price,
          image_url,
          seller_id
        )
      `,
      )
      .eq("user_id", user.id);

    if (selectedCartIds.length > 0) {
      query = query.in("id", selectedCartIds);
    }

    const { data, error } = await query;

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setItems((data as CartItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCheckoutData();
  }, [selectedCartIds]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const book = getBook(item);
      return sum + (book?.price || 0) * item.quantity;
    }, 0);
  }, [items]);

  const shippingFee = useMemo(() => {
    if (deliveryMethod === "Standard Delivery") return 80;
    if (deliveryMethod === "Express Delivery") return 150;
    if (deliveryMethod === "Meet-up / Pick-up") return 0;
    return 0;
  }, [deliveryMethod]);

  const total = useMemo(() => {
    return subtotal + shippingFee;
  }, [subtotal, shippingFee]);

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const validatePaymentFields = () => {
    if (paymentMethod === "Cash on Delivery") {
      return { valid: true, summary: "Cash on Delivery" };
    }

    if (paymentMethod === "GCash") {
      if (!gcashName.trim() || !gcashNumber.trim() || !gcashReference.trim()) {
        return {
          valid: false,
          message: "Please complete the GCash payment details.",
        };
      }

      return {
        valid: true,
        summary: `GCash - ${gcashNumber.trim()} - Ref ${gcashReference.trim()}`,
      };
    }

    if (paymentMethod === "Debit / Credit Card") {
      if (!cardName.trim() || !cardLast4.trim() || !cardReference.trim()) {
        return {
          valid: false,
          message: "Please complete the card payment details.",
        };
      }

      if (!/^\d{4}$/.test(cardLast4.trim())) {
        return {
          valid: false,
          message: "Card last 4 digits must be exactly 4 numbers.",
        };
      }

      return {
        valid: true,
        summary: `Card - ****${cardLast4.trim()} - Ref ${cardReference.trim()}`,
      };
    }

    if (paymentMethod === "Bank Transfer") {
      if (
        !bankName.trim() ||
        !bankAccountName.trim() ||
        !bankReference.trim()
      ) {
        return {
          valid: false,
          message: "Please complete the bank transfer details.",
        };
      }

      return {
        valid: true,
        summary: `Bank Transfer - ${bankName.trim()} - Ref ${bankReference.trim()}`,
      };
    }

    return {
      valid: false,
      message: "Please choose a valid payment method.",
    };
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      alert("No shipping address found. Please update your profile address.");
      return;
    }

    if (items.length === 0) {
      alert("No selected items are ready for checkout.");
      return;
    }

    const paymentValidation = validatePaymentFields();

    if (!paymentValidation.valid) {
      alert(paymentValidation.message);
      return;
    }

    setPlacingOrder(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first.");
      setPlacingOrder(false);
      router.push("/login");
      return;
    }

    const paymentStatus =
      paymentMethod === "Cash on Delivery" ? "unpaid" : "pending_verification";

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          buyer_id: user.id,
          total_amount: total,
          shipping_address: shippingAddress,
          payment_method: paymentValidation.summary,
          payment_status: paymentStatus,
          delivery_method: deliveryMethod,
          shipping_note: shippingNote || null,
          shipping_fee: shippingFee,
          order_status: "pending",
        },
      ])
      .select("id")
      .single();

    if (orderError || !orderData) {
      alert(orderError?.message || "Failed to create order.");
      setPlacingOrder(false);
      return;
    }

    const orderItemsPayload = items
      .map((item) => {
        const book = getBook(item);
        if (!book) return null;

        return {
          order_id: orderData.id,
          book_id: book.id,
          seller_id: book.seller_id || null,
          quantity: item.quantity,
          price: book.price,
          item_status: "pending",
        };
      })
      .filter(Boolean);

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload as never[]);

    if (orderItemsError) {
      alert(orderItemsError.message);
      setPlacingOrder(false);
      return;
    }

    const cartIds = items.map((item) => item.id);

    const { error: clearCartError } = await supabase
      .from("cart_items")
      .delete()
      .in("id", cartIds);

    if (clearCartError) {
      alert(clearCartError.message);
      setPlacingOrder(false);
      return;
    }

    setPlacingOrder(false);
    alert("Order placed successfully.");
    router.push("/orders");
  };

  if (loading) {
    return (
      <PageLoader
        title="Loading checkout..."
        subtitle="Please wait while we prepare your checkout details."
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F1] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center rounded-full border border-[#D9D1C6] bg-white px-4 py-2 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
          >
            Back to Cart
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#E67E22] sm:text-sm">
            Secure Checkout
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#1F1F1F] sm:text-4xl">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-[#6B6B6B] sm:text-base">
            Review your selected books, choose delivery, and place your order.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
            <p className="text-sm text-[#6B6B6B] sm:text-base">
              No selected cart items are ready for checkout.
            </p>
            <Link
              href="/marketplace"
              className="mt-4 inline-block rounded-full bg-[#E67E22] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#cf6f1c] sm:text-base"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 shrink-0 text-[#E67E22]" size={20} />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#1F1F1F] sm:text-2xl">
                      Shipping Address
                    </h2>
                    <p className="mt-1 text-sm text-[#6B6B6B]">
                      This is automatically loaded from your profile.
                    </p>

                    <div className="mt-4 rounded-2xl bg-[#FFFDF9] p-4 ring-1 ring-[#EDE7DE]">
                      {hasSavedAddress ? (
                        <p className="break-words text-sm leading-7 text-[#1F1F1F] sm:text-base">
                          {shippingAddress}
                        </p>
                      ) : (
                        <p className="text-sm text-[#B94A48] sm:text-base">
                          No saved address found in your profile.
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => router.push("/profile")}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#D9D1C6] bg-white px-4 py-2 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F7F4EE]"
                    >
                      Update Address in Profile
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                <div className="flex items-start gap-3">
                  <Truck className="mt-1 shrink-0 text-[#E67E22]" size={20} />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#1F1F1F] sm:text-2xl">
                      Delivery Method
                    </h2>
                    <p className="mt-1 text-sm text-[#6B6B6B]">
                      Buyers choose the delivery option. Sellers provide the
                      courier and tracking details later.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    {
                      label: "Standard Delivery",
                      desc: "Affordable and commonly used delivery option.",
                    },
                    {
                      label: "Express Delivery",
                      desc: "Faster delivery with higher shipping fee.",
                    },
                    {
                      label: "Meet-up / Pick-up",
                      desc: "No courier needed. Buyer and seller coordinate directly.",
                    },
                  ].map((option) => (
                    <label
                      key={option.label}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition sm:items-center sm:gap-4 ${
                        deliveryMethod === option.label
                          ? "border-[#E67E22] bg-[#FFF7EF]"
                          : "border-[#E5E0D8] bg-[#FFFDF9]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_method"
                        value={option.label}
                        checked={deliveryMethod === option.label}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="mt-1 sm:mt-0"
                      />
                      <Truck
                        size={18}
                        className="mt-0.5 shrink-0 text-[#E67E22] sm:mt-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#1F1F1F]">
                          {option.label}
                        </p>
                        <p className="text-sm text-[#6B6B6B]">{option.desc}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-[#E67E22] sm:text-base">
                        {option.label === "Standard Delivery" && "₱80"}
                        {option.label === "Express Delivery" && "₱150"}
                        {option.label === "Meet-up / Pick-up" && "₱0"}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-[#6B6B6B]">
                    Shipping Note (Optional)
                  </label>
                  <textarea
                    value={shippingNote}
                    onChange={(e) => setShippingNote(e.target.value)}
                    rows={4}
                    placeholder="Example: Please call before delivery, or I prefer afternoon delivery."
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                <div className="flex items-start gap-3">
                  <Wallet className="mt-1 shrink-0 text-[#E67E22]" size={20} />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#1F1F1F] sm:text-2xl">
                      Payment Method
                    </h2>
                    <p className="mt-1 text-sm text-[#6B6B6B]">
                      Choose how you want to pay for this order.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    { label: "Cash on Delivery", icon: Truck },
                    { label: "GCash", icon: Wallet },
                    { label: "Debit / Credit Card", icon: CreditCard },
                    { label: "Bank Transfer", icon: Landmark },
                  ].map(({ label, icon: Icon }) => (
                    <label
                      key={label}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition sm:items-center sm:gap-4 ${
                        paymentMethod === label
                          ? "border-[#E67E22] bg-[#FFF7EF]"
                          : "border-[#E5E0D8] bg-[#FFFDF9]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={label}
                        checked={paymentMethod === label}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 sm:mt-0"
                      />
                      <Icon
                        size={18}
                        className="mt-0.5 shrink-0 text-[#E67E22] sm:mt-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1F1F1F]">{label}</p>
                        <p className="text-sm text-[#6B6B6B]">
                          {label === "Cash on Delivery" &&
                            "Pay when the order arrives."}
                          {label === "GCash" &&
                            "Enter your GCash account details and reference."}
                          {label === "Debit / Credit Card" &&
                            "Enter your card summary and payment reference."}
                          {label === "Bank Transfer" &&
                            "Provide your bank transfer details and reference."}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === "GCash" && (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <input
                      value={gcashName}
                      onChange={(e) => setGcashName(e.target.value)}
                      placeholder="GCash Account Name"
                      className={inputClass}
                    />
                    <input
                      value={gcashNumber}
                      onChange={(e) => setGcashNumber(e.target.value)}
                      placeholder="GCash Number"
                      className={inputClass}
                    />
                    <input
                      value={gcashReference}
                      onChange={(e) => setGcashReference(e.target.value)}
                      placeholder="GCash Reference Number"
                      className={`${inputClass} md:col-span-2`}
                    />
                  </div>
                )}

                {paymentMethod === "Debit / Credit Card" && (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Cardholder Name"
                      className={inputClass}
                    />
                    <input
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value)}
                      placeholder="Last 4 Digits of Card"
                      maxLength={4}
                      className={inputClass}
                    />
                    <input
                      value={cardReference}
                      onChange={(e) => setCardReference(e.target.value)}
                      placeholder="Card Payment Reference"
                      className={`${inputClass} md:col-span-2`}
                    />
                  </div>
                )}

                {paymentMethod === "Bank Transfer" && (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Bank Name"
                      className={inputClass}
                    />
                    <input
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="Account Name"
                      className={inputClass}
                    />
                    <input
                      value={bankReference}
                      onChange={(e) => setBankReference(e.target.value)}
                      placeholder="Bank Transfer Reference"
                      className={`${inputClass} md:col-span-2`}
                    />
                  </div>
                )}

                <div className="mt-5 rounded-2xl bg-[#F7F4EE] p-4 text-sm leading-7 text-[#6B6B6B]">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={18}
                      className="mt-1 shrink-0 text-[#E67E22]"
                    />
                    <p>
                      Non-COD orders can still remain{" "}
                      <span className="font-semibold text-[#1F1F1F]">
                        pending verification
                      </span>{" "}
                      until the seller fulfills the order and the buyer confirms
                      receipt.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
                <h2 className="text-xl font-bold text-[#1F1F1F] sm:text-2xl">
                  Order Items
                </h2>

                <div className="mt-4 space-y-4">
                  {items.map((item) => {
                    const book = getBook(item);

                    return (
                      <div
                        key={item.id}
                        className="flex gap-3 rounded-2xl border border-[#E5E0D8] bg-[#FFFDF9] p-4 sm:gap-4"
                      >
                        {book?.image_url ? (
                          <img
                            src={book.image_url}
                            alt={book.title}
                            className="h-20 w-16 shrink-0 rounded-xl object-cover sm:h-24 sm:w-20"
                          />
                        ) : (
                          <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-xl bg-[#F1ECE4] text-[10px] text-[#8A8175] sm:h-24 sm:w-20 sm:text-xs">
                            No Image
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-base font-semibold text-[#1F1F1F] sm:text-lg">
                            {book?.title || "Unknown Book"}
                          </h3>
                          <p className="text-sm text-[#6B6B6B]">
                            {book?.author || "Unknown Author"}
                          </p>
                          <p className="mt-2 text-sm text-[#8A8175]">
                            Quantity: {item.quantity}
                          </p>
                          <p className="mt-2 font-bold text-[#E67E22]">
                            ₱{((book?.price || 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="h-fit rounded-2xl border border-[#E5E0D8] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
              <h2 className="text-xl font-bold text-[#1F1F1F] sm:text-2xl">
                Order Summary
              </h2>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between gap-4 text-sm text-[#6B6B6B] sm:text-base">
                  <span>Selected Books</span>
                  <span>{items.length}</span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm text-[#6B6B6B] sm:text-base">
                  <span>Total Quantity</span>
                  <span>{totalQuantity}</span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm text-[#6B6B6B] sm:text-base">
                  <span>Items Subtotal</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm text-[#6B6B6B] sm:text-base">
                  <span>Shipping Fee</span>
                  <span>₱{shippingFee.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm text-[#6B6B6B] sm:text-base">
                  <span>Payment Method</span>
                  <span className="text-right">{paymentMethod}</span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm text-[#6B6B6B] sm:text-base">
                  <span>Delivery Method</span>
                  <span className="text-right">{deliveryMethod}</span>
                </div>

                <div className="border-t border-[#E5E0D8] pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-lg font-semibold text-[#1F1F1F]">
                      Grand Total
                    </span>
                    <span className="break-words text-right text-2xl font-bold text-[#E67E22] sm:text-3xl">
                      ₱{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !hasSavedAddress}
                className="mt-6 w-full rounded-full bg-[#E67E22] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#cf6f1c] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>

              {!hasSavedAddress && (
                <p className="mt-3 text-center text-sm text-[#B94A48]">
                  Please complete your profile address before placing an order.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <PageLoader
          title="Loading checkout..."
          subtitle="Please wait while we prepare your checkout details."
        />
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
