import { Injectable } from '@angular/core';

export interface Transfer {
  type: 'virevolt-transfer';
  id: string;
  amount: number;
  sender: string;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class TransferService {
  /** Holds the transfer currently displayed as a QR code on this device. */
  current: Transfer | null = null;

  createTransfer(amount: number, sender: string): Transfer {
    const transfer: Transfer = {
      type: 'virevolt-transfer',
      id: this.generateId(),
      amount: Math.round(amount * 100) / 100,
      sender: sender.trim() || 'Un utilisateur IKaody',
      createdAt: Date.now()
    };
    this.current = transfer;
    return transfer;
  }

  encode(transfer: Transfer): string {
    return JSON.stringify(transfer);
  }

  /** Returns the decoded transfer, or null if the scanned text isn't a valid IKaody transfer. */
  decode(raw: string): Transfer | null {
    try {
      const data = JSON.parse(raw);
      if (
        data &&
        data.type === 'virevolt-transfer' &&
        typeof data.amount === 'number' &&
        data.amount > 0 &&
        typeof data.id === 'string'
      ) {
        return data as Transfer;
      }
      return null;
    } catch {
      return null;
    }
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  }

  private generateId(): string {
    return 'TX' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }
}
