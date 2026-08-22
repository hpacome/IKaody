import { TestBed } from '@angular/core/testing';

import { Transfer, TransferService } from './transfer.service';

describe('TransferService', () => {
  let service: TransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createTransfer', () => {
    it('creates a transfer with the given amount and sender', () => {
      const transfer = service.createTransfer(42.5, 'Alice');

      expect(transfer.type).toBe('virevolt-transfer');
      expect(transfer.amount).toBe(42.5);
      expect(transfer.sender).toBe('Alice');
      expect(transfer.id).toMatch(/^TX[A-Z0-9]{6}$/);
      expect(typeof transfer.createdAt).toBe('number');
    });

    it('rounds the amount to 2 decimal places', () => {
      const transfer = service.createTransfer(19.999, 'Bob');
      expect(transfer.amount).toBe(20);
    });

    it('trims the sender name', () => {
      const transfer = service.createTransfer(10, '  Alice  ');
      expect(transfer.sender).toBe('Alice');
    });

    it('falls back to a default sender when the name is empty or blank', () => {
      expect(service.createTransfer(10, '').sender).toBe('Un utilisateur IKaody');
      expect(service.createTransfer(10, '   ').sender).toBe('Un utilisateur IKaody');
    });

    it('generates a different id on each call', () => {
      const first = service.createTransfer(10, 'Alice');
      const second = service.createTransfer(10, 'Alice');
      expect(first.id).not.toBe(second.id);
    });

    it('stores the created transfer as current', () => {
      const transfer = service.createTransfer(10, 'Alice');
      expect(service.current).toBe(transfer);
    });
  });

  describe('encode', () => {
    it('serializes the transfer to JSON', () => {
      const transfer: Transfer = {
        type: 'virevolt-transfer',
        id: 'TXABC123',
        amount: 15,
        sender: 'Alice',
        createdAt: 1000
      };

      expect(service.encode(transfer)).toBe(JSON.stringify(transfer));
    });
  });

  describe('decode', () => {
    it('decodes a valid transfer payload', () => {
      const transfer = service.createTransfer(10, 'Alice');
      const raw = service.encode(transfer);

      expect(service.decode(raw)).toEqual(transfer);
    });

    it('returns null for malformed JSON', () => {
      expect(service.decode('not json')).toBeNull();
    });

    it('returns null when type is missing or wrong', () => {
      expect(service.decode(JSON.stringify({ id: 'X', amount: 10 }))).toBeNull();
      expect(service.decode(JSON.stringify({ type: 'other', id: 'X', amount: 10 }))).toBeNull();
    });

    it('returns null when amount is not a positive number', () => {
      expect(
        service.decode(JSON.stringify({ type: 'virevolt-transfer', id: 'X', amount: 0 }))
      ).toBeNull();
      expect(
        service.decode(JSON.stringify({ type: 'virevolt-transfer', id: 'X', amount: -5 }))
      ).toBeNull();
      expect(
        service.decode(JSON.stringify({ type: 'virevolt-transfer', id: 'X', amount: '10' }))
      ).toBeNull();
    });

    it('returns null when id is missing or not a string', () => {
      expect(
        service.decode(JSON.stringify({ type: 'virevolt-transfer', amount: 10 }))
      ).toBeNull();
      expect(
        service.decode(JSON.stringify({ type: 'virevolt-transfer', id: 42, amount: 10 }))
      ).toBeNull();
    });

    it('returns null for null-ish input', () => {
      expect(service.decode(JSON.stringify(null))).toBeNull();
    });
  });

  describe('formatAmount', () => {
    it('formats an amount as French EUR currency', () => {
      const formatted = service.formatAmount(1234.5);
      expect(formatted).toContain('€');
      expect(formatted).toContain('1');
      expect(formatted).toContain('234');
    });

    it('formats zero correctly', () => {
      expect(service.formatAmount(0)).toContain('€');
    });
  });
});
