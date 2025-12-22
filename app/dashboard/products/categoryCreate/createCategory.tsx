//app/dashboard/products/categoryCreate/createCategory.tsx
"use client";

import React, { useState } from 'react';
import { CreateCategory } from '../interface/create.category.interface';
import Cookies from 'js-cookie';
import { createCategory } from '@/app/lib/data';

interface CategoryCreateFormProps {
    onCategoryCreated: () => void;
    onClose: () => void;
}

const CategoryCreateForm: React.FC<CategoryCreateFormProps> = ({ onCategoryCreated, onClose }) => {
    const [categoryData, setCategoryData] = useState<CreateCategory>({
        name: '',
        slug: '',
        metaTitle: '',
        metaKeywords: '',
        metaDescription: '',
        description: '',
        image: null,
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCategoryData({
            ...categoryData,
            [name]: value,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setCategoryData({
                ...categoryData,
                image: file,
            });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const token = Cookies.get("token");
        if (!token) {
            setError("Токен авторизации отсутствует.");
            setLoading(false);
            return;
        }

        try {
            await createCategory(categoryData, token);
            onCategoryCreated();
            onClose();
        } catch (error) {
            setError("Ошибка при создании категории.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sherah-wc sherah-wc__full sherah-default-bg">
            <div className="sherah-wc__heading">
                <h3 className="sherah-wc__title">Создание категории</h3>
            </div>
            <form onSubmit={handleSubmit} className="sherah-wc__form">
                <div className="sherah-wc__form-inner">
                    <div className="row">
                        <div className="col-12 col-md-6">
                            <div className="sherah-wc__form-group">
                                <label className="sherah-wc__form-label">Название *</label>
                                <input
                                    className="sherah-wc__form-input"
                                    type="text"
                                    name="name"
                                    value={categoryData.name}
                                    onChange={handleChange}
                                    placeholder="Введите название категории"
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="sherah-wc__form-group">
                                <label className="sherah-wc__form-label">Slug *</label>
                                <input
                                    className="sherah-wc__form-input"
                                    type="text"
                                    name="slug"
                                    value={categoryData.slug}
                                    onChange={handleChange}
                                    placeholder="Введите slug"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="sherah-wc__form-group">
                        <label className="sherah-wc__form-label">Описание</label>
                        <textarea
                            className="sherah-wc__form-input sherah-wc__form-input--textarea"
                            name="description"
                            value={categoryData.description}
                            onChange={handleChange}
                            placeholder="Введите описание категории"
                            rows={4}
                        />
                    </div>

                    <div className="sherah-wc__divider mg-top-20 mg-btm-20"></div>
                    <h4 className="sherah-wc__form-subtitle">SEO информация</h4>

                    <div className="sherah-wc__form-group">
                        <label className="sherah-wc__form-label">Meta Title</label>
                        <input
                            className="sherah-wc__form-input"
                            type="text"
                            name="metaTitle"
                            value={categoryData.metaTitle}
                            onChange={handleChange}
                            placeholder="Meta Title"
                        />
                    </div>

                    <div className="sherah-wc__form-group">
                        <label className="sherah-wc__form-label">Meta Keywords</label>
                        <input
                            className="sherah-wc__form-input"
                            type="text"
                            name="metaKeywords"
                            value={categoryData.metaKeywords}
                            onChange={handleChange}
                            placeholder="Meta Keywords"
                        />
                    </div>

                    <div className="sherah-wc__form-group">
                        <label className="sherah-wc__form-label">Meta Description</label>
                        <textarea
                            className="sherah-wc__form-input sherah-wc__form-input--textarea"
                            name="metaDescription"
                            value={categoryData.metaDescription}
                            onChange={handleChange}
                            placeholder="Meta Description"
                            rows={3}
                        />
                    </div>

                    <div className="sherah-wc__divider mg-top-20 mg-btm-20"></div>
                    <h4 className="sherah-wc__form-subtitle">Изображение</h4>

                    <div className="sherah-wc__form-upload">
                        <label className="sherah-wc__form-upload-label">
                            <input
                                type="file"
                                name="image"
                                onChange={handleImageChange}
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

                    {imagePreview && (
                        <div className="sherah-wc__form-images mg-top-20">
                            <div className="sherah-wc__form-image-item">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="sherah-wc__form-image-preview"
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="sherah-alert sherah-alert__danger mg-top-20">
                            {error}
                        </div>
                    )}

                    <div className="row mg-top-30">
                        <div className="col-12">
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    type="submit"
                                    className="sherah-btn sherah-btn__primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Создание...' : 'Создать категорию'}
                                </button>
                                <button
                                    type="button"
                                    className="sherah-btn sherah-btn__secondary"
                                    onClick={onClose}
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CategoryCreateForm;
