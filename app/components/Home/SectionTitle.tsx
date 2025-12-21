"use client";

import Link from "next/link";

interface SectionTitleProps {
  title: string;
  seeMoreUrl?: string;
  className?: string;
}

export default function SectionTitle({
  title,
  seeMoreUrl,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={`section-title flex justify-between items-center mb-5 ${
        className || ""
      }`}
    >
      <h2 className="text-xl sm:text-2xl font-bold text-qblack">{title}</h2>
      {seeMoreUrl && (
        <Link
          href={seeMoreUrl}
          className="text-sm font-600 text-qyellow hover:text-qblack transition-colors flex items-center space-x-1"
        >
          <span>Смотреть все</span>
          <svg
            width="7"
            height="11"
            viewBox="0 0 7 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="fill-current"
          >
            <rect
              x="2.08984"
              y="0.636719"
              width="6.94219"
              height="1.54271"
              transform="rotate(45 2.08984 0.636719)"
            />
            <rect
              x="7"
              y="5.54492"
              width="6.94219"
              height="1.54271"
              transform="rotate(135 7 5.54492)"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}
