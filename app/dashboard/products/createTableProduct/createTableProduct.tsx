import React, { useState } from "react";
import { createProduct } from "@/app/lib/data";
import { format, parseISO } from 'date-fns';
import Category from "@/app/lib/interfaces/category.interace";
import Cookies from "js-cookie";

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
  const [properties, setProperties] = useState<{ id: number; Название: string; Значение: string }[]>([]);
  const [propertyName, setPropertyName] = useState("");
  const [propertyValue, setPropertyValue] = useState("");

  const handleAddProperty = () => {
    setProperties([...properties, { id: properties.length, Название: propertyName, Значение: propertyValue }]);
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

    const token = Cookies.get("token");
    if (!token) {
      alert("Необходимо авторизоваться");
      return;
    }

    try {
      await createProduct(formData, token);
      alert("Продукт успешно создан");
    } catch (error) {
      alert("Ошибка при создании продукта");
    }
  };

  return (
    <div className="sherah-wc sherah-wc__full sherah-default-bg mg-top-30">
      <div className="sherah-wc__heading">
        <h3 className="sherah-wc__title">Создание товара для: {category.name}</h3>
      </div>

      <form className="sherah-wc__form sherah-wc__form-v2">
        <div className="row">
          {/* Left Column - Main Info */}
          <div className="col-lg-8 col-12">
            <div className="sherah-wc__form-inner">
              {/* Basic Info */}
              <div className="row">
                <div className="col-12 col-md-6">
                  <div className="sherah-wc__form-group">
                    <label className="sherah-wc__form-label">Заголовок *</label>
                    <input
                      className="sherah-wc__form-input"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Введите заголовок"
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="sherah-wc__form-group">
                    <label className="sherah-wc__form-label">Название *</label>
                    <input
                      className="sherah-wc__form-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Введите название"
                    />
                  </div>
                </div>
              </div>

              <div className="sherah-wc__form-group">
                <label className="sherah-wc__form-label">Описание *</label>
                <textarea
                  className="sherah-wc__form-input sherah-wc__form-input--textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Введите описание товара"
                  rows={4}
                />
              </div>

              <div className="row">
                <div className="col-12 col-md-6">
                  <div className="sherah-wc__form-group">
                    <label className="sherah-wc__form-label">Цена *</label>
                    <input
                      className="sherah-wc__form-input"
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Введите цену"
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="sherah-wc__form-group">
                    <label className="sherah-wc__form-label">SKU *</label>
                    <input
                      className="sherah-wc__form-input"
                      type="text"
                      value={sku}
                      onChange={(e) => setSKU(e.target.value)}
                      placeholder="Введите SKU"
                    />
                  </div>
                </div>
              </div>

              <div className="sherah-wc__form-group">
                <label className="sherah-wc__form-label">Slug *</label>
                <input
                  className="sherah-wc__form-input"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Введите slug"
                />
              </div>

              {/* SEO */}
              <div className="sherah-wc__divider mg-top-20 mg-btm-20"></div>
              <h4 className="sherah-wc__form-subtitle">SEO информация</h4>

              <div className="sherah-wc__form-group">
                <label className="sherah-wc__form-label">Meta Title *</label>
                <input
                  className="sherah-wc__form-input"
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Meta Title"
                />
              </div>

              <div className="sherah-wc__form-group">
                <label className="sherah-wc__form-label">Meta Keywords *</label>
                <input
                  className="sherah-wc__form-input"
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="Meta Keywords"
                />
              </div>

              <div className="sherah-wc__form-group">
                <label className="sherah-wc__form-label">Meta Description *</label>
                <textarea
                  className="sherah-wc__form-input sherah-wc__form-input--textarea"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Meta Description"
                  rows={3}
                />
              </div>

              {/* Discount */}
              <div className="sherah-wc__divider mg-top-20 mg-btm-20"></div>
              <h4 className="sherah-wc__form-subtitle">Скидка</h4>

              <div className="row">
                <div className="col-12 col-md-4">
                  <div className="sherah-wc__form-group">
                    <label className="sherah-wc__form-label">Процент скидки</label>
                    <input
                      className="sherah-wc__form-input"
                      type="text"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="sherah-wc__form-group">
                    <label className="sherah-wc__form-label">Дата начала</label>
                    <input
                      className="sherah-wc__form-input"
                      type="date"
                      value={discountStartDate || ''}
                      onChange={(e) => setDiscountStartDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="sherah-wc__form-group">
                    <label className="sherah-wc__form-label">Дата окончания</label>
                    <input
                      className="sherah-wc__form-input"
                      type="date"
                      value={discountEndDate || ''}
                      onChange={(e) => setDiscountEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Properties */}
              <div className="sherah-wc__divider mg-top-20 mg-btm-20"></div>
              <h4 className="sherah-wc__form-subtitle">Свойства товара</h4>

              <div className="row">
                <div className="col-12 col-md-5">
                  <div className="sherah-wc__form-group">
                    <label className="sherah-wc__form-label">Название свойства</label>
                    <input
                      className="sherah-wc__form-input"
                      type="text"
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                      placeholder="Например: Цвет"
                    />
                  </div>
                </div>
                <div className="col-12 col-md-5">
                  <div className="sherah-wc__form-group">
                    <label className="sherah-wc__form-label">Значение</label>
                    <input
                      className="sherah-wc__form-input"
                      type="text"
                      value={propertyValue}
                      onChange={(e) => setPropertyValue(e.target.value)}
                      placeholder="Например: Красный"
                    />
                  </div>
                </div>
                <div className="col-12 col-md-2 d-flex align-items-end">
                  <button
                    type="button"
                    className="sherah-btn sherah-btn__secondary w-100"
                    onClick={handleAddProperty}
                  >
                    Добавить
                  </button>
                </div>
              </div>

              {properties.length > 0 && (
                <div className="sherah-wc__properties mg-top-15">
                  {properties.map((property) => (
                    <span key={property.id} className="sherah-wc__property-tag">
                      {property.Название}: {property.Значение}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="col-lg-4 col-12">
            <div className="sherah-wc__form-inner">
              <h4 className="sherah-wc__form-subtitle">Изображения</h4>

              <div className="sherah-wc__form-upload">
                <label className="sherah-wc__form-upload-label">
                  <input
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <div className="sherah-wc__form-upload-content">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p>Загрузить фото</p>
                  </div>
                </label>
              </div>

              {images.length > 0 && (
                <div className="sherah-wc__form-images mg-top-20">
                  {images.map((image, index) => (
                    <div key={index} className="sherah-wc__form-image-item">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        className="sherah-wc__form-image-preview"
                      />
                      <button
                        type="button"
                        className="sherah-wc__form-image-delete"
                        onClick={() => handleDeleteImage(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="row mg-top-30">
          <div className="col-12">
            <button
              type="button"
              className="sherah-btn sherah-btn__primary"
              onClick={handleSubmit}
            >
              Создать товар
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProductForm;
