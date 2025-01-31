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
      padding: 1rem;
      text-align: center;
      border-bottom: 1px solid #e9ecef;
    }
    .home-header h1 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
    }
    .home-header p {
      margin: 0;
      font-size: 0.9rem;
      color: #6c757d;
    }
  `]
})
export class HomeHeaderComponent {}
