import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule],
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

      @if (!loading() && !error()) {
        <div class="mat-elevation-z8">
          <table mat-table [dataSource]="dataSource">
            <!-- Category Name Column -->
            <ng-container matColumnDef="CategoryName">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let category">{{ category.CategoryName }}</td>
            </ng-container>

            <!-- Description Column -->
            <ng-container matColumnDef="Description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let category">{{ category.Description }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator 
            [pageSize]="5"
            [pageSizeOptions]="[5]"
            showFirstLastButtons>
          </mat-paginator>
        </div>
      }
    </div>
  `,
  styles: [`
    .category-container {
      padding: 20px;
    }
    table {
      width: 100%;
    }
    .mat-elevation-z8 {
      overflow: hidden;
      border-radius: 4px;
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
  `]
})
export class CategoryComponent implements OnInit {
  categoryService = inject(CategoryService);
  categories = signal<Array<Category>>([]);
  loading = signal(false);
  error = signal('');

  displayedColumns: string[] = ['CategoryName', 'Description'];
  dataSource: MatTableDataSource<Category>;

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator && this.dataSource) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor() {
    this.dataSource = new MatTableDataSource<Category>([]);
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.error.set('');

    this.categoryService.getCategories().subscribe({
      next: (data: { value: Array<Category> }) => {
        this.categories.set(data.value);
        this.dataSource.data = data.value;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load categories. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
