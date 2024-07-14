//app/dashborad/products/categoryCreate/createCategory.tsx
import React, { useState } from 'react';
import { CreateCategory } from '../interface/create.category.interface';
import Cookies from 'js-cookie';
import { createCategory } from '@/app/lib/data';
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/products/categoryCreate/CategoryCreateForm.module.scss";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

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
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCategoryData({
            ...categoryData,
            [name]: value,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCategoryData({
                ...categoryData,
                image: e.target.files[0],
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const token = Cookies.get("token");// Получаем токен из localStorage
        if (!token) {
            setError("Authentication token is missing.");
            return;
        }

        try {
            await createCategory(categoryData, token);
            onCategoryCreated(); // Обновить список категорий
            onClose(); // Закрыть форму
            alert("Category created successfully!");
            // router.push('/admin/category');
        } catch (error) {
            setError("Failed to create category.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.formGroup}>
                <label>Name:</label>
                <TextField
                    label="Name"
                    variant="outlined"
                    name="name"
                    value={categoryData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label>Slug:</label>
                <TextField
                    label="Slug"
                    variant="outlined"
                    name="slug"
                    value={categoryData.slug}
                    onChange={handleChange}
                    fullWidth
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label>Meta Title:</label>
                <TextField
                    label="Meta Title"
                    variant="outlined"
                    name="metaTitle"
                    value={categoryData.metaTitle}
                    onChange={handleChange}
                    fullWidth
                />
            </div>
            <div className={styles.formGroup}>
                <label>Meta Keywords:</label>
                <TextField
                    label="Meta Keywords"
                    variant="outlined"
                    name="metaKeywords"
                    value={categoryData.metaKeywords}
                    onChange={handleChange}
                    fullWidth
                />
            </div>
            <div className={styles.formGroup}>
                <label>Meta Description:</label>
                <TextField
                    label="Meta Description"
                    variant="outlined"
                    name="metaDescription"
                    value={categoryData.metaDescription}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Description:</label>
                <TextField
                    label="Description"
                    variant="outlined"
                    name="description"
                    value={categoryData.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Image:</label>
                <input type="file" name="image" onChange={handleImageChange} />
            </div>
            <div className={styles.button}>
                <Button variant="contained" type="submit">
                    Create Category
                </Button>
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </form>
    );
};

export default CategoryCreateForm;
