import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "@/app/dashboard/table/table.userbyidorder.scss";
import { User } from "./userOrderBuId.interface";
import { Order } from "./userOrderById.order.interface";

interface OrdersTableProps {
  orders: Order[];
}

export default function UserOrdersTable({ orders }: OrdersTableProps) {
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  );
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table" className="table">
        <TableHead>
          <TableRow>
            <TableCell align="right">Order Date</TableCell>
            <TableCell align="right">Total Price</TableCell>
            <TableCell align="right">Status</TableCell>
            <TableCell align="center">Items</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {sortedOrders.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell align="right">
                {new Date(order.orderDate).toLocaleDateString()}
              </TableCell>
              <TableCell align="right">{order.totalPrice}</TableCell>
              <TableCell align="right">
                <span className={`status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </TableCell>
              <TableCell align="center">
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  {order.items.map((item) => (
                    <li key={item.productId}>
                      {item.productName} - Количество: {item.quantity}, Цена:{" "}
                      {item.price}, Итого: {item.itemTotalPrice}
                    </li>
                  ))}
                </ul>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
