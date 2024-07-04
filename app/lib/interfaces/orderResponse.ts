import { OrderItem } from "./orderItem";

export interface Order {
  items: any;
  orderId: string;
  orderDate: string;
  totalPrice: number;
  isPickup: boolean;
  deliveryAddress?: string;
  pickupLocation?: string;
  pickupHours?: string;
  referenceId?: string;
  orderItems: OrderItem[];
  message?: string;
  success?: boolean;
}
