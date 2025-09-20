import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private readonly API_URL = 'http://localhost:8080';

    constructor(private http: HttpClient) { }

    createOrder(orderData: any): Observable<any> {
        return this.http.post(`${this.API_URL}/orders`, orderData);
    }

    getOrdersByUserId(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_URL}/orders/user/${userId}`);
    }

    getOrderById(orderId: number): Observable<any> {
        return this.http.get<any>(`${this.API_URL}/orders/${orderId}`);
    }

    updateOrderStatus(orderId: number, status: string): Observable<any> {
        return this.http.put(`${this.API_URL}/orders/${orderId}/status?status=${status}`, {});
    }
}
