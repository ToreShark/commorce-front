export interface Order {
    orderId: string;
    orderDate: string;
    totalPrice: number;
    status: string;
    items: {
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      selectedPropertiesJson: string;
      itemTotalPrice: number;
    }[];
  }