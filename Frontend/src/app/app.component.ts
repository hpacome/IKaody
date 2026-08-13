import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-shell">
      <div class="phone">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AppComponent {}
