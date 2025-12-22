//app/dashboard/products/products.tsx
"use client";
import {
  deleteCategory,
  deleteProduct,
  getAllCategories,
  getCategoryById,
  getProductsByCategory,
} from "@/app/lib/data";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Category from "@/app/lib/interfaces/category.interace";
import ProductTable from "./table/ProductTable";
import { Product } from "./interface/product.interface.table";
import CategoryCreateForm from "./categoryCreate/createCategory";
import CategoryDetails from "./categoryDetailView/categoryDetails";
import EditableCategoryDetails from "./editableCategoryDetails/editableCategoryDetails";
import EditableProductDetails from "./editTableProductDetail/editTableProductDetail";
import CreateProductForm from "./createTableProduct/createTableProduct";

export default function Products() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);
  const [showCreateProductForm, setShowCreateProductForm] = useState(false);
  const [selectedCategoryForDetails, setSelectedCategoryForDetails] =
    useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCategory, setEditedCategory] = useState<Category | null>(null);
  const [selectedProductForDetails, setSelectedProductForDetails] =
    useState<Product | null>(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const categoryData = await getAllCategories(token);
          setCategories(categoryData);
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      } else {
        console.error("Token not found");
      }
    };

    fetchCategories();
  }, []);

  const fetchProducts = async (categoryIds: string[]) => {
    const token = Cookies.get("token");
    if (token && categoryIds.length > 0) {
      try {
        setIsLoading(true);
        const productsDataPromises = categoryIds.map((categoryId: any) =>
          getProductsByCategory(categoryId, token)
        );
        const productsDataArrays = await Promise.all(productsDataPromises);
        const productsData = productsDataArrays.flat();
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setProducts([]);
    }
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((prod) =>
        prod.id === updatedProduct.id ? updatedProduct : prod
      )
    );
  };

  const handleDeleteCategory = async (id: string) => {
    const token = Cookies.get("token");
    if (token) {
      try {
        await deleteCategory(id, token);
        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.id !== id)
        );
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  };

  const handleCategorySelect = async (categoryId: string, isChecked: boolean) => {
    let newSelectedCategories: string[];

    if (isChecked) {
      newSelectedCategories = [...selectedCategories, categoryId];
    } else {
      newSelectedCategories = selectedCategories.filter((id) => id !== categoryId);
    }

    setSelectedCategories(newSelectedCategories);
    setActiveCategoryId(newSelectedCategories.length ? newSelectedCategories[0] : null);

    if (newSelectedCategories.length > 0) {
      const selectedCat = categories.find((cat) => cat.id === newSelectedCategories[0]) || null;
      setSelectedCategory(selectedCat);
      await fetchProducts(newSelectedCategories);
    } else {
      setSelectedCategory(null);
      setProducts([]);
    }
  };

  const handleViewCategory = async (categoryId: string) => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const categoryData = await getCategoryById(categoryId, token);
        setSelectedCategoryForDetails(categoryData);
        setShowCategoryDetails(true);
      } catch (error) {
        console.error("Error fetching category details:", error);
      }
    }
  };

  const handleCategoryCreated = () => {
    const fetchCategories = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const categoryData = await getAllCategories(token);
          setCategories(categoryData);
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      }
    };
    fetchCategories();
  };

  const handleEdit = () => {
    setEditedCategory(selectedCategoryForDetails);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedCategory(null);
  };

  const handleSave = (updatedCategory: Category) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category
      )
    );
    setIsEditing(false);
    setEditedCategory(null);
  };

  const handleCloseCategoryDetails = () => {
    setShowCategoryDetails(false);
    setSelectedCategoryForDetails(null);
  };

  const onEdit = (product: Product) => {
    setSelectedProductForDetails(product);
    setIsEditingProduct(true);
  };

  const handleSaveProduct = async () => {
    await fetchProducts(selectedCategories);
  };

  const onDelete = async (id: string) => {
    const token = Cookies.get("token");
    if (!token) {
      console.error("Token not found");
      return;
    }

    try {
      const result = await deleteProduct(id, token);
      if (result.success) {
        await fetchProducts(selectedCategories);
      } else {
        console.error("Failed to delete product:", result.message);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="sherah-dsinner">
      {/* Page Header */}
      <div className="row">
        <div className="col-12">
          <div className="sherah-breadcrumb mg-top-30">
            <h2 className="sherah-breadcrumb__title">Управление товарами</h2>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="row mg-top-30">
        <div className="col-12">
          <div className="sherah-table__head sherah-default-bg sherah-border">
            <div className="sherah-table__head-left">
              <button
                className={`sherah-btn ${showCreateForm ? 'sherah-btn__danger' : 'sherah-btn__primary'}`}
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                {showCreateForm ? "Скрыть форму" : "Создать категорию"}
              </button>
              <button
                className={`sherah-btn ${showCreateProductForm ? 'sherah-btn__danger' : 'sherah-btn__secondary'}`}
                onClick={() => setShowCreateProductForm(!showCreateProductForm)}
                style={{ marginLeft: 10 }}
                disabled={!selectedCategory}
              >
                {showCreateProductForm ? "Скрыть форму" : "Создать товар"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Category Form */}
      {showCreateForm && (
        <div className="row mg-top-20">
          <div className="col-12">
            <CategoryCreateForm
              onCategoryCreated={handleCategoryCreated}
              onClose={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Create Product Form */}
      {showCreateProductForm && selectedCategory && (
        <div className="row mg-top-20">
          <div className="col-12">
            <CreateProductForm category={selectedCategory} />
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="row mg-top-30">
        <div className="col-12">
          <div className="sherah-table sherah-page-inner sherah-border sherah-default-bg">
            <h3 className="sherah-table__title">Категории</h3>
            <table className="sherah-table__main sherah-table__main-v3">
              <thead className="sherah-table__head">
                <tr>
                  <th className="sherah-table__column-1">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          categories.forEach((cat) => handleCategorySelect(cat.id, true));
                        } else {
                          setSelectedCategories([]);
                          setSelectedCategory(null);
                          setProducts([]);
                        }
                      }}
                    />
                  </th>
                  <th className="sherah-table__column-2">ID</th>
                  <th className="sherah-table__column-3">Название</th>
                  <th className="sherah-table__column-4">Описание</th>
                  <th className="sherah-table__column-5">Изображение</th>
                  <th className="sherah-table__column-6">Действия</th>
                </tr>
              </thead>
              <tbody className="sherah-table__body">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>
                      Категории не найдены
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td className="sherah-table__column-1">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={(e) => handleCategorySelect(category.id, e.target.checked)}
                        />
                      </td>
                      <td className="sherah-table__column-2">
                        <span className="sherah-table__id">{category.id.substring(0, 8)}...</span>
                      </td>
                      <td className="sherah-table__column-3">
                        <p className="sherah-table__product-name">{category.name}</p>
                      </td>
                      <td className="sherah-table__column-4">
                        <p className="sherah-table__product-desc" title={category.description}>
                          {category.description?.length > 50
                            ? `${category.description.substring(0, 50)}...`
                            : category.description}
                        </p>
                      </td>
                      <td className="sherah-table__column-5">
                        {category.imagePath ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${category.imagePath}`}
                            alt={category.name}
                            style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.png";
                            }}
                          />
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td className="sherah-table__column-6">
                        <div className="sherah-table__product-action">
                          <button
                            className="sherah-btn sherah-btn__secondary"
                            onClick={() => handleViewCategory(category.id)}
                            style={{ marginRight: 8 }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                          <button
                            className="sherah-btn sherah-btn__danger"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Products Section */}
      {selectedCategories.length > 0 && (
        <div className="row mg-top-30">
          <div className="col-12">
            <div className="sherah-table sherah-page-inner sherah-border sherah-default-bg">
              <h3 className="sherah-table__title">
                Товары в категории: {selectedCategory?.name}
                {isLoading && <span style={{ marginLeft: 10, fontSize: 14 }}>Загрузка...</span>}
              </h3>
              <ProductTable
                products={products}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>
        </div>
      )}

      {/* Category Details Modal */}
      {showCategoryDetails && selectedCategoryForDetails && (
        <CategoryDetails
          category={selectedCategoryForDetails}
          onEdit={handleEdit}
          onClose={handleCloseCategoryDetails}
        />
      )}

      {/* Edit Category Modal */}
      {isEditing && editedCategory && (
        <EditableCategoryDetails
          category={editedCategory}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      )}

      {/* Edit Product Modal */}
      {isEditingProduct && selectedProductForDetails && (
        <EditableProductDetails
          product={selectedProductForDetails}
          categoryId={activeCategoryId}
          onCancel={() => {
            setIsEditingProduct(false);
            setSelectedProductForDetails(null);
          }}
          onSave={updateProduct}
          onFinishEditing={() => {
            setIsEditingProduct(false);
            setSelectedProductForDetails(null);
          }}
          refreshProducts={handleSaveProduct}
        />
      )}
    </div>
  );
}
