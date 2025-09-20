import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private readonly API_URL = 'http://localhost:8080';

    constructor(private http: HttpClient) { }

    processPayment(paymentData: any): Observable<any> {
        return this.http.post(`${this.API_URL}/payment/process`, paymentData);
    }

    getPaymentById(paymentId: number): Observable<any> {
        return this.http.get<any>(`${this.API_URL}/payment/${paymentId}`);
    }

    getPaymentsByOrderId(orderId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_URL}/payment/order/${orderId}`);
    }

    getPaymentsByUserId(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_URL}/payment/user/${userId}`);
    }

    updatePaymentStatus(paymentId: number, status: string): Observable<any> {
        return this.http.put(`${this.API_URL}/payment/${paymentId}/status`, status);
    }

    refundPayment(paymentId: number): Observable<any> {
        return this.http.post(`${this.API_URL}/payment/${paymentId}/refund`, {});
    }
}
