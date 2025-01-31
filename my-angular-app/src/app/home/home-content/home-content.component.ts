import { Component } from '@angular/core';
import { CategoryComponent } from '../../category/category.component';

@Component({
  selector: 'app-home-content',
  standalone: true,
  imports: [CategoryComponent],
  template: `
    <section class="home-content">
      <app-category></app-category>
    </section>
  `,
  styles: [`
    .home-content {
      padding: 2rem;
    }
  `]
})
export class HomeContentComponent {}
