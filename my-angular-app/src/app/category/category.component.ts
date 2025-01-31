import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="category-container">
      <h2>Categories</h2>

      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading categories...</p>
        </div>
      }

      @if (error()) {
        <div class="error">
          <p>{{ error() }}</p>
          <button (click)="loadCategories()">Try Again</button>
        </div>
      }

      @if (!loading() && !error() && categories().length === 0) {
        <div class="no-data">
          <p>No categories available</p>
        </div>
      }

      @if (!loading() && !error() && categories().length > 0) {
        <div class="category-list">
          @for (category of categories(); track category.CategoryID) {
            <div class="category-item">
              <h3>{{ category.CategoryName }}</h3>
              <p>{{ category.Description }}</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .category-container {
      padding: 20px;
    }
    .category-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .category-item {
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: #f8f9fa;
      transition: transform 0.2s;
    }
    .category-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .loading {
      text-align: center;
      padding: 2rem;
    }
    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error {
      text-align: center;
      color: #e74c3c;
      padding: 2rem;
    }
    .error button {
      padding: 0.5rem 1rem;
      margin-top: 1rem;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .no-data {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
  `]
})
export class CategoryComponent implements OnInit {
  categoryService = inject(CategoryService);
  categories = signal<Array<Category>>([]);
  loading = signal(false);
  error = signal('');

ngOnInit():void {
  this.loadCategories();
}

  loadCategories() {
    this.loading.set(true);;
    this.error.set('');;

    this.categoryService.getCategories().subscribe({
      next: (data:{value: Array<Category>} ) => {
        console.log('Categories data:', data.value.length);
        this.categories.set(data.value);
        console.log('Categories array:', this.categories);
        console.log('Categories length:', this.categories.length);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load categories. Please try again.');
        this.loading.set(false);;
      }
    });
  }
}
