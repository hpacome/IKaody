import { Injectable } from '@angular/core';

export interface AuthUser {
  name: string;
  email: string;
}

interface StoredAccount extends AuthUser {
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

const USERS_KEY = 'ikaody-users';
const SESSION_KEY = 'ikaody-session';

/**
 * Prototype-only: accounts and sessions are simulated entirely in localStorage,
 * including plaintext passwords. There is no backend — see README for what a
 * real financial app would need instead (hashed credentials, server auth, etc.).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  register(name: string, email: string, password: string): AuthResult {
    const normalizedEmail = email.trim().toLowerCase();
    const users = this.getUsers();

    if (users.some((user) => user.email === normalizedEmail)) {
      return { success: false, error: 'Un compte existe déjà avec cet email.' };
    }

    const account: StoredAccount = { name: name.trim(), email: normalizedEmail, password };
    users.push(account);
    this.saveUsers(users);
    this.setSession({ name: account.name, email: account.email });
    return { success: true };
  }

  login(email: string, password: string): AuthResult {
    const normalizedEmail = email.trim().toLowerCase();
    const account = this.getUsers().find((user) => user.email === normalizedEmail);

    if (!account || account.password !== password) {
      return { success: false, error: 'Email ou mot de passe incorrect.' };
    }

    this.setSession({ name: account.name, email: account.email });
    return { success: true };
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
