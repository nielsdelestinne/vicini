import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Welcome to Vicini</h1>
        <p>Enter your name to join the collaborative space</p>
        
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">Your Name</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              [(ngModel)]="username" 
              required 
              minlength="3"
              placeholder="Enter your name"
              #nameInput="ngModel">
            
            <div *ngIf="nameInput.invalid && (nameInput.dirty || nameInput.touched)" class="error-message">
              <div *ngIf="nameInput.errors?.['required']">Name is required.</div>
              <div *ngIf="nameInput.errors?.['minlength']">Name must be at least 3 characters long.</div>
            </div>
          </div>
          
          <button type="submit" [disabled]="loginForm.invalid">Join Lobby</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }
    
    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }
    
    h1 {
      margin-bottom: 0.5rem;
      color: #333;
    }
    
    p {
      margin-bottom: 1.5rem;
      color: #666;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #4285f4;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    button:hover:not([disabled]) {
      background-color: #3367d6;
    }
    
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    .error-message {
      color: #d93025;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
  `]
})
export class LoginComponent {
  username: string = '';
  
  constructor(
    private userService: UserService,
    private router: Router
  ) {}
  
  onSubmit(): void {
    if (this.username.trim()) {
      this.userService.login(this.username.trim());
      this.router.navigate(['/lobby']);
    }
  }
}
