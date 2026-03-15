"use client";

import { useMemo, useState } from "react";

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

function getDisplayImageCandidates(
  imageUrl: string | null,
  isbn?: string | null,
) {
  const candidates: string[] = [];

  if (imageUrl) {
    const fixed = imageUrl.replace("http://", "https://");

    candidates.push(fixed);

    if (
      fixed.includes("googleusercontent.com") ||
      fixed.includes("books.google") ||
      fixed.includes("googleapis.com")
    ) {
      candidates.push(
        fixed
          .replace("&edge=curl", "")
          .replace("zoom=1", "zoom=2")
          .replace("zoom=0", "zoom=2"),
      );
    }
  }

  const cleanIsbn = getCleanIsbn(isbn);

  if (cleanIsbn) {
    candidates.push(
      `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg?default=false`,
    );
    candidates.push(
      `https://books.google.com/books/publisher/content/images/frontcover/${cleanIsbn}?fife=w800`,
    );
  }

  return [...new Set(candidates.filter(Boolean))];
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
  const src = candidates[index];

  return (
    <div className={wrapperClassName}>
      {src ? (
        <img
          src={src}
          alt={title}
          className={className}
          loading="lazy"
          decoding="async"
          onError={() => {
            if (index < candidates.length - 1) {
              setIndex((prev) => prev + 1);
            }
          }}
        />
      ) : (
        <div className={emptyClassName}>{emptyText}</div>
      )}
    </div>
  );
}
