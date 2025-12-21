"use client";

import Image from "next/image";
import SectionTitle from "./SectionTitle";

interface BrandSectionProps {
  className?: string;
  sectionTitle?: string;
  bgColor?: string;
}

const brands = [
  { id: 1, name: "Brand 1", image: "/assets/images/brand-1.png" },
  { id: 2, name: "Brand 2", image: "/assets/images/brand-2.png" },
  { id: 3, name: "Brand 3", image: "/assets/images/brand-3.png" },
  { id: 4, name: "Brand 4", image: "/assets/images/brand-4.png" },
  { id: 5, name: "Brand 5", image: "/assets/images/brand-5.png" },
  { id: 6, name: "Brand 6", image: "/assets/images/brand-6.png" },
  { id: 7, name: "Brand 7", image: "/assets/images/brand-7.png" },
  { id: 8, name: "Brand 8", image: "/assets/images/brand-8.png" },
  { id: 9, name: "Brand 9", image: "/assets/images/brand-9.png" },
  { id: 10, name: "Brand 10", image: "/assets/images/brand-10.png" },
  { id: 11, name: "Brand 11", image: "/assets/images/brand-11.png" },
  { id: 12, name: "Brand 12", image: "/assets/images/brand-12.png" },
];

export default function BrandSection({
  className,
  sectionTitle = "Популярные бренды",
  bgColor,
}: BrandSectionProps) {
  return (
    <div className={`w-full ${className || ""}`}>
      <div className="container-x mx-auto">
        <SectionTitle title={sectionTitle} />
        <div className="grid lg:grid-cols-6 sm:grid-cols-4 grid-cols-2">
          {brands.map((brand) => (
            <div key={brand.id} className="item">
              <div
                className={`w-full h-[130px] ${
                  bgColor || "bg-white"
                } border border-[#F1F3F8] flex justify-center items-center hover:shadow-md transition-shadow`}
              >
                <Image
                  src={brand.image}
                  alt={brand.name}
                  width={120}
                  height={60}
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
