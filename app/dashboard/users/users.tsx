"use client";
import "@/app/dashboard/users/users.scss";
import { deleteUser, getUsers } from "@/app/lib/data";
import Button from '@mui/material/Button';
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  roleId: number;
}

const columns = (setRows: React.Dispatch<React.SetStateAction<User[]>>): GridColDef[] => [
  { field: "id", headerName: "ID", width: 150 },
  { field: "firstName", headerName: "First Name", width: 130 },
  { field: "lastName", headerName: "Last Name", width: 130 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "phone", headerName: "Phone", width: 150 },
  { field: "roleId", headerName: "Role ID", width: 100 },
  {
    field: "actions",
    headerName: "Actions",
    width: 200,
    renderCell: (params) => (
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => console.log(`View user with ID: ${params.row.id}`)}
          style={{ marginRight: 8 }}
        >
          View
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={async () => {
            console.log(`Delete user with ID: ${params.row.id}`);
            const token = Cookies.get("token");
            if (token) {
              try {
                await deleteUser(params.row.id, token);
                // Optionally remove the user from the state to update the UI
                setRows((prevRows) => prevRows.filter((row) => row.id !== params.row.id));
              } catch (error) {
                console.error('Failed to delete user:', error);
              }
            } else {
              console.error('Token not found');
            }
          }}
        >
          Delete
        </Button>
      </div>
    ),
  },
];

export default function DataTable() {
  const [rows, setRows] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("Token not found");
        }

        const usersResponse = await getUsers(token);
        const formattedRows: User[] = usersResponse.users.map((user: any) => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          roleId: user.roleId,
        }));
        setRows(formattedRows);
      } catch (error) {
        console.error('There was an error fetching the users!', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns(setRows)} // Вызов columns с передачей setRows
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
      />
    </div>
  );
}