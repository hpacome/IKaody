import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
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
  isReadingFile = false;
  cameraVisible = true;

  private scanner: Html5Qrcode | null = null;

  constructor(private transferService: TransferService) {}

  ngOnInit(): void {
    this.startScanner();
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }

  private startScanner(): void {
    this.cameraVisible = true;
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

  /** True only when the underlying scanner can actually accept a stop() call. */
  private isScannerActive(): boolean {
    if (!this.scanner) {
      return false;
    }
    try {
      const state = this.scanner.getState();
      return state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED;
    } catch {
      return false;
    }
  }

  private async stopScannerAsync(): Promise<void> {
    if (this.isScannerActive()) {
      try {
        await this.scanner!.stop();
      } catch {
        /* the scanner was already stopping/stopped — nothing to do */
      }
    }
    this.scanner = null;
  }

  /** Fire-and-forget variant for places (like ngOnDestroy) that can't be async. */
  private stopScanner(): void {
    this.stopScannerAsync().catch(() => undefined);
  }

  /** Triggered when the user picks an image file containing a QR code. */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) {
      return;
    }

    this.errorMessage = '';
    this.isReadingFile = true;
    this.cameraVisible = false;

    await this.stopScannerAsync();
    this.scanner = new Html5Qrcode(READER_ID);

    try {
      const decodedText = await this.scanner.scanFile(file, false);
      this.handleScan(decodedText);
    } catch {
      this.errorMessage = "Aucun QR code lisible n'a été trouvé dans cette image.";
      // La caméra reste masquée : on ne relance pas le scan automatiquement ici.
    } finally {
      this.isReadingFile = false;
      input.value = '';
    }
  }

  /** Lets the user go back to live camera scanning after using file import. */
  useCameraInstead(): void {
    this.errorMessage = '';
    this.startScanner();
  }

  private handleScan(rawText: string): void {
    const transfer = this.transferService.decode(rawText);
    if (!transfer) {
      this.errorMessage = "Ce QR code n'est pas une transaction IKaody valide.";
      if (this.cameraVisible) {
        this.startScanner();
      }
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
