"use client";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { Product } from "../interface/product.interface.table";
import { AdminSaveError, deleteProductImage, editProduct } from "@/app/lib/data";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Chip from "@mui/material/Chip";
import EditIcon from "@mui/icons-material/Edit";
import { toDateInputValue } from "@/app/lib/discount";

interface EditableProductDetailsProps {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onCancel: () => void;
  onFinishEditing: () => void;
  refreshProducts: () => void;
  categoryId?: string | null;
}

type PropertyRow = { id: number; Название: string; Значение: string };

/** Размеры и характеристики хранятся JSON-ом: массивом строк или, у старых товаров, объектом. */
function parseProperties(json?: string | null): PropertyRow[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed).map(([key, value], i) => ({
        id: i,
        Название: key,
        Значение: String(value),
      }));
    }
  } catch {
    console.error("Не удалось разобрать propertiesJson", json);
  }
  return [];
}

const EditableProductDetails: React.FC<EditableProductDetailsProps> = ({
  product,
  onCancel,
  onSave,
  onFinishEditing,
  refreshProducts,
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
  // Процент — строкой, чтобы поле можно было очистить. Даты — в виде yyyy-MM-dd:
  // <input type="date"> не понимает "2026-10-20T00:00:00" и показывал пустоту.
  const [discountPercentage, setDiscountPercentage] = useState(
    product.discountPercentage ? String(product.discountPercentage) : ""
  );
  const [discountStartDate, setDiscountStartDate] = useState(
    toDateInputValue(product.discountStartDate)
  );
  const [discountEndDate, setDiscountEndDate] = useState(
    toDateInputValue(product.discountEndDate)
  );
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState(product.slug);
  // Добавляем логику для изображений и свойств
  const [mainImagePath, setMainImagePath] = useState<string | null | undefined>(
    product.mainImagePath
  );
  const [propertiesJson, setPropertiesJson] = useState(
    product.propertiesJson || ""
  );
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState(product.images || []);
  // Форма монтируется заново на каждый товар (key в products.tsx), поэтому
  // начальное состояние берётся прямо из товара — без подтягивания эффектом.
  const [properties, setProperties] = useState<PropertyRow[]>(() =>
    parseProperties(product.propertiesJson)
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [propertyName, setPropertyName] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState("");

  // Форма рисуется под списком товаров — без прокрутки её не видно,
  // и казалось, что «Изменить» ничего не открывает.
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages((prevImages) => [...prevImages, ...filesArray]);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("Token is undefined");
      }
      // Удаление изображения
      await deleteProductImage(imageId, token);

      // Обновление состояния existingImages
      const updatedImages = existingImages.filter((img) => img.id !== imageId);
      setExistingImages(updatedImages);

      // Обновление состояния продукта в родительском компоненте
      const updatedProduct = { ...product, images: updatedImages };
      onSave(updatedProduct);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleDeleteNewImage = (index: number) => {
    setNewImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!categoryId) {
      console.error("categoryId is undefined, cannot update product.");
      return;
    }
    const percent = Number(discountPercentage || 0);
    if (isNaN(percent) || percent < 0 || percent > 99) {
      alert("Скидка — число от 0 до 99.");
      return;
    }
    if (discountStartDate && discountEndDate && discountEndDate < discountStartDate) {
      alert("Дата окончания скидки раньше даты начала.");
      return;
    }

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
      // Раньше здесь уходил старый процент, а не введённый, и пустые даты
      // превращались в 1970 год — скидку из админки поставить было нельзя.
      discountPercentage: percent,
      discountStartDate: discountStartDate || "",
      discountEndDate: discountEndDate || "",
      propertiesJson: JSON.stringify(properties),
      slug,
      categoryId,
      images: existingImages,
    };
    const token = Cookies.get("token");

    setSaving(true);
    setSavedAt(null);
    try {
      const formData = new FormData();
      Object.keys(updatedProduct).forEach((key) => {
        formData.append(key, (updatedProduct as any)[key]);
      });
      newImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await editProduct(formData, token as string);
      // Обновляем состояние mainImagePath
      setMainImagePath(response.product.mainImagePath);
      onSave(response.product);
      refreshProducts(); // Обновляем список продуктов
      setNewImages([]);
      if (Array.isArray(response.product?.productImages)) {
        setExistingImages(response.product.productImages);
      }
      setSavedAt(new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
    } catch (error) {
      console.error("Failed to update product", error);
      alert(
        (error instanceof AdminSaveError && error.userMessage) ||
          "Не удалось сохранить товар. Попробуйте ещё раз."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditProperty = (index: number) => {
    setEditIndex(index);
    setEditName(properties[index].Название);
    setEditValue(properties[index].Значение);
  };

  const handleSaveEditProperty = () => {
    if (editIndex !== null) {
      const updatedProperties = [...properties];
      updatedProperties[editIndex] = {
        ...updatedProperties[editIndex],
        Название: editName,
        Значение: editValue,
      };
      setProperties(updatedProperties);
      setEditIndex(null);
      setEditName("");
      setEditValue("");
    }
  };

  const handleDeleteProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const handleAddProperty = () => {
    if (propertyName.trim() === "" || propertyValue.trim() === "") {
      alert("Заполните и название, и значение — например «Размер» и «48».");
      return;
    }

    setProperties([
      ...properties,
      {
        id: properties.length,
        Название: propertyName,
        Значение: propertyValue,
      },
    ]);
    setPropertyName("");
    setPropertyValue("");
  };

  return (
    <div className="editable-product-details" ref={formRef} style={{ scrollMarginTop: 80 }}>
      <button type="button" className="close-button" onClick={onCancel}>
        <span aria-hidden="true">X</span>
      </button>
      <h2>Редактирование: {product.name}</h2>
      <p style={{ color: "#6b7280", marginBottom: 8 }}>
        Артикул {product.sku} · адрес на сайте /product/{product.slug}
      </p>
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
      <h3 style={{ marginTop: 16 }}>Размеры и характеристики</h3>
      <div>
        <TextField
          label="Название (например, Размер)"
          value={propertyName}
          onChange={(e) => setPropertyName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Значение (например, 48)"
          value={propertyValue}
          onChange={(e) => setPropertyValue(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button onClick={handleAddProperty} variant="contained" color="primary">
          Добавить
        </Button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Значение</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {properties.length === 0 && (
            <tr>
              <td colSpan={3} style={{ color: "#b91c1c" }}>
                Размеры не указаны — на сайте у товара не будет размеров.
              </td>
            </tr>
          )}
          {properties.map((property, index) => (
            <tr key={property.id}>
              <td>{property.Название}</td>
              <td>{property.Значение}</td>
              <td>
                <IconButton onClick={() => handleEditProperty(index)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteProperty(index)}>
                  <DeleteIcon />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editIndex !== null && (
        <div>
          <TextField
            label="Название"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Значение"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button
            onClick={handleSaveEditProperty}
            variant="contained"
            color="primary"
          >
            Применить
          </Button>
          <Button
            onClick={() => setEditIndex(null)}
            variant="contained"
            color="secondary"
          >
            Отмена
          </Button>
        </div>
      )}

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
        type="number"
        label="Скидка, %"
        value={discountPercentage}
        onChange={(e) => setDiscountPercentage(e.target.value)}
        inputProps={{ min: 0, max: 99, inputMode: "numeric" }}
        helperText={
          Number(discountPercentage) > 0 && Number(price) > 0
            ? `Цена со скидкой: ${Math.round(
                Number(price) - (Number(price) * Number(discountPercentage)) / 100
              ).toLocaleString()} ₸. Даты можно не заполнять — скидка действует сразу.`
            : "0 или пусто — без скидки. Даты можно не заполнять."
        }
        fullWidth
        margin="normal"
      />
      <TextField
        type="date"
        label="Скидка с"
        value={discountStartDate}
        onChange={(e) => setDiscountStartDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        margin="normal"
      />
      <TextField
        type="date"
        label="Скидка по (включительно)"
        value={discountEndDate}
        onChange={(e) => setDiscountEndDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        margin="normal"
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
      <div className="image-gallery">
        <h3>Фото</h3>
        {existingImages && existingImages.length > 0 ? (
          existingImages.map((img) => (
            <div
              className="image-item"
              key={img.id}
              style={{ display: "inline-flex", alignItems: "flex-start", margin: "0 12px 12px 0" }}
            >
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}${img.imagePath}`}
                target="_blank"
                rel="noreferrer"
                title="Открыть фото целиком"
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${img.imagePath}`}
                  alt={product.name}
                  style={{ width: 180, height: 240, objectFit: "cover", borderRadius: 6 }}
                />
              </a>
              <IconButton
                onClick={() => handleDeleteImage(img.id)}
                color="secondary"
              >
                <DeleteIcon />
              </IconButton>
            </div>
          ))
        ) : (
          <p>Фото нет</p>
        )}
        <input type="file" multiple onChange={handleImageUpload} />
        {newImages.length > 0 && (
          <div>
            {newImages.map((image, index) => (
              <div
                key={index}
                style={{ display: "flex", alignItems: "center" }}
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  style={{
                    width: 180,
                    height: 240,
                    objectFit: "cover",
                    marginRight: 10,
                  }}
                />
                <IconButton
                  onClick={() => handleDeleteNewImage(index)}
                  color="secondary"
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Поля для дат скидок, метаданных и так далее */}
      <div className="buttons">
        <Button onClick={handleSave} variant="contained" color="primary" disabled={saving}>
          {saving ? "Сохраняю…" : "Сохранить"}
        </Button>
        {savedAt && <span style={{ color: "#15803d", margin: "0 12px" }}>Сохранено в {savedAt}</span>}
        <Button onClick={onCancel} variant="contained" color="secondary">
          Отмена
        </Button>
        <Button onClick={onFinishEditing} variant="contained" color="inherit">
          Завершить редактирование
        </Button>
      </div>
    </div>
  );
};

export default EditableProductDetails;
