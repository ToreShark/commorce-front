import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { User } from "./user.interface";
import "@/app/dashboard/table/table.scss";

function createData(
  userName: string,
  lastTransactionDate: string,
  lastTransactionTotalPrice: number,
  lastTransactionProductCount: number,
  userProductCount: number,
  lastOrderedProduct: string,
  lastTransactionStatus: string
) {
  return {
    userName,
    lastTransactionDate,
    lastTransactionTotalPrice,
    lastTransactionProductCount,
    userProductCount,
    lastOrderedProduct,
    lastTransactionStatus,
  };
}

interface BasicTableProps {
  users: User[];
}

export default function BasicTable({ users }: BasicTableProps) {
    const rows = users.map((user) =>
    createData(
      user.userName,
      user.lastTransactionDate
        ? new Date(user.lastTransactionDate).toLocaleDateString()
        : "",
      user.lastTransactionTotalPrice,
      user.lastTransactionProducts ? user.lastTransactionProducts.length : 0,
      user.userProducts ? user.userProducts.length : 0,
      user.userProducts && user.userProducts.length > 0 ? user.userProducts[user.userProducts.length - 1].productName : "N/A",
      user.lastTransactionStatus,
    )
  );

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>User Name</TableCell>
            <TableCell align="right">Last Transaction Date</TableCell>
            <TableCell align="right">Last Transaction Total Price</TableCell>
            <TableCell align="right">Last Transaction Product Count</TableCell>
            <TableCell align="right">User Product Count</TableCell>
            <TableCell align="right">Last Ordered Product</TableCell>
            <TableCell align="right">Last Transaction Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={users[index].userId}>
              <TableCell component="th" scope="row">
                {row.userName}
              </TableCell>
              <TableCell align="right">{row.lastTransactionDate}</TableCell>
              <TableCell align="right">
                {row.lastTransactionTotalPrice}
              </TableCell>
              <TableCell align="right">
                {row.lastTransactionProductCount}
              </TableCell>
              <TableCell align="right">{row.userProductCount}</TableCell>
              <TableCell align="right">{row.lastOrderedProduct}</TableCell>
              <TableCell align="right">
                <span className={`status ${row.lastTransactionStatus}`}>
                  {row.lastTransactionStatus}
                </span></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
