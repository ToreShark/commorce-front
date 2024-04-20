"use client";

import Image from "next/image";
import { useState } from "react";

interface iAppProps {
    images: { id: string; imagePath: string; order: number }[];
  }

export default function ImageGallery({ images }: iAppProps) {
  const [bigImage, setBigImage] = useState(images[0]);

  const handleSmallImageClick = (image: any) => {
    setBigImage(image);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="order-last flex gap-4 lg:order-none lg:flex-col">
      {images.map((image, idx) => (
          <div key={idx} className="overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}${image.imagePath}`}
              alt={`Thumbnail of ${image.imagePath}`}
              width={200}
              height={200}
              className="h-full w-full object-cover object-center cursor-pointer"
              onClick={() => handleSmallImageClick(image)}
            />
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-lg bg-gray-100 lg:col-span-4">
        <Image
          src={`${process.env.NEXT_PUBLIC_API_URL}${bigImage.imagePath}`}
          alt="Big image"
          width={500}
          height={500}
          className="h-full w-full object-cover object-center"
        />
      </div>
    </div>
  );
}
