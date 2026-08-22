import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type AuthMode = 'login' | 'signup';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  mode: AuthMode = 'login';

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  switchMode(mode: AuthMode): void {
    this.mode = mode;
    this.errorMessage = '';
    this.password = '';
    this.confirmPassword = '';
  }

  submit(): void {
    this.errorMessage = '';
    const result = this.mode === 'signup' ? this.handleSignup() : this.handleLogin();
    if (result) {
      this.router.navigateByUrl('/');
    }
  }

  private handleLogin(): boolean {
    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Renseignez votre email et votre mot de passe.';
      return false;
    }

    const result = this.authService.login(this.email, this.password);
    if (!result.success) {
      this.errorMessage = result.error ?? 'Connexion impossible.';
      return false;
    }
    return true;
  }

  private handleSignup(): boolean {
    if (!this.name.trim() || !this.email.trim() || !this.password) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      return false;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Entrez un email valide.';
      return false;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return false;
    }

    const result = this.authService.register(this.name, this.email, this.password);
    if (!result.success) {
      this.errorMessage = result.error ?? 'Inscription impossible.';
      return false;
    }
    return true;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
}
