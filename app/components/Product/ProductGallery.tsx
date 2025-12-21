"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/app/lib/interfaces/product.interface";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  discountPercentage?: number;
  className?: string;
}

export default function ProductGallery({
  images,
  productName,
  discountPercentage,
  className,
}: ProductGalleryProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const [selectedImage, setSelectedImage] = useState(0);

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/assets/images/product-img-1.jpg";
    return imagePath.startsWith("http") ? imagePath : `${apiUrl}${imagePath}`;
  };

  const currentImage = images?.[selectedImage]?.imagePath || "";

  return (
    <div className={`product-gallery ${className || ""}`}>
      {/* Main Image */}
      <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] border border-qgray-border flex justify-center items-center overflow-hidden relative mb-3 bg-white rounded-lg">
        <Image
          src={getImageUrl(currentImage)}
          alt={productName}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {/* Discount Badge */}
        {discountPercentage && discountPercentage > 0 && (
          <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full bg-qyellow text-qblack flex justify-center items-center text-base sm:text-xl font-medium absolute left-[20px] sm:left-[30px] top-[20px] sm:top-[30px]">
            <span>-{discountPercentage}%</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images && images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, index) => (
            <button
              key={img.id || index}
              onClick={() => setSelectedImage(index)}
              className={`w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] p-2 sm:p-[15px] border cursor-pointer transition-all rounded ${
                selectedImage === index
                  ? "border-qyellow"
                  : "border-qgray-border hover:border-qgray"
              }`}
            >
              <Image
                src={getImageUrl(img.imagePath)}
                alt={`${productName} - ${index + 1}`}
                width={100}
                height={100}
                className={`w-full h-full object-contain ${
                  selectedImage !== index ? "opacity-50" : ""
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
