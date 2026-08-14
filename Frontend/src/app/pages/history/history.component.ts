import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HistoryEntry, HistoryService } from '../../services/history.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  history: HistoryEntry[] = [];

  constructor(private historyService: HistoryService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  clearHistory(): void {
    this.historyService.clearHistory();
    this.loadHistory();
  }

  formatDate(timestamp: number): string {
    return this.historyService.formatDate(timestamp);
  }

  private loadHistory(): void {
    this.history = this.historyService.getHistory();
  }
}
