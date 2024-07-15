import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Chip from "@mui/material/Chip";
import "@/app/dashboard/products/editableCategoryDetails/editTable.scss";

import { CategoryDetailsProps } from "../categoryDetailView/interface/categoryDetail.interface";
import Category from "@/app/lib/interfaces/category.interace";
import Cookies from "js-cookie";
import { editCategory } from "@/app/lib/data";

interface EditableCategoryDetailsProps {
  category: Category;
  onSave: (updatedCategory: any) => void;
  onCancel: () => void;
}

const EditableCategoryDetails: React.FC<EditableCategoryDetailsProps> = ({
  category,
  onCancel,
  onSave,
}) => {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [slug, setSlug] = useState(category.slug);
  const [metaTitle, setMetaTitle] = useState(category.metaTitle);
  const [metaKeywords, setMetaKeywords] = useState(category.metaKeywords);
  const [metaDescription, setMetaDescription] = useState(
    category.metaDescription
  );
  const [imagePath, setImagePath] = useState<string | null | undefined>(
    category.imagePath
  );
  const [newImage, setNewImage] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setNewImage(file);
    }
  };

  const handleSave = async () => {
    const updatedCategory = {
      id: category.id,
      name,
      description: description ?? '',
      slug,
      metaTitle: metaTitle ?? '',
      metaKeywords: metaKeywords ?? '',
      metaDescription: metaDescription ?? '',
      image: newImage,
    };
    const token = Cookies.get("token");
    
    try {
      const response = await editCategory(updatedCategory, token as string);
      onSave(response.category); // Assuming the response includes the updated category
    } catch (error) {
      console.error("Failed to update category", error);
    }
  };

  const handleDeleteImage = () => {
    setImagePath(null);
  };

  return (
    <div className="editable-category-details">
      <button type="button" className="close-button" onClick={onCancel}>
        <span aria-hidden="true">X</span>
      </button>
      <h2>Редактировать категорию</h2>
      <TextField
        label="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Meta Title"
        value={metaTitle}
        onChange={(e) => setMetaTitle(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Meta Keywords"
        value={metaKeywords}
        onChange={(e) => setMetaKeywords(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Meta Description"
        value={metaDescription}
        onChange={(e) => setMetaDescription(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        fullWidth
        margin="normal"
      />
      <div className="image-gallery">
        <h3>Images</h3>
        {imagePath ? (
          <div className="image-item">
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${imagePath}`}
              alt={category.name}
              style={{ width: 100, height: 100, objectFit: "cover" }}
            />
            <IconButton onClick={handleDeleteImage} color="secondary">
              <DeleteIcon />
            </IconButton>
          </div>
        ) : (
          <p>No images available</p>
        )}

        <input type="file" onChange={handleImageUpload} />
        {newImage && <p>New image selected: {newImage.name}</p>}
      </div>
      <div className="buttons">
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
        <Button onClick={onCancel} variant="contained" color="secondary">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EditableCategoryDetails;
