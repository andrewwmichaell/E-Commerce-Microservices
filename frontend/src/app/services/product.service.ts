import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private readonly API_URL = 'http://localhost:8080';

    constructor(private http: HttpClient) { }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.API_URL}/products`);
    }

    getProduct(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.API_URL}/products/${id}`);
    }

    getProductsByCategory(category: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.API_URL}/products/category/${category}`);
    }

    searchProducts(name: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.API_URL}/products/search?name=${name}`);
    }

    getAvailableProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.API_URL}/products/available`);
    }
}
