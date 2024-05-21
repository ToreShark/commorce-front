export interface Order {
  orderId: string;
  orderDate: string;
  totalPrice: number;
  isPickup: boolean;
  deliveryAddress?: string;
  pickupLocation?: string;
  pickupHours?: string;
  referenceId?: string;
}
