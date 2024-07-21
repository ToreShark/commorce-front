import Cookies from "js-cookie";
import { useState } from "react";
import { Product } from "../interface/product.interface.table";
import { editProduct } from "@/app/lib/data";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Chip from "@mui/material/Chip";

interface EditableProductDetailsProps {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onCancel: () => void;
}

const EditableProductDetails: React.FC<EditableProductDetailsProps> = ({
  product,
  onCancel,
  onSave,
}) => {
  const [title, setTitle] = useState(product.title);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [sku, setSKU] = useState(product.sku);
  const [price, setPrice] = useState(product.price);
  const [metaTitle, setMetaTitle] = useState(product.metaTitle);
  const [metaKeywords, setMetaKeywords] = useState(product.metaKeywords);
  const [metaDescription, setMetaDescription] = useState(
    product.metaDescription
  );
  const [discountPercentage, setDiscountPercentage] = useState(
    product.discountPercentage
  );
  const [discountStartDate, setDiscountStartDate] = useState(
    product.discountStartDate
  );
  const [discountEndDate, setDiscountEndDate] = useState(
    product.discountEndDate
  );
  const [slug, setSlug] = useState(product.slug);
  // Добавляем логику для изображений и свойств
  const [mainImagePath, setMainImagePath] = useState(product.mainImagePath);

  const handleSave = async () => {
    const updatedProduct = {
      ...product,
      title,
      name,
      description,
      sku,
      price,
      metaTitle,
      metaKeywords,
      metaDescription,
      discountPercentage: product.discountPercentage ?? 0,
      discountStartDate,
      discountEndDate,
      slug,
      // Добавить логику обновления изображений и свойств
      mainImagePath,
    };
    const token = Cookies.get("token");

    try {
      const response = await editProduct(updatedProduct, token as string);
      onSave(response.product); // Assuming the response includes the updated product
    } catch (error) {
      console.error("Failed to update product", error);
    }
  };

  return (
    <div className="editable-product-details">
      <button type="button" className="close-button" onClick={onCancel}>
        <span aria-hidden="true">X</span>
      </button>
      <h2>Редактировать товар</h2>
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth margin="normal" />
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="normal" />
      <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth margin="normal" />
      <TextField label="SKU" value={sku} onChange={(e) => setSKU(e.target.value)} fullWidth margin="normal" />
      <TextField label="Price" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} fullWidth margin="normal" />
      {/* Поля для дат скидок, метаданных и так далее */}
      <div className="buttons">
        <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
        <Button onClick={onCancel} variant="contained" color="secondary">Cancel</Button>
      </div>
    </div>
  );
};

export default EditableProductDetails;