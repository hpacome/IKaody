import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import * as QRCode from 'qrcode';
import { TransferService, Transfer } from '../../services/transfer.service';

type SendStep = 'form' | 'qr';

@Component({
  selector: 'app-send',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './send.component.html',
  styleUrl: './send.component.css'
})
export class SendComponent implements AfterViewChecked {
  @ViewChild('qrCanvas') qrCanvas?: ElementRef<HTMLCanvasElement>;

  step: SendStep = 'form';
  amount: number | null = null;
  senderName = '';
  errorMessage = '';
  transfer: Transfer | null = null;

  actionFeedback = '';
  canShareFiles = false;

  private qrRendered = false;

  constructor(private transferService: TransferService, private router: Router) {
    this.canShareFiles = typeof navigator !== 'undefined' && !!(navigator as any).canShare;
  }

  ngAfterViewChecked(): void {
    if (this.step === 'qr' && this.qrCanvas && !this.qrRendered && this.transfer) {
      this.qrRendered = true;
      const payload = this.transferService.encode(this.transfer);
      QRCode.toCanvas(this.qrCanvas.nativeElement, payload, {
        width: 220,
        margin: 1,
        color: { dark: '#14162b', light: '#ffffff' }
      }).catch((err) => console.error(err));
    }
  }

  generateQr(): void {
    if (!this.amount || this.amount <= 0) {
      this.errorMessage = 'Entrez un montant valide.';
      return;
    }
    this.errorMessage = '';
    this.transfer = this.transferService.createTransfer(this.amount, this.senderName);
    this.qrRendered = false;
    this.step = 'qr';
  }

  reset(): void {
    this.step = 'form';
    this.amount = null;
    this.senderName = '';
    this.transfer = null;
    this.qrRendered = false;
    this.actionFeedback = '';
  }

  finishTransaction(): void {
    this.router.navigateByUrl('/');
  }

  async shareQr(): Promise<void> {
    this.actionFeedback = '';
    const blob = await this.canvasToBlob();
    if (!blob || !this.transfer) return;

    const file = new File([blob], `qr-virevolt-${this.transfer.id}.png`, { type: 'image/png' });
    const shareText = `IKaody — ${this.transferService.formatAmount(this.transfer.amount)} à recevoir. Scannez le QR joint pour recevoir la somme.`;

    try {
      if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
        await (navigator as any).share({ files: [file], title: 'Transfert IKaody', text: shareText });
      } else if (navigator.share) {
        await navigator.share({ title: 'Transfert IKaody', text: shareText });
      } else {
        this.actionFeedback = "Le partage direct n'est pas pris en charge par ce navigateur. Utilisez plutôt « Enregistrer l'image » puis joignez-la dans WhatsApp, Messenger ou par email.";
      }
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') {
        this.actionFeedback = 'Le partage a échoué. Vous pouvez enregistrer ou copier l’image à la place.';
      }
    }
  }

  async copyImage(): Promise<void> {
    this.actionFeedback = '';
    try {
      const blob = await this.canvasToBlob();
      if (!blob) return;
      await (navigator.clipboard as any).write([new (window as any).ClipboardItem({ 'image/png': blob })]);
      this.actionFeedback = 'Image copiée dans le presse-papiers.';
    } catch {
      this.actionFeedback = "La copie d'image n'est pas prise en charge par ce navigateur. Essayez « Enregistrer l'image » à la place.";
    }
  }

  downloadImage(): void {
    if (!this.qrCanvas || !this.transfer) return;
    const link = document.createElement('a');
    link.download = `qr-virevolt-${this.transfer.id}.png`;
    link.href = this.qrCanvas.nativeElement.toDataURL('image/png');
    link.click();
    this.actionFeedback = 'Image enregistrée.';
  }

  private canvasToBlob(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.qrCanvas) {
        resolve(null);
        return;
      }
      this.qrCanvas.nativeElement.toBlob((blob) => resolve(blob), 'image/png');
    });
  }
}
