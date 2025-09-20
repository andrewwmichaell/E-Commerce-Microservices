import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { CartItem } from '../../models/cart-item.model';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div *ngIf="!isLoggedIn()" class="text-center">
      <p>Please login to proceed with checkout.</p>
      <a routerLink="/login" class="btn">Login</a>
    </div>
    
    <div *ngIf="isLoggedIn()">
      <h2>Checkout</h2>
      
      <div *ngIf="cartItems.length === 0" class="text-center">
        <p>Your cart is empty.</p>
        <a routerLink="/products" class="btn">Continue Shopping</a>
      </div>
      
      <div *ngIf="cartItems.length > 0">
        <div class="checkout-summary">
          <h3>Order Summary</h3>
          <div class="cart-item" *ngFor="let item of cartItems">
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p>Quantity: {{ item.quantity }}</p>
              <p>Price: ${{ item.price | number: '1.2-2' }}</p>
            </div>
            <div class="item-total">
              ${{ (item.price * item.quantity) | number: '1.2-2' }}
    </div>
    </div>

    < div class= "total" >
    <strong>Total: ${{ getTotal() | number: '1.2-2' }}</strong>
    </div>
    </div>

< div class= "checkout-form" >
<h3>Shipping Information </h3>
< form(ngSubmit)="placeOrder()" >
<div class="form-group" >
<label for= "shippingAddress" > Shipping Address: </label>
    < textarea id = "shippingAddress"[(ngModel)] = "shippingAddress"
name = "shippingAddress" required rows = "3" > </textarea>
    </div>

    < div class="form-group" >
        <label for= "city" > City: </label>
            < input type = "text" id = "city"[(ngModel)] = "city"
name = "city" required >
    </div>

    < div class="form-group" >
        <label for= "zipCode" > ZIP Code: </label>
            < input type = "text" id = "zipCode"[(ngModel)] = "zipCode"
name = "zipCode" required >
    </div>

    < button type = "submit" class="btn btn-success"[disabled] = "loading" >
        {{ loading ? 'Placing Order...' : 'Place Order' }}
</button>

    < div * ngIf="errorMessage" class="error-message" >
        {{ errorMessage }}
</div>
    </form>
    </div>
    </div>
    </div>
        `,
  styles: [`
        .checkout - summary {
    background: #f8f9fa;
    padding: 1rem;
    border - radius: 8px;
    margin - bottom: 2rem;
}
    
    .cart - item {
    display: flex;
    justify - content: space - between;
    align - items: center;
    padding: 0.5rem 0;
    border - bottom: 1px solid #e0e0e0;
}
    
    .item - info h4 {
    margin: 0 0 0.25rem 0;
    color: #333;
}
    
    .item - info p {
    margin: 0.25rem 0;
    color: #666;
}
    
    .item - total {
    font - weight: bold;
    color: #1976d2;
}
    
    .total {
    font - size: 1.2rem;
    font - weight: bold;
    text - align: right;
    margin - top: 1rem;
    padding - top: 1rem;
    border - top: 2px solid #1976d2;
}
    
    .checkout - form {
    background: white;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border - radius: 8px;
}
    
    .checkout - form textarea {
    width: 100 %;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border - radius: 4px;
    font - size: 1rem;
    resize: vertical;
}
    
    .error - message {
    color: #dc3545;
    margin - top: 1rem;
    padding: 0.5rem;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border - radius: 4px;
}
`]
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  shippingAddress = '';
  city = '';
  zipCode = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCartItems();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  loadCartItems() {
    this.cartItems = this.authService.getCartItems();
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  placeOrder() {
    if (!this.shippingAddress || !this.city || !this.zipCode) {
      this.errorMessage = 'Please fill in all shipping information';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const orderData = {
      userId: this.authService.getCurrentUser()!.userId,
      items: this.cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        // Extend cart expiry to 7 days
        this.authService.extendCartExpiry(this.authService.getCurrentUser()!.userId, 7);
        
        this.router.navigate(['/payment', order.orderId]);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error || 'Failed to place order. Please try again.';
        this.loading = false;
      }
    });
  }
}
