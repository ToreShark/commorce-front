export interface CartItemInterface {
    uniqueOrderId?: string;
    productId: string;
    quantity: number;
    name: string;
    price: number;
    selectedProperties?: string;
    properties?: { [key: string]: string[] };
    cellphone?: string | null;
    imageUrl: string; 
}