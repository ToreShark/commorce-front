import { DeliveryAddressView } from "./DeliveryAddressView.interface";
import { OrderDeliveryView } from "./OrderDeliveryView.interface";
import { OrderItemView } from "./OrderItemView.interface";
import { OrderPaymentView } from "./OrderPaymentView.interface";

export interface OrderDataViewModel {
  orderId: string;
  customerName: string;
  cellPhone: string;
  referenceId: string;
  items: OrderItemView[];
  totalPrice: number;
  orderDate: string; // Дата в формате строки
  status: string;
  delivery: OrderDeliveryView | null;
  payment: OrderPaymentView | null;
  deliveryAddress: DeliveryAddressView | null;
}
