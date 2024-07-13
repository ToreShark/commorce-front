//app/dashboard/products/products.tsx
import "@/app/dashboard/products/products.scss";
import { getAllCategories } from "@/app/lib/data";
import { Button } from "@/components/ui/button";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Products() {
  const [categories, setCategories] = useState<any[]>([]);

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
          style={{ width: 100, height: 100, objectFit: 'cover' }}
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
            //   onClick={() => onViewUser(params.row.id)}
            style={{ marginRight: 8 }}
          >
            View
          </Button>
          <Button
            //   variant="contained"
            color="secondary"
            onClick={async () => {
              const token = Cookies.get("token");
              if (token) {
                //   try {
                //     await deleteUser(params.row.id, token);
                //     // Optionally remove the user from the state to update the UI
                //     setRows((prevRows) => prevRows.filter((row) => row.id !== params.row.id));
                //   } catch (error) {
                //     console.error('Failed to delete user:', error);
                //   }
              } else {
                console.error("Token not found");
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="products">
      <div className="productsContainer">
        <div className="top">
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
          />
        </div>
        <div className="bottom"></div>
      </div>
    </div>
  );
}
