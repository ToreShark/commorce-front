export interface User {
  userId: string;
  userName: string;
  lastTransactionDate?: string;
  lastTransactionTotalPrice: number;
  lastTransactionProducts?: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  userProducts?: {
    productId: string;
    productName: string;
  }[];
}
