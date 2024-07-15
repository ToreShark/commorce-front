// app/dashboard/products/categoryDetail/createCategory.tsx
import React from "react";
import { CategoryDetailsProps } from "./interface/categoryDetail.interface";
// import "@/app/dashboard/products/categoryDetailView/CategoryDetail.style.scss";
import "./categoryDetail.style.scss";

import Button from "@mui/material/Button";

const CategoryDetails: React.FC<CategoryDetailsProps> = ({
  category,
  onEdit,
  onClose,
}) => {
  return (
    <div className="category-details">
      <button type="button" onClick={onClose}>
        <span aria-hidden="true">X</span>
      </button>
      <h2>Детали категории</h2>
      <p>
        <strong>ID:</strong> {category.id}
      </p>
      <p>
        <strong>Название:</strong> {category.name}
      </p>
      <p>
        <strong>Slug:</strong> {category.slug}
      </p>
      <p>
        <strong>Описание Товара:</strong>{" "}
        {category.description || "No description"}
      </p>
      <p>
        <strong>Last Modified:</strong>{" "}
        {category.lastModified || "No description"}
      </p>
      <p>
        <strong>Meta Title:</strong> {category.metaTitle || "No meta title"}
      </p>
      <p>
        <strong>Meta Keywords:</strong>{" "}
        {category.metaKeywords || "No meta keywords"}
      </p>
      <p>
        <strong>Meta Description:</strong>{" "}
        {category.metaDescription || "No meta description"}
      </p>
      <div className="image-gallery">
        <h3>Images</h3>
        {category.imagePath ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}${category.imagePath}`}
            alt={category.name}
          />
        ) : (
          <p>No images available</p>
        )}
      </div>
      <Button variant="contained" onClick={onEdit}>
        Исправить
      </Button>
    </div>
  );
};

export default CategoryDetails;
