import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HistoryEntry, HistoryService } from '../../services/history.service';
import { AuthService } from '../../services/auth.service';

const RECENT_COUNT = 4;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private readonly startingBalance = 482.5;

  balance = this.startingBalance;
  recentHistory: HistoryEntry[] = [];
  totalHistoryCount = 0;
  session = this.authService.getSession();

  constructor(
    private historyService: HistoryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/connexion');
  }

  clearHistory(): void {
    this.historyService.clearHistory();
    this.loadHistory();
  }

  formatDate(timestamp: number): string {
    return this.historyService.formatDate(timestamp);
  }

  private loadHistory(): void {
    const fullHistory = this.historyService.getHistory();
    this.totalHistoryCount = fullHistory.length;
    this.recentHistory = fullHistory.slice(0, RECENT_COUNT);

    const net = fullHistory.reduce(
      (total, entry) => total + (entry.type === 'received' ? entry.amount : -entry.amount),
      0
    );
    this.balance = this.startingBalance + net;
  }
}
