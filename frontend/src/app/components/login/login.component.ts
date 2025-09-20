import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="login-form">
      <h2>Login</h2>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" [(ngModel)]="loginData.username" 
                 name="username" required>
        </div>
        
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" [(ngModel)]="loginData.password" 
                 name="password" required>
        </div>
        
        <button type="submit" class="btn" [disabled]="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>
      
      <div class="text-center mt-2">
        <p>Don't have an account? <a routerLink="/register">Register here</a></p>
      </div>
    </div>
  `,
    styles: [`
    .error-message {
      color: #dc3545;
      margin-top: 1rem;
      padding: 0.5rem;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
    }
  `]
})
export class LoginComponent {
    loginData: LoginRequest = {
        username: '',
        password: ''
    };

    loading = false;
    errorMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    onSubmit() {
        this.loading = true;
        this.errorMessage = '';

        this.authService.login(this.loginData).subscribe({
            next: (response) => {
                this.authService.setUser({
                    userId: response.userId,
                    username: response.username,
                    email: response.email
                }, response.token);

                this.router.navigate(['/products']);
                this.loading = false;
            },
            error: (error) => {
                this.errorMessage = error.error || 'Login failed. Please try again.';
                this.loading = false;
            }
        });
    }
}
