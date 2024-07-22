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
  categoryId?: string | null;
}

const EditableProductDetails: React.FC<EditableProductDetailsProps> = ({
  product,
  onCancel,
  onSave,
  categoryId,
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
  const [mainImagePath, setMainImagePath] = useState<string | null | undefined>(
    product.mainImagePath
  );
  const [propertiesJson, setPropertiesJson] = useState(
    product.propertiesJson || ""
  );
  const [newImage, setNewImage] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setNewImage(file);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    console.log(imageId);
    setMainImagePath(null);
    setNewImage(null);
  };

  const handleSave = async () => {
    // Убедимся, что categoryId не undefined
    if (!categoryId) {
      console.error("categoryId is undefined, cannot update product.");
      return; // Прекращаем выполнение, если нет categoryId
    }
    const defaultDate = new Date(0).toISOString();
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
      discountStartDate: discountStartDate
        ? new Date(discountStartDate).toISOString()
        : defaultDate,
      discountEndDate: discountEndDate
        ? new Date(discountEndDate).toISOString()
        : defaultDate,
      propertiesJson: propertiesJson || "{}",
      slug,
      // Добавить логику обновления изображений и свойств
      mainImagePath,
      categoryId,
    };
    const token = Cookies.get("token");

    try {
      const formData = new FormData();
      Object.keys(updatedProduct).forEach((key) => {
        formData.append(key, (updatedProduct as any)[key]);
      });
      if (newImage) {
        formData.append("image", newImage);
        console.log("Adding image to formData:", newImage);
      } else {
        console.log("No new image to add to formData");
      }

      const response = await editProduct(formData, token as string); // Изменено: используем formData
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
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="SKU"
        value={sku}
        onChange={(e) => setSKU(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Price"
        value={price}
        onChange={(e) => setPrice(parseFloat(e.target.value))}
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
        type="date"
        label="Discount Start Date"
        value={discountStartDate || ""}
        onChange={(e) => setDiscountStartDate(e.target.value)}
      />
      <TextField
        type="date"
        label="Discount End Date"
        value={discountEndDate || ""}
        onChange={(e) => setDiscountEndDate(e.target.value)}
      />
      <TextField
        label="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        fullWidth
        margin="normal"
      />
      {/* <TextField
        label="Main Image Path"
        value={mainImagePath}
        onChange={(e) => setMainImagePath(e.target.value)}
        fullWidth
        margin="normal"
      /> */}
      <TextField
        label="Properties JSON"
        value={propertiesJson}
        onChange={(e) => setPropertiesJson(e.target.value)}
        fullWidth
        margin="normal"
      />
      <div className="image-gallery">
        <h3>Images</h3>
        {product.images && product.images.length > 0 ? (
          product.images.map((img) => (
            <div className="image-item" key={img.id}>
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}${img.imagePath}`}
                alt={product.name}
                style={{ width: 100, height: 100, objectFit: "cover" }}
              />
              <IconButton
                onClick={() => handleDeleteImage(img.id)}
                color="secondary"
              >
                <DeleteIcon />
              </IconButton>
            </div>
          ))
        ) : (
          <p>No images available</p>
        )}
        <input type="file" onChange={handleImageUpload} />
        {newImage && <p>New image selected: {newImage.name}</p>}
      </div>
      {/* Поля для дат скидок, метаданных и так далее */}
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

export default EditableProductDetails;
