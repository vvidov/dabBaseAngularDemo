import { Component, inject, Input, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { EditProductDialogComponent } from '../edit-product-dialog/edit-product-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule],
  template: `
    <div class="product-container">
      <div class="header">
        <h2>Products {{ categoryName ? 'for Category ' + categoryName : '' }}</h2>
        <button mat-raised-button color="primary" (click)="openAddProductDialog()">Add Product</button>
      </div>

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

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let product">
                <div class="action-buttons">
                  <button mat-icon-button color="primary"
                          (click)="openEditProductDialog(product); $event.stopPropagation()">
                    <mat-icon>edit</mat-icon>
                  </button>
                </div>
              </td>
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
    :host {
      background-color: rgba(0, 0, 0, 0.04);
      display: block;
      padding: 16px;
      border-radius: 4px;
    }

    .mat-mdc-row {
      transition: background-color 0.3s ease;
    }

    .mat-mdc-row:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }

    .mat-elevation-z8 {
      background-color: transparent;
    }

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
    .mat-column-actions {
      width: 120px;
      padding: 0;
      vertical-align: middle;
    }
    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      align-items: center;
      padding: 0 8px;
      height: 100%;
    }
    .mat-icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .mat-mdc-row:nth-child(even) {
      background-color: rgba(0, 0, 0, 0.02);
    }

    .mat-mdc-row:nth-child(odd) {
      background-color: #ffffff;
    }

    .mat-mdc-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .mat-paginator {
      background-color: transparent;
    }

    :host ::ng-deep .mat-mdc-paginator {
      background-color: transparent;
    }

    .mat-mdc-header-row {
      background-color: rgba(0, 0, 0, 0.04);
    }

    th.mat-mdc-header-cell {
      color: rgba(0, 0, 0, 0.87);
      font-weight: 500;
    }
  `]
})
export class ProductComponent implements OnInit {
  @Input() categoryId?: number;
  @Input() categoryName?: string;

  products = signal<Array<Product>>([]);
  loading = signal(false);
  error = signal('');

  displayedColumns: string[] = ['ProductName', 'UnitPrice', 'UnitsInStock', 'QuantityPerUnit', 'actions'];
  dataSource: MatTableDataSource<Product>;

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator && this.dataSource) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor(
    private dialog: MatDialog,
    private productService: ProductService  // Keep only this declaration
  ) {
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

  openEditProductDialog(product: Product) {
    // Set CategoryID before opening dialog
    product.CategoryID = this.categoryId!;

    const dialogRef = this.dialog.open(EditProductDialogComponent);
    dialogRef.componentInstance.setEditMode(product);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  openAddProductDialog() {
    const dialogRef = this.dialog.open(EditProductDialogComponent);
    dialogRef.componentInstance.setCategoryId(this.categoryId!);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }
}
