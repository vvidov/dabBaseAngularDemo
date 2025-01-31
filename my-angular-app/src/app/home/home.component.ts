import { Component } from '@angular/core';
import { HomeHeaderComponent } from './home-header/home-header.component';
import { HomeContentComponent } from './home-content/home-content.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HomeHeaderComponent, HomeContentComponent],
  template: `
    <div class="home-container">
      <app-home-header></app-home-header>
      <app-home-content></app-home-content>
    </div>
  `,
  styles: [`
    .home-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class HomeComponent {

}
