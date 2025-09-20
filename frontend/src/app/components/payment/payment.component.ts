import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { OrderService } from '../../services/order.service';

@Component({
    selector: 'app-payment',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div *ngIf="!isLoggedIn()" class="text-center">
      <p>Please login to proceed with payment.</p>
      <a routerLink="/login" class="btn">Login</a>
    </div>
    
    <div *ngIf="isLoggedIn()">
      <h2>Payment</h2>
      
      <div *ngIf="order" class="order-info">
        <h3>Order #{{ order.orderId }}</h3>
        <p>Total Amount: ${{ order.totalAmount | number: '1.2-2' }}</p>
        <p>Order Date: {{ order.orderDate | date:'short' }}</p>
      </div>
      
      <div *ngIf="!paymentProcessed" class="payment-form">
        <h3>Payment Information</h3>
        <form (ngSubmit)="processPayment()">
          <div class="form-group">
            <label for="cardNumber">Card Number:</label>
            <input type="text" id="cardNumber" [(ngModel)]="paymentData.cardNumber" 
                   name="cardNumber" required placeholder="1234 5678 9012 3456">
          </div>
          
          <div class="form-group">
            <label for="expiryDate">Expiry Date:</label>
            <input type="text" id="expiryDate" [(ngModel)]="paymentData.expiryDate" 
                   name="expiryDate" required placeholder="MM/YY">
          </div>
          
          <div class="form-group">
            <label for="cvv">CVV:</label>
            <input type="text" id="cvv" [(ngModel)]="paymentData.cvv" 
                   name="cvv" required placeholder="123">
          </div>
          
          <div class="form-group">
            <label for="cardHolderName">Cardholder Name:</label>
            <input type="text" id="cardHolderName" [(ngModel)]="paymentData.cardHolderName" 
                   name="cardHolderName" required>
          </div>
          
          <button type="submit" class="btn btn-success" [disabled]="loading">
            {{ loading ? 'Processing Payment...' : 'Pay Now' }}
          </button>
          
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>
      </div>
      
      <div *ngIf="paymentProcessed" class="payment-result">
        <div *ngIf="payment?.status === 'COMPLETED'" class="success-message">
          <h3>Payment Successful!</h3>
          <p>Your payment has been processed successfully.</p>
          <p>Transaction ID: {{ payment?.transactionId }}</p>
          <div class="text-center mt-2">
            <a routerLink="/products" class="btn">Continue Shopping</a>
            <a routerLink="/orders" class="btn btn-secondary">View Orders</a>
          </div>
        </div>
        
        <div *ngIf="payment?.status === 'FAILED'" class="error-message">
          <h3>Payment Failed</h3>
          <p>{{ payment?.notes || 'Your payment could not be processed. Please try again.' }}</p>
          <div class="text-center mt-2">
            <button (click)="retryPayment()" class="btn">Try Again</button>
            <a routerLink="/cart" class="btn btn-secondary">Back to Cart</a>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .order-info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }
    
    .order-info h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }
    
    .order-info p {
      margin: 0.25rem 0;
      color: #666;
    }
    
    .payment-form {
      background: white;
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
    
    .payment-result {
      text-align: center;
      padding: 2rem;
    }
    
    .success-message {
      color: #155724;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 8px;
      padding: 2rem;
    }
    
    .error-message {
      color: #721c24;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
      padding: 2rem;
    }
  `]
})
export class PaymentComponent implements OnInit {
    orderId: number = 0;
    order: any = null;
    payment: any = null;
    paymentProcessed = false;
    loading = false;
    errorMessage = '';

    paymentData = {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: ''
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private paymentService: PaymentService,
        private orderService: OrderService
    ) { }

    ngOnInit() {
        this.orderId = +this.route.snapshot.paramMap.get('orderId')!;
        this.loadOrder();
    }

    isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    loadOrder() {
        this.orderService.getOrderById(this.orderId).subscribe({
            next: (order) => {
                this.order = order;
            },
            error: (error) => {
                console.error('Error loading order:', error);
                this.errorMessage = 'Order not found';
            }
        });
    }

    processPayment() {
        if (!this.order) {
            this.errorMessage = 'Order not found';
            return;
        }

        this.loading = true;
        this.errorMessage = '';

        const paymentRequest = {
            orderId: this.orderId,
            userId: this.authService.getCurrentUser()!.userId,
            amount: this.order.totalAmount,
            paymentMethod: 'Credit Card',
            cardNumber: this.paymentData.cardNumber,
            expiryDate: this.paymentData.expiryDate,
            cvv: this.paymentData.cvv,
            cardHolderName: this.paymentData.cardHolderName
        };

        this.paymentService.processPayment(paymentRequest).subscribe({
            next: (payment) => {
                this.payment = payment;
                this.paymentProcessed = true;
                this.loading = false;

                if (payment.status === 'COMPLETED') {
                    // Make cart permanent
                    this.authService.makeCartPermanent(this.authService.getCurrentUser()!.userId);
                }
            },
            error: (error) => {
                this.errorMessage = error.error || 'Payment processing failed. Please try again.';
                this.loading = false;
            }
        });
    }

    retryPayment() {
        this.paymentProcessed = false;
        this.payment = null;
        this.errorMessage = '';
    }
}
