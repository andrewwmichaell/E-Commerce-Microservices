export interface CartItem {
    cartItemId: string;
    userId: number;
    productId: number;
    quantity: number;
    price: number;
    expiryTime?: string;
    name: string;
    imageUrl?: string;
}
