"use client";

import React from "react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  ArrowRight,
} from "lucide-react";

type Book = {
  id: string | number;
  title: string;
  author: string;
  price: number;
  image_url?: string | null;
  location?: string | null;
};

type LoggedInHeroCarouselProps = {
  books: (Book | null | undefined)[];
};

const ANIMATION_MS = 520;

export default function LoggedInHeroCarousel({
  books,
}: LoggedInHeroCarouselProps) {
  const safeBooks = useMemo(() => books.filter(Boolean) as Book[], [books]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!safeBooks.length) return;

    if (currentIndex >= safeBooks.length) {
      setCurrentIndex(0);
      setNextIndex(null);
      setIsAnimating(false);
    }
  }, [safeBooks.length, currentIndex]);

  const startTransition = (targetIndex: number) => {
    if (!safeBooks.length || isAnimating || targetIndex === currentIndex)
      return;

    setNextIndex(targetIndex);
    setIsAnimating(true);

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    timeoutRef.current = window.setTimeout(() => {
      setCurrentIndex(targetIndex);
      setNextIndex(null);
      setIsAnimating(false);
    }, ANIMATION_MS);
  };

  useEffect(() => {
    if (safeBooks.length <= 1 || isPaused || isAnimating) return;

    const interval = window.setInterval(() => {
      startTransition((currentIndex + 1) % safeBooks.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, [safeBooks.length, isPaused, isAnimating, currentIndex]);

  if (!safeBooks.length) return null;

  const currentBook = safeBooks[currentIndex];
  const incomingBook = nextIndex !== null ? safeBooks[nextIndex] : null;

  const goPrev = () => {
    startTransition((currentIndex - 1 + safeBooks.length) % safeBooks.length);
  };

  const goNext = () => {
    startTransition((currentIndex + 1) % safeBooks.length);
  };

  return (
    <section
      className="group relative overflow-hidden border-b border-[#EADFD2] bg-[#F7F1E8] text-[#1F1F1F]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0">
        {currentBook.image_url ? (
          <img
            src={currentBook.image_url}
            alt={currentBook.title}
            className="h-full w-full object-cover opacity-[0.10] transition duration-700"
          />
        ) : (
          <div className="h-full w-full bg-[#F5EDE2]" />
        )}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(230,126,34,0.16)_0%,rgba(247,241,232,0.94)_34%,rgba(255,253,249,0.97)_68%,rgba(247,241,232,1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(247,241,232,0.90)_0%,rgba(255,253,249,0.88)_38%,rgba(247,241,232,0.72)_64%,rgba(247,241,232,0.92)_100%)]" />
      <div className="absolute -left-20 top-6 h-72 w-72 rounded-full bg-[#E67E22]/16 blur-3xl" />
      <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-[#F2C998]/18 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="hidden lg:flex lg:justify-center">
            <div className="relative h-[450px] w-[390px]">
              {/* strong orange background plate */}
              <div className="absolute left-[70px] top-[70px] h-[270px] w-[220px] rotate-[-12deg] rounded-[30px] bg-gradient-to-br from-[#E67E22] to-[#F2C998] opacity-90 shadow-[0_20px_50px_rgba(230,126,34,0.35)]" />

              {/* dark depth plate */}
              <div className="absolute left-[110px] top-[40px] h-[300px] w-[240px] rotate-[8deg] rounded-[34px] bg-[#2A211B]/10 shadow-[0_20px_60px_rgba(0,0,0,0.15)]" />

              {/* thin design lines (para dili plain) */}
              <div className="absolute left-[60px] top-[40px] h-[320px] w-[260px] rotate-[6deg] rounded-[40px] border border-[#E67E22]/30" />
              <div className="absolute left-[90px] top-[100px] h-[200px] w-[200px] rotate-[-6deg] rounded-[30px] border border-[#E67E22]/20" />

              {/* main image container */}
              <div className="absolute left-[120px] top-[40px] h-[370px] w-[250px]">
                {/* premium frame */}
                <div className="absolute -inset-[10px] rounded-[30px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]" />

                {/* inner container */}
                <div className="relative h-full w-full overflow-hidden rounded-[24px] border border-[#EADFD2] bg-white">
                  {/* subtle glow overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />

                  {/* left spine effect */}
                  <div className="absolute inset-y-0 left-0 w-[12px] bg-gradient-to-r from-black/10 to-transparent" />

                  <Link
                    key={`current-${currentBook.id}`}
                    href={`/book/${currentBook.id}`}
                    className={`absolute inset-0 block ${
                      isAnimating ? "animate-[heroOut_520ms_ease_forwards]" : ""
                    }`}
                  >
                    {currentBook.image_url ? (
                      <img
                        src={currentBook.image_url}
                        alt={currentBook.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#EFE8DE] text-[#7B7368]">
                        No Image
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
                  </Link>

                  {incomingBook ? (
                    <Link
                      key={`next-${incomingBook.id}`}
                      href={`/book/${incomingBook.id}`}
                      className="absolute inset-0 block animate-[heroIn_520ms_ease_forwards]"
                    >
                      {incomingBook.image_url ? (
                        <img
                          src={incomingBook.image_url}
                          alt={incomingBook.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[#EFE8DE] text-[#7B7368]">
                          No Image
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-3xl">
            <div className="flex min-h-[470px] flex-col">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/45 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.20em] text-[#E67E22] shadow-[0_8px_20px_rgba(31,31,31,0.06)] backdrop-blur-xl">
                  <Sparkles size={12} />
                  Featured Today
                </div>

                <p className="pt-6 text-[11px] font-medium uppercase tracking-[0.22em] text-[#8D7A67]">
                  Sponsored Book
                </p>
              </div>

              <div className="flex min-h-[150px] flex-col justify-end pt-3 lg:min-h-[210px]">
                <div
                  key={`title-${currentBook.id}`}
                  className="animate-[fadeUp_360ms_ease]"
                >
                  <h1 className="max-w-2xl text-[2.35rem] leading-[0.98] tracking-tight text-[#2A211B] sm:text-[3rem] lg:text-[3.8rem]">
                    <span className="font-['Georgia','Times_New_Roman',serif] italic font-semibold">
                      {currentBook.title}
                    </span>
                  </h1>

                  <p className="mt-4 text-[15px] font-normal text-[#6E6257]">
                    by {currentBook.author}
                  </p>
                </div>
              </div>

              <div className="pt-5">
                <div
                  key={`meta-${currentBook.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 animate-[fadeUp_360ms_ease]"
                >
                  <span className="text-[2rem] font-semibold tracking-tight text-[#E67E22]">
                    ₱{currentBook.price}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[12px] text-[#8D7A67]">
                    <MapPin size={13} />
                    {currentBook.location || "Community listing"}
                  </span>
                </div>
              </div>

              <div className="min-h-[112px] pt-6">
                <div
                  key={`desc-${currentBook.id}`}
                  className="animate-[fadeUp_360ms_ease]"
                >
                  <p className="max-w-2xl text-sm leading-7 text-[#6F655B] sm:text-[15px]">
                    A highlighted listing from the marketplace. BookBazaar gives
                    selected books stronger visibility, cleaner presentation,
                    and a homepage spotlight that feels more premium than a
                    simple card.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/book/${currentBook.id}`}
                    className="inline-flex h-11 items-center gap-2 rounded-md bg-[#E67E22] px-5 text-sm font-medium text-white transition hover:bg-[#cf6f1c]"
                  >
                    Get This Copy
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              <div className="pt-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/65 bg-white/45 text-[#2A211B] shadow-[0_8px_18px_rgba(31,31,31,0.05)] backdrop-blur-xl transition hover:bg-white/60"
                    aria-label="Previous sponsored book"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/65 bg-white/45 text-[#2A211B] shadow-[0_8px_18px_rgba(31,31,31,0.05)] backdrop-blur-xl transition hover:bg-white/60"
                    aria-label="Next sponsored book"
                  >
                    <ChevronRight size={15} />
                  </button>

                  <div className="ml-1 flex items-center gap-2">
                    {safeBooks.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => startTransition(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`rounded-full transition-all duration-300 ${
                          currentIndex === index
                            ? "h-2 w-8 bg-[#E67E22]"
                            : "h-2 w-2 bg-[#D8C8B8]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heroOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(14px);
          }
        }

        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translateX(-14px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0.7;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
