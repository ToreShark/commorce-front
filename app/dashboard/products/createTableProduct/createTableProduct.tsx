import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { createProduct } from "@/app/lib/data";
import { format, parseISO } from 'date-fns';
import Category from "@/app/lib/interfaces/category.interace";

interface CreateProductFormProps {
  category: Category;
}

const CreateProductForm: React.FC<CreateProductFormProps> = ({ category }) => {
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSKU] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [discountStartDate, setDiscountStartDate] = useState<string | null>(null);
  const [discountEndDate, setDiscountEndDate] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [properties, setProperties] = useState<{ id: number; name: string; value: string }[]>([]);
  const [propertyName, setPropertyName] = useState("");
  const [propertyValue, setPropertyValue] = useState("");

  const handleAddProperty = () => {
    setProperties([...properties, { id: properties.length, name: propertyName, value: propertyValue }]);
    setPropertyName("");
    setPropertyValue("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prevImages) => [...prevImages, ...filesArray]);
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!title || !name || !description || !price || !sku || !metaTitle || !metaKeywords || !metaDescription || !slug) {
      alert("Пожалуйста, заполните все обязательные поля.");
      return false;
    }
    if (isNaN(Number(price))) {
      alert("Цена должна быть числом.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("sku", sku);
    formData.append("metaTitle", metaTitle);
    formData.append("metaKeywords", metaKeywords);
    formData.append("metaDescription", metaDescription);
    formData.append("slug", slug);
    formData.append("discountPercentage", discountPercentage);
    if (discountStartDate) {
      formData.append("discountStartDate", format(parseISO(discountStartDate), 'yyyy-MM-dd'));
    }
    if (discountEndDate) {
      formData.append("discountEndDate", format(parseISO(discountEndDate), 'yyyy-MM-dd'));
    }
    formData.append("categoryId", category.id);
    formData.append("propertiesJson", JSON.stringify(properties));
    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      await createProduct(formData, "your-token-here");
      alert("Продукт успешно создан");
      // Очистить форму
    } catch (error) {
      alert("Ошибка при создании продукта");
    }
  };

  return (
    <div>
      <h2>Форма создания товара</h2>
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth margin="normal" />
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="normal" />
      <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth margin="normal" />
      <TextField label="Price" value={price} onChange={(e) => setPrice(e.target.value)} fullWidth margin="normal" />
      <TextField label="SKU" value={sku} onChange={(e) => setSKU(e.target.value)} fullWidth margin="normal" />
      <TextField label="Meta Title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} fullWidth margin="normal" />
      <TextField label="Meta Keywords" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} fullWidth margin="normal" />
      <TextField label="Meta Description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} fullWidth margin="normal" />
      <TextField label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} fullWidth margin="normal" />
      <TextField label="Discount Percentage" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} fullWidth margin="normal" />
      <TextField
        label="Discount Start Date"
        type="date"
        value={discountStartDate || ''}
        onChange={(e) => setDiscountStartDate(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Discount End Date"
        type="date"
        value={discountEndDate || ''}
        onChange={(e) => setDiscountEndDate(e.target.value)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <div>
        <TextField label="Property Name" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} fullWidth margin="normal" />
        <TextField label="Property Value" value={propertyValue} onChange={(e) => setPropertyValue(e.target.value)} fullWidth margin="normal" />
        <Button onClick={handleAddProperty} variant="contained" color="primary">Add Property</Button>
      </div>
      
      <div>
        {properties.map((property) => (
          <div key={property.id}>
            <span>{property.name}: {property.value}</span>
          </div>
        ))}
      </div>

      <input type="file" multiple onChange={handleImageUpload} />
      {images.length > 0 && (
        <div>
          {images.map((image, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center" }}>
              <img src={URL.createObjectURL(image)} alt="Preview" style={{ width: 100, height: 100, objectFit: "cover", marginRight: 10 }} />
              <Button onClick={() => handleDeleteImage(index)} variant="contained" color="secondary">Удалить</Button>
            </div>
          ))}
        </div>
      )}

      <Button variant="contained" color="primary" onClick={handleSubmit}>Создать</Button>
    </div>
  );
};

export default CreateProductForm;