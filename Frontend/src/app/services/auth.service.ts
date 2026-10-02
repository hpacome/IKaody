import { Injectable } from '@angular/core';

export interface AuthUser {
  name: string;
  email: string;
}

interface StoredAccount extends AuthUser {
  password: string;
  verified: boolean;
  verificationCode: string | null;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  requiresVerification?: boolean;
  /** Prototype only: the "sent" code, returned so the UI can display it directly (see class doc). */
  verificationCode?: string;
}

const USERS_KEY = 'ikaody-users';
const SESSION_KEY = 'ikaody-session';

/**
 * Prototype-only: accounts and sessions are simulated entirely in localStorage,
 * including plaintext passwords and email verification codes returned straight to
 * the caller instead of being sent by a real email server. See README for what a
 * real financial app would need instead (hashed credentials, server auth, actual
 * email delivery, etc.).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  register(name: string, email: string, password: string): AuthResult {
    const normalizedEmail = email.trim().toLowerCase();
    const users = this.getUsers();

    if (users.some((user) => user.email === normalizedEmail)) {
      return { success: false, error: 'Un compte existe déjà avec cet email.' };
    }

    const account: StoredAccount = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      verified: false,
      verificationCode: this.generateCode()
    };
    users.push(account);
    this.saveUsers(users);
    return { success: true, requiresVerification: true, verificationCode: account.verificationCode! };
  }

  login(email: string, password: string): AuthResult {
    const normalizedEmail = email.trim().toLowerCase();
    const account = this.getUsers().find((user) => user.email === normalizedEmail);

    if (!account || account.password !== password) {
      return { success: false, error: 'Email ou mot de passe incorrect.' };
    }

    if (!account.verified) {
      return {
        success: false,
        error: "Ce compte n'est pas encore vérifié.",
        requiresVerification: true
      };
    }

    this.setSession({ name: account.name, email: account.email });
    return { success: true };
  }

  verifyEmail(email: string, code: string): AuthResult {
    const normalizedEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const account = users.find((user) => user.email === normalizedEmail);

    if (!account) {
      return { success: false, error: 'Aucun compte associé à cet email.' };
    }

    if (!account.verified) {
      if (!account.verificationCode || account.verificationCode !== code.trim()) {
        return { success: false, error: 'Code de vérification incorrect.' };
      }
      account.verified = true;
      account.verificationCode = null;
      this.saveUsers(users);
    }

    this.setSession({ name: account.name, email: account.email });
    return { success: true };
  }

  /** Regenerates the code for an unverified account and returns it (no real email is sent — see class doc). */
  resendVerificationCode(email: string): string | null {
    const normalizedEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const account = users.find((user) => user.email === normalizedEmail);

    if (!account || account.verified) {
      return null;
    }

    account.verificationCode = this.generateCode();
    this.saveUsers(users);
    return account.verificationCode;
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  getSession(): AuthUser | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getUsers(): StoredAccount[] {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: StoredAccount[]): void {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch {
      /* stockage indisponible (navigation privée, quota atteint...) — on ignore silencieusement */
    }
  }

  private setSession(user: AuthUser): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch {
      /* stockage indisponible — on ignore silencieusement */
    }
  }
}
