import { Component, inject, Input, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule],
  template: `
    <div class="product-container">
      <h2>Products {{ categoryId ? 'for Category ' + categoryId : '' }}</h2>

      @if (loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading products...</p>
        </div>
      }

      @if (error()) {
        <div class="error">
          <p>{{ error() }}</p>
          <button (click)="loadProducts()">Try Again</button>
        </div>
      }

      @if (!loading() && !error()) {
        <div class="mat-elevation-z8">
          <table mat-table [dataSource]="dataSource">
            <!-- Product Name Column -->
            <ng-container matColumnDef="ProductName">
              <th mat-header-cell *matHeaderCellDef class="name-column">Name</th>
              <td mat-cell *matCellDef="let product" class="name-column">{{ product.ProductName }}</td>
            </ng-container>

            <!-- Unit Price Column -->
            <ng-container matColumnDef="UnitPrice">
              <th mat-header-cell *matHeaderCellDef class="price-column">Price</th>
              <td mat-cell *matCellDef="let product" class="price-column">{{ product.UnitPrice | currency }}</td>
            </ng-container>

            <!-- Units In Stock Column -->
            <ng-container matColumnDef="UnitsInStock">
              <th mat-header-cell *matHeaderCellDef class="stock-column">Stock</th>
              <td mat-cell *matCellDef="let product" class="stock-column">{{ product.UnitsInStock }}</td>
            </ng-container>

            <!-- Quantity Per Unit Column -->
            <ng-container matColumnDef="QuantityPerUnit">
              <th mat-header-cell *matHeaderCellDef class="quantity-column">Quantity Per Unit</th>
              <td mat-cell *matCellDef="let product" class="quantity-column">{{ product.QuantityPerUnit }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        <mat-paginator class="mat-paginator"
          [pageSize]="5"
          [pageSizeOptions]="[5]"
          showFirstLastButtons>
        </mat-paginator>
        </div>
      }
    </div>
  `,
  styles: [`
    .product-container {
      height: 430px;
      padding: 16px;
      position: relative;
    }
    table {
      width: 100%;
      table-layout: fixed;
      background: transparent;
    }
    .mat-elevation-z8 {
      overflow: hidden;
      border-radius: 4px;
      background: white;
      box-shadow: none;
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
    tr.mat-row:hover {
      background: rgba(0, 0, 0, 0.02);
    }
    .name-column {
      width: 30%;
    }
    .price-column {
      width: 15%;
    }
    .stock-column {
      width: 15%;
    }
    .quantity-column {
      width: 40%;
    }
    td.mat-column-ProductName,
    td.mat-column-UnitPrice,
    td.mat-column-UnitsInStock,
    td.mat-column-QuantityPerUnit {
      padding: 12px 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mat-paginator {
      position: absolute;
      bottom: 0;
      right: 0;
    }

  `]
})
export class ProductComponent implements OnInit {
  @Input() categoryId?: number;

  productService = inject(ProductService);
  products = signal<Array<Product>>([]);
  loading = signal(false);
  error = signal('');

  displayedColumns: string[] = ['ProductName', 'UnitPrice', 'UnitsInStock', 'QuantityPerUnit'];
  dataSource: MatTableDataSource<Product>;

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator && this.dataSource) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor() {
    this.dataSource = new MatTableDataSource<Product>([]);
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set('');

    this.productService.getProducts().subscribe({
      next: (data: { value: Array<Product> }) => {
        // Filter products by category if categoryId is provided
        const filteredProducts = this.categoryId
          ? data.value.filter(p => p.CategoryID === this.categoryId)
          : data.value;

        this.products.set(filteredProducts);
        this.dataSource.data = filteredProducts;
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
