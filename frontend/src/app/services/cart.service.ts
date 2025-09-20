import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from '../models/cart-item.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly API_URL = 'http://localhost:8080';

    constructor(private http: HttpClient) { }

    getCartItems(userId: number): Observable<CartItem[]> {
        return this.http.get<CartItem[]>(`${this.API_URL}/cart/${userId}`);
    }

    addToCart(request: any): Observable<CartItem> {
        return this.http.post<CartItem>(`${this.API_URL}/cart/add`, request);
    }

    updateQuantity(userId: number, cartItemId: string, quantity: number): Observable<any> {
        return this.http.put(`${this.API_URL}/cart/${userId}/items/${cartItemId}/quantity`, quantity);
    }

    removeFromCart(userId: number, cartItemId: string): Observable<any> {
        return this.http.delete(`${this.API_URL}/cart/${userId}/items/${cartItemId}`);
    }

    clearCart(userId: number): Observable<any> {
        return this.http.delete(`${this.API_URL}/cart/${userId}`);
    }

    extendExpiry(userId: number, days: number = 7): Observable<any> {
        return this.http.post(`${this.API_URL}/cart/${userId}/extend-expiry`, days);
    }

    makePermanent(userId: number): Observable<any> {
        return this.http.post(`${this.API_URL}/cart/${userId}/make-permanent`, {});
    }
}
