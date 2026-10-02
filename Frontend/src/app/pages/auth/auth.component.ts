import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type AuthMode = 'login' | 'signup' | 'verify';

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
  verificationCode = '';
  errorMessage = '';
  infoMessage = '';
  pendingEmail = '';

  /** Prototype only: there's no real email server, so the "sent" code is shown directly in the UI. */
  simulatedCode: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  switchMode(mode: 'login' | 'signup'): void {
    this.mode = mode;
    this.errorMessage = '';
    this.infoMessage = '';
    this.password = '';
    this.confirmPassword = '';
  }

  submit(): void {
    this.errorMessage = '';
    if (this.mode === 'login') {
      this.handleLogin();
    } else if (this.mode === 'signup') {
      this.handleSignup();
    } else {
      this.handleVerify();
    }
  }

  resendCode(): void {
    const code = this.authService.resendVerificationCode(this.pendingEmail);
    if (code) {
      this.simulatedCode = code;
      this.errorMessage = '';
      this.infoMessage = 'Nouveau code généré.';
    }
  }

  private handleLogin(): void {
    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Renseignez votre email et votre mot de passe.';
      return;
    }

    const result = this.authService.login(this.email, this.password);
    if (result.success) {
      this.router.navigateByUrl('/');
      return;
    }

    if (result.requiresVerification) {
      this.enterVerification(this.email);
      return;
    }

    this.errorMessage = result.error ?? 'Connexion impossible.';
  }

  private handleSignup(): void {
    if (!this.name.trim() || !this.email.trim() || !this.password) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Entrez un email valide.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    const result = this.authService.register(this.name, this.email, this.password);
    if (!result.success) {
      this.errorMessage = result.error ?? 'Inscription impossible.';
      return;
    }

    this.enterVerification(this.email, result.verificationCode);
  }

  private handleVerify(): void {
    if (!this.verificationCode.trim()) {
      this.errorMessage = 'Entrez le code reçu par email.';
      return;
    }

    const result = this.authService.verifyEmail(this.pendingEmail, this.verificationCode);
    if (!result.success) {
      this.errorMessage = result.error ?? 'Vérification impossible.';
      return;
    }

    this.router.navigateByUrl('/');
  }

  private enterVerification(email: string, code?: string): void {
    this.pendingEmail = email.trim().toLowerCase();
    this.simulatedCode = code ?? this.authService.resendVerificationCode(this.pendingEmail);
    this.verificationCode = '';
    this.errorMessage = '';
    this.infoMessage = "Un code de vérification a été envoyé à l'adresse indiquée.";
    this.mode = 'verify';
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
}
