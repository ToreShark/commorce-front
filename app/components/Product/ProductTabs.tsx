"use client";

import { useState } from "react";
import { Product } from "@/app/lib/interfaces/product.interface";

interface ProductTabsProps {
  product: Product;
  className?: string;
}

export default function ProductTabs({ product, className }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("description");

  // Parse properties JSON
  let properties: Record<string, string> = {};
  try {
    if (product.propertiesJson) {
      properties = JSON.parse(product.propertiesJson);
    }
  } catch (e) {
    console.error("Failed to parse properties JSON");
  }

  const tabs = [
    { id: "description", label: "Описание" },
    { id: "specifications", label: "Характеристики" },
  ];

  return (
    <div className={`product-tabs ${className || ""}`}>
      {/* Tab Buttons */}
      <div className="tab-buttons w-full mb-10 relative">
        <div className="container-x mx-auto">
          <ul className="flex space-x-8 sm:space-x-12">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-[15px] text-sm sm:text-[15px] border-b-2 font-medium cursor-pointer transition-colors ${
                    activeTab === tab.id
                      ? "border-qyellow text-qblack"
                      : "border-transparent text-qgray hover:text-qblack"
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full h-[1px] bg-[#E8E8E8] absolute left-0 bottom-0 -z-10"></div>
      </div>

      {/* Tab Content */}
      <div className="tab-contents w-full min-h-[200px]">
        <div className="container-x mx-auto">
          {/* Description Tab */}
          {activeTab === "description" && (
            <div className="w-full">
              <h6 className="text-[18px] font-medium text-qblack mb-4">
                Описание товара
              </h6>
              {product.description ? (
                <div className="text-[15px] text-qgray leading-7 whitespace-pre-line">
                  {product.description}
                </div>
              ) : (
                <p className="text-qgray">Описание отсутствует</p>
              )}
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === "specifications" && (
            <div className="w-full">
              <h6 className="text-[18px] font-medium text-qblack mb-4">
                Характеристики
              </h6>
              {Object.keys(properties).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(properties).map(([key, value], index) => (
                        <tr
                          key={key}
                          className={index % 2 === 0 ? "bg-primarygray" : "bg-white"}
                        >
                          <td className="py-3 px-4 text-sm font-medium text-qblack w-1/3">
                            {key}
                          </td>
                          <td className="py-3 px-4 text-sm text-qgray">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-3">
                  {product.sku && (
                    <div className="flex py-3 px-4 bg-primarygray">
                      <span className="text-sm font-medium text-qblack w-1/3">
                        Артикул
                      </span>
                      <span className="text-sm text-qgray">{product.sku}</span>
                    </div>
                  )}
                  {product.categoryName && (
                    <div className="flex py-3 px-4">
                      <span className="text-sm font-medium text-qblack w-1/3">
                        Категория
                      </span>
                      <span className="text-sm text-qgray">
                        {product.categoryName}
                      </span>
                    </div>
                  )}
                  {!product.sku && !product.categoryName && (
                    <p className="text-qgray">Характеристики не указаны</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
