export interface CartItemInterface {
    productId: string;
    quantity: number;
    name: string;
    price: number;
    selectedProperties?: string;
    cellphone?: string | null;
    imageUrl: string; 
}