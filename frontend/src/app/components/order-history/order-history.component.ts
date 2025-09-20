import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

@Component({
    selector: 'app-order-history',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div *ngIf="!isLoggedIn()" class="text-center">
      <p>Please login to view your orders.</p>
      <a routerLink="/login" class="btn">Login</a>
    </div>
    
    <div *ngIf="isLoggedIn()">
      <h2>Order History</h2>
      
      <div *ngIf="orders.length === 0" class="text-center">
        <p>You have no orders yet.</p>
        <a routerLink="/products" class="btn">Start Shopping</a>
      </div>
      
      <div *ngIf="orders.length > 0">
        <div class="order-card" *ngFor="let order of orders">
          <div class="order-header">
            <h3>Order #{{ order.orderId }}</h3>
            <span class="order-status" [ngClass]="getStatusClass(order.status)">
              {{ order.status }}
            </span>
          </div>
          
          <div class="order-details">
            <p><strong>Order Date:</strong> {{ order.orderDate | date:'short' }}</p>
            <p><strong>Total Amount:</strong> ${{ order.totalAmount | number: '1.2-2' }}</p>
          </div>
          
          <div class="order-items" *ngIf="order.orderItems && order.orderItems.length > 0">
            <h4>Items:</h4>
            <div class="item" *ngFor="let item of order.orderItems">
              <span>{{ item.quantity }}x Product #{{ item.productId }}</span>
              <span>${{ item.price | number: '1.2-2' }} each</span>
            </div>
          </div>
          
          <div class="order-actions">
            <button (click)="viewOrderDetails(order)" class="btn btn-secondary">
              View Details
            </button>
            <button *ngIf="order.status === 'PENDING'" (click)="payForOrder(order)" class="btn btn-success">
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .order-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .order-header h3 {
      margin: 0;
      color: #333;
    }
    
    .order-status {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .status-pending {
      background: #fff3cd;
      color: #856404;
    }
    
    .status-confirmed {
      background: #d1ecf1;
      color: #0c5460;
    }
    
    .status-shipped {
      background: #d4edda;
      color: #155724;
    }
    
    .status-delivered {
      background: #d1ecf1;
      color: #0c5460;
    }
    
    .status-cancelled {
      background: #f8d7da;
      color: #721c24;
    }
    
    .order-details {
      margin-bottom: 1rem;
    }
    
    .order-details p {
      margin: 0.25rem 0;
      color: #666;
    }
    
    .order-items {
      margin-bottom: 1rem;
    }
    
    .order-items h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }
    
    .item {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .order-actions {
      display: flex;
      gap: 0.5rem;
    }
  `]
})
export class OrderHistoryComponent implements OnInit {
    orders: any[] = [];

    constructor(
        private authService: AuthService,
        private orderService: OrderService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadOrders();
    }

    isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    loadOrders() {
        if (!this.isLoggedIn()) return;

        this.orderService.getOrdersByUserId(this.authService.getCurrentUser()!.userId).subscribe({
            next: (orders) => {
                this.orders = orders;
            },
            error: (error) => {
                console.error('Error loading orders:', error);
            }
        });
    }

    getStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }

    viewOrderDetails(order: any) {
        // In a real app, you might navigate to a detailed order view
        alert(`Order #${order.orderId} details:\nStatus: ${order.status}\nTotal: $${order.totalAmount}`);
    }

    payForOrder(order: any) {
        this.router.navigate(['/payment', order.orderId]);
    }
}
