import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartItem } from '../../models/cart-item.model';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div *ngIf="!isLoggedIn()" class="text-center">
      <p>Please login to view your cart.</p>
      <a routerLink="/login" class="btn">Login</a>
    </div>
    
    <div *ngIf="isLoggedIn()">
      <h2>Shopping Cart</h2>
      
      <div *ngIf="cartItems.length === 0" class="text-center">
        <p>Your cart is empty.</p>
        <a routerLink="/products" class="btn">Continue Shopping</a>
      </div>
      
      <div *ngIf="cartItems.length > 0">
        <div class="cart-item" *ngFor="let item of cartItems">
          <img [src]="item.imageUrl || 'assets/no-image.png'" [alt]="item.name" 
               (error)="$event.target.src='assets/no-image.png'">
          <div class="cart-item-details">
            <h4>{{ item.name }}</h4>
            <p>Price: ${{ item.price | number: '1.2-2' }}</p>
            <p *ngIf="item.expiryTime">Expires: {{ item.expiryTime | date:'short' }}</p>
          </div>
          <div class="cart-item-actions">
            <input type="number" [(ngModel)]="item.quantity" 
                   min="1" (change)="updateQuantity(item)" 
                   class="quantity-input">
            <button (click)="removeItem(item)" class="btn btn-danger">Remove</button>
          </div>
        </div>
        
        <div class="total">
          <strong>Total: ${{ getTotal() | number: '1.2-2' }}</strong>
</div>

< div class= "text-center mt-2" >
<button (click)="proceedToCheckout()" class= "btn btn-success" >
Proceed to Checkout
</button>
< button(click)="clearCart()" class= "btn btn-danger" >
Clear Cart
</button>
</div>
</div>
</div>
    `,
  styles: [`
    .cart - item {
        display: flex;
        align- items: center;
padding: 1rem;
border: 1px solid #e0e0e0;
border - radius: 8px;
margin - bottom: 1rem;
background: white;
    }
    
    .cart - item img {
    width: 80px;
    height: 80px;
    object - fit: cover;
    margin - right: 1rem;
    border - radius: 4px;
}
    
    .cart - item - details {
    flex: 1;
}
    
    .cart - item - details h4 {
    margin: 0 0 0.5rem 0;
    color: #333;
}
    
    .cart - item - details p {
    margin: 0.25rem 0;
    color: #666;
}
    
    .cart - item - actions {
    display: flex;
    align - items: center;
    gap: 1rem;
}
    
    .quantity - input {
    width: 80px;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border - radius: 4px;
}
    
    .total {
    font - size: 1.2rem;
    font - weight: bold;
    text - align: right;
    margin: 1rem 0;
    padding: 1rem;
    background: #f5f5f5;
    border - radius: 4px;
}
`]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(
    private authService: AuthService,
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

  updateQuantity(item: CartItem) {
    this.authService.updateCartItemQuantity(item.cartItemId, item.quantity);
    this.loadCartItems();
  }

  removeItem(item: CartItem) {
    this.authService.removeFromCart(item.cartItemId);
    this.loadCartItems();
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.authService.clearCart();
      this.loadCartItems();
    }
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  proceedToCheckout() {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
