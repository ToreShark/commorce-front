import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "../lib/interfaces/product.interface";
import { Button } from "@/components/ui/button";
import { Star, Truck } from "lucide-react";
import ImageGallery from "../components/ImageGallery";
import { useContext } from "react";
import { CartContext } from "../lib/CartContext";
import { addItemToCartAPI } from "../lib/data";
import { CartItemInterface } from "../lib/interfaces/cart.item.interface";

interface ProductDetailProps {
  product: Product | null;
}

const ProductDetailComponent: React.FC<ProductDetailProps> = ({ product }) => {
  const { addItemToCart } = useContext(CartContext);
  const [selectedProperties, setSelectedProperties] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (product) {
      const initialSelectedProperties = product.propertiesJson
        ? JSON.parse(product.propertiesJson).reduce((acc: any, prop: any) => {
            acc[prop.Название] = prop.Значение;
            return acc;
          }, {})
        : {};
      setSelectedProperties(initialSelectedProperties);

    }
  }, [product]);

  if (!product) {
    return <p>Product not available.</p>;
  }
  const handlePropertyChange = (property: string, value: string) => {
    setSelectedProperties((prevState) => {
      const newState = { ...prevState, [property]: value };
      return newState;
    });
  };

  const properties = product.propertiesJson
    ? JSON.parse(product.propertiesJson)
    : [];

  const groupedProps = properties.reduce((acc: any, prop: any) => {
    const key = prop.Название;
    if (!acc[key]) {
      acc[key] = new Set(); // Используем Set для автоматического удаления дубликатов
    }
    acc[key].add(prop.Значение.trim()); // trim убирает лишние пробелы
    return acc;
  }, {});

  const handleAddToCart = async () => {
    try {
      const selectedPropertiesObject = Object.entries(selectedProperties).reduce(
        (acc: { [key: string]: string }, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {}
      );


      const newItem: CartItemInterface = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: `${process.env.NEXT_PUBLIC_API_URL}${product.images[0].imagePath}`,
        selectedProperties: JSON.stringify(selectedPropertiesObject),
        // selectedProperties: JSON.stringify(product.propertiesJson) // Предполагается, что свойства уже в JSON формате
      };

      addItemToCart(newItem);
    } catch (error) {
      console.error("Ошибка при добавлении товара в корзину:", error);
    }
  };

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
              <Truck className="w-6 h-6" />
              <span className="text-sm">2-4 Day Shipping</span>
            </div>
            <div className="flex gap-2.5">
              <Button onClick={handleAddToCart}>Добавить в корзину</Button>
              <Button variant="secondary">Купить сейчас</Button>
            </div>
            <p className="mt-12 text-base text-gray-500 tracking-wide">
              {product.description}
            </p>
            <div className="mt-6">
              <h3 className="text-base text-gray-500 tracking-wide">
                Свойства:
              </h3>
              {Object.entries(groupedProps).map(([key, values]) => (
                <div key={key}>
                  <label
                    htmlFor={key}
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    {key}
                  </label>
                  <select
                    id={key}
                    name={key}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    onChange={(e) => handlePropertyChange(key, e.target.value)}
                  >
                    {Array.from(values as Set<string>).map((value: string) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
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
