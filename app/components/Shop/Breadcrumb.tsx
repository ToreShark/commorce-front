"use client";

import Link from "next/link";

interface BreadcrumbPath {
  name: string;
  path: string;
}

interface BreadcrumbProps {
  paths?: BreadcrumbPath[];
  className?: string;
}

export default function Breadcrumb({
  paths = [{ name: "Главная", path: "/" }],
  className,
}: BreadcrumbProps) {
  return (
    <div
      className={`breadcrumb-wrapper font-400 text-[13px] text-qblack mb-[23px] ${
        className || ""
      }`}
    >
      {paths.map((item, index) => (
        <span key={item.name}>
          {index < paths.length - 1 ? (
            <>
              <Link
                href={item.path}
                // Заглавная только первая буква: capitalize делал «Доставка И Возврат»
                className="inline-block first-letter:uppercase hover:text-qbrand transition-colors"
              >
                {item.name}
              </Link>
              <span className="mx-2 text-qgray">/</span>
            </>
          ) : (
            <span className="inline-block first-letter:uppercase text-qgray">{item.name}</span>
          )}
        </span>
      ))}
    </div>
  );
}
