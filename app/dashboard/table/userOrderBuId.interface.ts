import { Order } from "./userOrderById.order.interface";

export interface User {
  id: string; // userId
  firstName: string; // userName
  lastName: string;
  email: string;
  phone: string;
  roleId: number;
  roleName: string;
  registrationDate: string;
  lastActiveDate: string;
  lastTransactionDate?: string;
  lastTransactionTotalPrice?: number;
  lastTransactionProducts?: { productId: string }[];
  userProducts?: { productId: string; productName: string }[];
  lastTransactionStatus?: string;
  orders: Order[];
}
