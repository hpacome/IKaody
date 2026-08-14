import { Injectable } from '@angular/core';

export interface HistoryEntry {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  counterpart?: string;
  date: number;
  /** 'pending' = sent but not yet confirmed as cashed by the recipient. 'completed' = money has moved. */
  status: 'pending' | 'completed';
}

const STORAGE_KEY = 'ikaody-history';
const MAX_ENTRIES = 50;

@Injectable({ providedIn: 'root' })
export class HistoryService {
  addEntry(entry: HistoryEntry): void {
    const history = this.getHistory();
    history.unshift(entry);
    this.save(history.slice(0, MAX_ENTRIES));
  }

  getHistory(): HistoryEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    } catch {
      return [];
    }
  }

  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private save(history: HistoryEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      /* stockage indisponible (navigation privée, quota atteint...) — on ignore silencieusement */
    }
  }
}
