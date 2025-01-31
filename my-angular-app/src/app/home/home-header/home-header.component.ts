import { Component } from '@angular/core';

@Component({
  selector: 'app-home-header',
  standalone: true,
  template: `
    <header class="home-header">
      <h1>Welcome to Our App</h1>
      <p>Discover amazing features and possibilities</p>
    </header>
  `,
  styles: [`
    .home-header {
      background-color: #f8f9fa;
      padding: 2rem;
      text-align: center;
      border-bottom: 1px solid #e9ecef;
    }
  `]
})
export class HomeHeaderComponent {}
