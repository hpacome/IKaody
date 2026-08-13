import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Html5Qrcode } from 'html5-qrcode';
import { TransferService, Transfer } from '../../services/transfer.service';

type ReceiveStep = 'scan' | 'success';

const READER_ID = 'qr-reader';

@Component({
  selector: 'app-receive',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './receive.component.html',
  styleUrl: './receive.component.css'
})
export class ReceiveComponent implements OnInit, OnDestroy {
  step: ReceiveStep = 'scan';
  errorMessage = '';
  receivedTransfer: Transfer | null = null;

  private scanner: Html5Qrcode | null = null;

  constructor(private transferService: TransferService) {}

  ngOnInit(): void {
    this.startScanner();
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  private startScanner(): void {
    this.scanner = new Html5Qrcode(READER_ID);
    this.scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => this.handleScan(decodedText),
        () => {
          /* ignore per-frame decode misses */
        }
      )
      .catch(() => {
        this.errorMessage = "Impossible d'accéder à la caméra. Vérifiez les autorisations.";
      });
  }

  private stopScanner(): void {
    if (this.scanner) {
      this.scanner.stop().catch(() => undefined);
      this.scanner = null;
    }
  }

  private handleScan(rawText: string): void {
    const transfer = this.transferService.decode(rawText);
    if (!transfer) {
      this.errorMessage = "Ce QR code n'est pas une transaction IKaody valide.";
      return;
    }
    this.errorMessage = '';
    this.receivedTransfer = transfer;
    this.step = 'success';
    this.stopScanner();
  }

  scanAnother(): void {
    this.step = 'scan';
    this.receivedTransfer = null;
    this.errorMessage = '';
    this.startScanner();
  }
}
