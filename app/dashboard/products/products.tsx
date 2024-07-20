//app/dashboard/products/products.tsx
import "@/app/dashboard/products/products.scss";
import {
  deleteCategory,
  getAllCategories,
  getCategoryById,
  getProductsByCategory,
} from "@/app/lib/data";
import { Button } from "@/components/ui/button";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Image from "next/image";
import Category from "@/app/lib/interfaces/category.interace";
import ProductTable from "./table/ProductTable";
import ProductsDisplay from "./table/ProductsDisplay";
import { Product } from "./interface/product.interface.table";
import CategoryCreateForm from "./categoryCreate/createCategory";
import CategoryDetails from "./categoryDetailView/categoryDetails";
import EditableCategoryDetails from "./editableCategoryDetails/editableCategoryDetails";

export default function Products() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);
  const [selectedCategoryForDetails, setSelectedCategoryForDetails] =
    useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCategory, setEditedCategory] = useState<Category | null>(null);

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
    } else {
      console.error("Token not found");
    }
  };

  const handleSelectionModelChange = async (
    newSelectionModel: GridRowSelectionModel
  ) => {
    const selectedIds = newSelectionModel.map((id: { toString: () => any }) =>
      id.toString()
    );
    setSelectedCategories(selectedIds);

    const token = Cookies.get("token");
    if (token && selectedIds.length > 0) {
      try {
        // Вызов функции для получения продуктов по категориям
        setIsLoading(true);
        const productsDataPromises = selectedIds.map((categoryId: any) =>
          getProductsByCategory(categoryId, token)
        );
        const productsDataArrays = await Promise.all(productsDataPromises);
        const productsData = productsDataArrays.flat(); // Объединяем все массивы продуктов в один

        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } 
    } else {
      setProducts([]);
      if (!token) {
        console.error("Token not found");
      }
    }
  };

  const handleViewCategory = async (categoryId: string) => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const categoryData = await getCategoryById(categoryId, token);
        const categoryDetails = {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          imagePath: categoryData.imagePath,
          lastModified: categoryData.lastModified,
          metaTitle: categoryData.metaTitle,
          metaKeywords: categoryData.metaKeywords,
          metaDescription: categoryData.metaDescription,
        };
        setSelectedCategoryForDetails(categoryDetails);
        setShowCategoryDetails(true);
      } catch (error) {
        console.error("Error fetching category details:", error);
      }
    } else {
      console.error("Token not found");
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Name", width: 130 },
    { field: "description", headerName: "Description", width: 250 },
    {
      field: "imagePath",
      headerName: "Image",
      width: 250,
      renderCell: (params) => (
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}${params.value}`}
          alt={params.row.name}
          style={{ width: 100, height: 100, objectFit: "cover" }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <div>
          <Button
            //   variant="contained"
            color="primary"
            onClick={(e) => {
              e.stopPropagation(); // Prevent the event from propagating to the row selection
              handleViewCategory(params.row.id);
            }}
            style={{ marginRight: 8 }}
          >
            View
          </Button>
          <Button
            //   variant="contained"
            color="secondary"
            onClick={(e) => {
              e.stopPropagation(); // Prevent the event from propagating to the row selection
              handleDeleteCategory(params.row.id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

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
      } else {
        console.error("Token not found");
      }
    };

    fetchCategories();
  };

  const handleEdit = () => {
    setEditedCategory(selectedCategoryForDetails);
    setIsEditing(true);
    // setShowCategoryDetails(false);
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

  // Метод для редактирования продукта
  const onEdit = (id: string) => {
    console.log('Editing product with ID:', id);
    // Тут можно добавить логику для открытия формы редактирования
  };

  // Метод для удаления продукта
  const onDelete = (id: string) => {
    console.log('Deleting product with ID:', id);
    // Тут можно добавить логику для подтверждения и удаления продукта
  };
  

  return (
    <div className="products">
      <div className="productsContainer">
        <div className="top">
          <Button
            color="primary"
            onClick={() => setShowCreateForm(!showCreateForm)} // Добавляем кнопку для показа/скрытия формы
          >
            {showCreateForm
              ? "Скрыть форму создания категории"
              : "Создать категорию"}
          </Button>
          {showCreateForm && (
            <CategoryCreateForm
              onCategoryCreated={handleCategoryCreated}
              onClose={() => setShowCreateForm(false)}
            />
          )}{" "}
          {/* Отображаем форму, если showCreateForm === true */}
          <DataGrid
            rows={categories}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            onRowSelectionModelChange={handleSelectionModelChange}
          />
        </div>
        <div className="bottom">
          {selectedCategories.length > 0 && (
            <div>
              <h3>Товары в выбранной категории:</h3>
              <ul>
                <ProductTable products={products} onEdit={onEdit} onDelete={onDelete} />
              </ul>
            </div>
          )}
          {showCategoryDetails && selectedCategoryForDetails && (
            <CategoryDetails
              category={selectedCategoryForDetails}
              onEdit={handleEdit}
              onClose={handleCloseCategoryDetails}
            />
          )}
          {isEditing && editedCategory && (
            <EditableCategoryDetails
              category={editedCategory}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          )}
        </div>
      </div>
    </div>
  );
}
