import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Image from "next/image";
import { Product } from "../interface/product.interface.table";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (!products || products.length === 0) {
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="product table">
          <TableHead>
            <TableRow>
              <TableCell>No products found</TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>
    );
  }
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="product table">
        <TableHead>
          <TableRow>
            <TableCell>Image</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell>
                {product.mainImagePath ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${
                      product.mainImagePath
                    }?${new Date().getTime()}`}
                    alt={product.name}
                    width={50}
                    height={50}
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                ) : (
                  <span>No Image</span>
                )}
              </TableCell>
              <TableCell>{product.title}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>{product.sku}</TableCell>
              <TableCell align="right">${product.price}</TableCell>
              <TableCell align="right">
                <Button color="primary" onClick={() => onEdit(product)}>
                  Edit
                </Button>
                <Button color="secondary" onClick={() => onDelete(product.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
