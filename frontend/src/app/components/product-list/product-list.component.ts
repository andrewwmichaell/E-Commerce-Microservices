import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/cart-item.model';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="product-grid">
      <div *ngFor="let product of products" class="product-card">
        <div class="product-image">
          <img [src]="product.imageUrl || 'assets/no-image.png'" [alt]="product.name" 
               (error)="$event.target.src='assets/no-image.png'">
        </div>
        <div class="product-details">
          <h3>{{ product.name }}</h3>
          <p>{{ product.description }}</p>
          <div class="product-price">${{ product.price | number: '1.2-2' }}</div>
          <div class="product-stock">Stock: {{ product.stock }}</div>
          <div class="product-actions">
            <input type="number" [(ngModel)]="quantities[product.productId]" 
                   min="1" [max]="product.stock" placeholder="Quantity" 
                   class="quantity-input">
            <button (click)="addToCart(product)" 
                    [disabled]="!quantities[product.productId] || quantities[product.productId] <= 0 || quantities[product.productId] > product.stock"
                    class="btn btn-success">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div *ngIf="products.length === 0" class="text-center">
      <p>No products available.</p>
    </div>
  `,
    styles: [`
    .product-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .product-image img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 4px;
    }
    
    .product-details h3 {
      margin: 0.5rem 0;
      color: #333;
    }
    
    .product-details p {
      color: #666;
      margin: 0.5rem 0;
    }
    
    .product-price {
      font-size: 1.2rem;
      font-weight: bold;
      color: #1976d2;
      margin: 0.5rem 0;
    }
    
    .product-stock {
      color: #666;
      margin: 0.5rem 0;
    }
    
    .product-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-top: 1rem;
    }
    
    .quantity-input {
      width: 80px;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  `]
})
export class ProductListComponent implements OnInit {
    products: Product[] = [];
    quantities: { [key: number]: number } = {};

    constructor(
        private productService: ProductService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loadProducts();
    }

    loadProducts() {
        this.productService.getProducts().subscribe({
            next: (products) => {
                this.products = products;
                // Initialize quantities
                products.forEach(product => {
                    this.quantities[product.productId] = 1;
                });
            },
            error: (error) => {
                console.error('Error loading products:', error);
            }
        });
    }

    addToCart(product: Product) {
        if (!this.authService.isLoggedIn()) {
            alert('Please login to add items to cart');
            return;
        }

        const quantity = this.quantities[product.productId];
        if (quantity <= 0 || quantity > product.stock) {
            alert('Invalid quantity');
            return;
        }

        const cartItem: CartItem = {
            cartItemId: `${this.authService.getCurrentUser()!.userId}:${product.productId}`,
            userId: this.authService.getCurrentUser()!.userId,
            productId: product.productId,
            quantity: quantity,
            price: product.price,
            name: product.name,
            imageUrl: product.imageUrl,
            expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        };

        this.authService.addToCart(cartItem);
        alert('Item added to cart!');
    }
}
