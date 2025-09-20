import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/user.model';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="register-form">
      <h2>Register</h2>
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" [(ngModel)]="registerData.username" 
                 name="username" required>
        </div>
        
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" [(ngModel)]="registerData.email" 
                 name="email" required>
        </div>
        
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" [(ngModel)]="registerData.password" 
                 name="password" required minlength="6">
        </div>
        
        <button type="submit" class="btn" [disabled]="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
        
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>
      </form>
      
      <div class="text-center mt-2">
        <p>Already have an account? <a routerLink="/login">Login here</a></p>
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
    
    .success-message {
      color: #155724;
      margin-top: 1rem;
      padding: 0.5rem;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
    }
  `]
})
export class RegisterComponent {
    registerData: RegisterRequest = {
        username: '',
        email: '',
        password: ''
    };

    loading = false;
    errorMessage = '';
    successMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    onSubmit() {
        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.register(this.registerData).subscribe({
            next: (response) => {
                this.successMessage = 'Registration successful! Please login.';
                this.loading = false;

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 2000);
            },
            error: (error) => {
                this.errorMessage = error.error || 'Registration failed. Please try again.';
                this.loading = false;
            }
        });
    }
}
