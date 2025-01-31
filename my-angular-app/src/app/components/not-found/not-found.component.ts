  import { Component } from '@angular/core';
  import { RouterModule } from '@angular/router';

  @Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [RouterModule],
    template: `
      <div class="not-found-container">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <a routerLink="/">Return to Home</a>
      </div>
    `,
    styles: [`
      .not-found-container {
        text-align: center;
        padding: 50px;
      }
      h1 {
        color: #e74c3c;
        font-size: 48px;
      }
      a {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 20px;
        background-color: #3498db;
        color: white;
        text-decoration: none;
        border-radius: 4px;
      }
      a:hover {
        background-color: #2980b9;
      }
    `]
  })
  export class NotFoundComponent {}
