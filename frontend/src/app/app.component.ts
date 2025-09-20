import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div class="header">
      <div class="container">
        <h1>E-Commerce Platform</h1>
        <nav class="flex justify-between align-center">
          <div class="flex gap-2">
            <a routerLink="/products" routerLinkActive="active" class="btn">Products</a>
            <a routerLink="/cart" routerLinkActive="active" class="btn">Cart ({{cartItemCount}})</a>
            <a routerLink="/orders" routerLinkActive="active" class="btn">Orders</a>
          </div>
          <div class="flex gap-2">
            <ng-container *ngIf="!isLoggedIn(); else loggedInTemplate">
              <a routerLink="/login" class="btn btn-secondary">Login</a>
              <a routerLink="/register" class="btn btn-secondary">Register</a>
            </ng-container>
            <ng-template #loggedInTemplate>
              <span>Welcome, {{getCurrentUser()?.username}}!</span>
              <button (click)="logout()" class="btn btn-danger">Logout</button>
            </ng-template>
          </div>
        </nav>
      </div>
    </div>
    
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `,
    styles: [`
    .header nav a.active {
      background: #1565c0;
    }
  `]
})
export class AppComponent {
    title = 'ecommerce-frontend';

    constructor(private authService: AuthService) { }

    isLoggedIn(): boolean {
        return this.authService.isLoggedIn();
    }

    getCurrentUser() {
        return this.authService.getCurrentUser();
    }

    get cartItemCount(): number {
        return this.authService.getCartItemCount();
    }

    logout() {
        this.authService.logout();
    }
}
