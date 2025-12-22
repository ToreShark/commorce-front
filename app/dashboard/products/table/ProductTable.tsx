"use client";
import React, { useEffect, useState } from "react";
import { Product } from "../interface/product.interface.table";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const [selectedImage, setSelectedImage] = useState<{ [key: string]: string }>(
    {}
  );

  useEffect(() => {
    products.forEach((product) => {
      if (product.images && product.images.length > 0) {
        const imagePaths = product.images.map((image) => image.imagePath);
        selectRandomImage(product.id, imagePaths);
      }
    });
  }, [products]);

  const selectRandomImage = async (productId: string, imagePaths: string[]) => {
    let selectedImage = "";

    for (const imagePath of imagePaths) {
      const exists = await checkImageExists(`${process.env.NEXT_PUBLIC_API_URL}${imagePath}`);
      if (exists) {
        selectedImage = imagePath;
        break;
      }
    }

    if (!selectedImage && imagePaths.length > 0) {
      selectedImage = imagePaths[0];
    }

    setSelectedImage((prev) => ({
      ...prev,
      [productId]: selectedImage,
    }));
  };

  const checkImageExists = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = document.createElement('img');
      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  if (!products || products.length === 0) {
    return (
      <div className="sherah-table sherah-page-inner sherah-border sherah-default-bg mg-top-25">
        <table className="sherah-table__main sherah-table__main-v3">
          <thead className="sherah-table__head">
            <tr>
              <th className="sherah-table__column-1 sherah-table__h1">Товары не найдены</th>
            </tr>
          </thead>
        </table>
      </div>
    );
  }

  return (
    <div className="sherah-table sherah-page-inner sherah-border sherah-default-bg mg-top-25">
      <table className="sherah-table__main sherah-table__main-v3">
        <thead className="sherah-table__head">
          <tr>
            <th className="sherah-table__column-1 sherah-table__h1">Изображение</th>
            <th className="sherah-table__column-2 sherah-table__h2">Название</th>
            <th className="sherah-table__column-3 sherah-table__h3">Имя</th>
            <th className="sherah-table__column-4 sherah-table__h4">Описание</th>
            <th className="sherah-table__column-5 sherah-table__h5">SKU</th>
            <th className="sherah-table__column-6 sherah-table__h6">Цена</th>
            <th className="sherah-table__column-7 sherah-table__h7">Действия</th>
          </tr>
        </thead>
        <tbody className="sherah-table__body">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="sherah-table__column-1 sherah-table__data-1">
                <div className="sherah-table__product-img">
                  {selectedImage[product.id] ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${selectedImage[product.id]}?${new Date().getTime()}`}
                      alt={product.name}
                      style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                        e.currentTarget.onerror = null;
                      }}
                    />
                  ) : (
                    <span className="sherah-table__product-noimg">—</span>
                  )}
                </div>
              </td>
              <td className="sherah-table__column-2 sherah-table__data-2">
                <div className="sherah-table__product-content">
                  <p className="sherah-table__product-title">{product.title}</p>
                </div>
              </td>
              <td className="sherah-table__column-3 sherah-table__data-3">
                <p className="sherah-table__product-name">{product.name}</p>
              </td>
              <td className="sherah-table__column-4 sherah-table__data-4">
                <p className="sherah-table__product-desc" title={product.description}>
                  {product.description?.length > 50
                    ? `${product.description.substring(0, 50)}...`
                    : product.description}
                </p>
              </td>
              <td className="sherah-table__column-5 sherah-table__data-5">
                <p className="sherah-table__product-sku">{product.sku}</p>
              </td>
              <td className="sherah-table__column-6 sherah-table__data-6">
                <p className="sherah-table__product-price">{product.price} ₸</p>
              </td>
              <td className="sherah-table__column-7 sherah-table__data-7">
                <div className="sherah-table__product-action">
                  <button
                    className="sherah-btn sherah-btn__secondary"
                    onClick={() => onEdit(product)}
                    style={{ marginRight: 8 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    className="sherah-btn sherah-btn__danger"
                    onClick={() => onDelete(product.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
