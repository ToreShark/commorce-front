import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../lib/interfaces/product.interface";
import { Button } from "@/components/ui/button";
import { Star, Truck } from "lucide-react";
import ImageGallery from "../components/ImageGallery";

interface ProductDetailProps {
  product: Product | null;
}

const ProductDetailComponent: React.FC<ProductDetailProps> = ({ product }) => {
  if (!product) {
    return <p>Product not available.</p>;
  }

  const properties = product.propertiesJson ? JSON.parse(product.propertiesJson) : [];

  const uniqueProps = properties.reduce((acc: any, prop: any) => {
    if (!acc[prop.Название]) {
      acc[prop.Название] = {
        values: [],
        id: prop.id
      };
    }
    if (!acc[prop.Название].values.includes(prop.Значение)) {
      acc[prop.Название].values.push(prop.Значение);
    }
    return acc;
  }, {});

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="grid gap-8 md:grid-cols-1">
          {product.images && <ImageGallery images={product.images} />}
          </div>
          <div className="py-4 md:py-8">
            <div className="mb-2 md:mb-3">
              <span className="mb-0.5 inline-block text-gray-500">
                {product.categoryName}
              </span>
              <h2 className="text-2xl font-bold text-gray-800 lg:text-3xl">
                {product.name}
              </h2>
            </div>
            <div className="mb-6 flex items-center gap-3 md:mb-10">
              <Button className="rounded-full gap-x-2">
                <span className="text-sm">4.2</span>
                <Star className="h-5 w-5" />
              </Button>

              <span className="text-sm text-gray-500 transition duration-100">
                56 Ratings
              </span>
            </div>
            <div className="mb-4 flex items-end gap-2">
              <span className="text-xl font-bold text-gray-800 md:text-2xl">
                ${product.price}
              </span>
              <span className="mb-0.5 text-red-500 line-through">
                ${product.price + 30}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Incl. Vat plus shipping
            </span>
            <div className="mb-6 flex items-center gap-2 text-gray-500">
              <Truck className="w-6 h-6"/>
              <span className="text-sm">2-4 Day Shipping</span>
            </div>
            <div className="flex gap-2.5">
              <Button>Добавить в корзину</Button>
              <Button variant="secondary">Купить сейчас</Button>
            </div>
            <p className="mt-12 text-base text-gray-500 tracking-wide">
              {product.description}
            </p>
            <div className="mt-6">
              <h3 className="text-base text-gray-500 tracking-wide">Свойства:</h3>
              {Object.keys(uniqueProps).map((key) => (
                <div key={uniqueProps[key].id}>
                  <label htmlFor={key} className="block mb-2 text-sm font-medium text-gray-900">{key}</label>
                  <select id={key} name={key} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    {uniqueProps[key].values.map((value: string, index: number) => (
                      <option key={index} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailComponent;
