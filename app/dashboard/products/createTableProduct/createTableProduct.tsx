// CreateProductForm.tsx
import React from "react";
import "@/app/dashboard/products/createTableProduct/create.table.product.sass";
import Category from "@/app/lib/interfaces/category.interace";

interface CreateProductFormProps {
  category: Category;
}

const CreateProductForm: React.FC<CreateProductFormProps> = ({ category }) => {
  return (
    <div>
      <h2>Форма создания товара</h2>
      <p>Выбранная категория: {category.name}</p>
      {/* Здесь будет форма для создания товара */}
    </div>
  );
};

export default CreateProductForm;
