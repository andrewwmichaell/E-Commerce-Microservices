import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { CartItem } from '../models/cart-item.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API_URL = 'http://localhost:8080';
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);

    public currentUser$ = this.currentUserSubject.asObservable();
    public cartItems$ = this.cartItemsSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadUserFromStorage();
        this.loadCartFromStorage();
    }

    private loadUserFromStorage() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUserSubject.next(JSON.parse(user));
        }
    }

    private loadCartFromStorage() {
        const cart = localStorage.getItem('cartItems');
        if (cart) {
            this.cartItemsSubject.next(JSON.parse(cart));
        }
    }

    private saveUserToStorage(user: User | null) {
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    private saveCartToStorage(cartItems: CartItem[]) {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials);
    }

    register(userData: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData);
    }

    logout() {
        this.currentUserSubject.next(null);
        this.cartItemsSubject.next([]);
        this.saveUserToStorage(null);
        this.saveCartToStorage([]);
        localStorage.removeItem('token');
    }

    isLoggedIn(): boolean {
        return this.currentUserSubject.value !== null && !!localStorage.getItem('token');
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    setUser(user: User, token: string) {
        this.currentUserSubject.next(user);
        this.saveUserToStorage(user);
        localStorage.setItem('token', token);
    }

    getCartItemCount(): number {
        return this.cartItemsSubject.value.length;
    }

    getCartItems(): CartItem[] {
        return this.cartItemsSubject.value;
    }

    setCartItems(cartItems: CartItem[]) {
        this.cartItemsSubject.next(cartItems);
        this.saveCartToStorage(cartItems);
    }

    addToCart(cartItem: CartItem) {
        const currentCart = this.getCartItems();
        const existingItem = currentCart.find(item => item.cartItemId === cartItem.cartItemId);

        if (existingItem) {
            existingItem.quantity += cartItem.quantity;
        } else {
            currentCart.push(cartItem);
        }

        this.setCartItems([...currentCart]);
    }

    removeFromCart(cartItemId: string) {
        const currentCart = this.getCartItems().filter(item => item.cartItemId !== cartItemId);
        this.setCartItems(currentCart);
    }

    updateCartItemQuantity(cartItemId: string, quantity: number) {
        const currentCart = this.getCartItems();
        const item = currentCart.find(item => item.cartItemId === cartItemId);

        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(cartItemId);
            } else {
                item.quantity = quantity;
                this.setCartItems([...currentCart]);
            }
        }
    }

    clearCart() {
        this.setCartItems([]);
    }

    extendCartExpiry(userId: number, days: number) {
        // This would typically call the cart service API
        // For now, we'll just update the local cart items
        const cartItems = this.getCartItems();
        cartItems.forEach(item => {
            item.expiryTime = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        });
        this.setCartItems(cartItems);
    }

    makeCartPermanent(userId: number) {
        // This would typically call the cart service API
        // For now, we'll just update the local cart items
        const cartItems = this.getCartItems();
        cartItems.forEach(item => {
            item.expiryTime = undefined;
        });
        this.setCartItems(cartItems);
    }
}
