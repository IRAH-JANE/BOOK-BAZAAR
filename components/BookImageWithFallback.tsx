"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  imageUrl: string | null;
  isbn?: string | null;
  title: string;
  className?: string;
  wrapperClassName?: string;
  emptyClassName?: string;
  emptyText?: string;
};

function getCleanIsbn(isbn: string | null | undefined) {
  return isbn?.replace(/[^0-9Xx]/g, "") || "";
}

function sanitizeUrl(url: string) {
  return url.replace("http://", "https://");
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function buildGoogleVariants(url: string) {
  const safe = sanitizeUrl(url);

  return unique([
    safe,
    safe.replace("&edge=curl", "").replace("zoom=0", "zoom=3"),
    safe.replace("&edge=curl", "").replace("zoom=1", "zoom=3"),
    safe.replace("&edge=curl", "").replace("zoom=2", "zoom=3"),
    safe.replace("&edge=curl", "").replace("zoom=0", "zoom=2"),
    safe.replace("&edge=curl", "").replace("zoom=1", "zoom=2"),
  ]);
}

function getDisplayImageCandidates(
  imageUrl: string | null,
  isbn?: string | null,
) {
  const candidates: string[] = [];
  const cleanIsbn = getCleanIsbn(isbn);

  // 1. ALWAYS try the exact saved image first
  if (imageUrl) {
    const fixed = sanitizeUrl(imageUrl);
    candidates.push(fixed);

    const isGoogleImage =
      fixed.includes("googleusercontent.com") ||
      fixed.includes("books.google") ||
      fixed.includes("googleapis.com");

    if (isGoogleImage) {
      candidates.push(...buildGoogleVariants(fixed));
    }
  }

  // 2. Then try ISBN-based high quality alternatives
  if (cleanIsbn) {
    candidates.push(
      `https://books.google.com/books/publisher/content/images/frontcover/${cleanIsbn}?fife=w1000`,
    );
    candidates.push(
      `https://books.google.com/books/publisher/content/images/frontcover/${cleanIsbn}?fife=w800`,
    );
    candidates.push(
      `https://books.google.com/books/content?vid=ISBN${cleanIsbn}&printsec=frontcover&img=1&zoom=3&source=gbs_api`,
    );
    candidates.push(
      `https://books.google.com/books/content?vid=ISBN${cleanIsbn}&printsec=frontcover&img=1&zoom=2&source=gbs_api`,
    );
    candidates.push(
      `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg?default=false`,
    );
  }

  return unique(candidates);
}

export default function BookImageWithFallback({
  imageUrl,
  isbn,
  title,
  className = "",
  wrapperClassName = "",
  emptyClassName = "",
  emptyText = "No Image Available",
}: Props) {
  const candidates = useMemo(
    () => getDisplayImageCandidates(imageUrl, isbn),
    [imageUrl, isbn],
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [imageUrl, isbn]);

  const src = candidates[index];

  if (!src) {
    return (
      <div className={wrapperClassName}>
        <div className={emptyClassName}>{emptyText}</div>
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <img
        key={src}
        src={src}
        alt={title}
        className={className}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => {
          if (index < candidates.length - 1) {
            setIndex((prev) => prev + 1);
          }
        }}
      />
    </div>
  );
}
