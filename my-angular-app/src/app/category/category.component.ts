import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../services/category.service';
import { Category } from '../models/category.model';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ProductComponent } from '../product/product.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditCategoryDialogComponent} from '../edit-category-dialog/edit-category-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, ProductComponent, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="category-container">
      <div class="header">
        <h2>Categories</h2>
        <button mat-raised-button color="primary" (click)="openAddCategoryDialog()">Add Category</button>
        @if (!loading() && !error()) {
          <mat-paginator
            [pageSize]="5"
            [pageSizeOptions]="[5]"
            showFirstLastButtons>
          </mat-paginator>
        }
      </div>

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
          <table mat-table [dataSource]="dataSource" multiTemplateDataRows>
            <!-- Category Name Column -->
            <ng-container matColumnDef="CategoryName">
              <th mat-header-cell *matHeaderCellDef class="name-column">Name</th>
              <td mat-cell *matCellDef="let category" class="name-column">{{ category.CategoryName }}</td>
            </ng-container>

            <!-- Description Column -->
            <ng-container matColumnDef="Description">
              <th mat-header-cell *matHeaderCellDef class="description-column">Description</th>
              <td mat-cell *matCellDef="let category" class="description-column">{{ category.Description }}</td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let category">
                <div class="action-buttons">
                  @if (!hasProducts(category.CategoryID)) {
                    <button mat-icon-button color="warn"
                            (click)="deleteCategory(category); $event.stopPropagation()">
                      <mat-icon>delete</mat-icon>
                    </button>
                  }
                  <button mat-icon-button color="primary"
                          (click)="openEditCategoryDialog(category); $event.stopPropagation()">
                    <mat-icon>edit</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <!-- Expanded Content Column -->
            <ng-container matColumnDef="expandedDetail">
              <td mat-cell *matCellDef="let category" [attr.colspan]="displayedColumns.length">
                @if (category.CategoryID === selectedCategoryId()) {
                  <div class="category-detail"
                       [@detailExpand]>
                    <app-product [categoryId]="category.CategoryID" [categoryName]="category.CategoryName"></app-product>
                  </div>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let category; columns: displayedColumns;"
                class="category-row"
                [class.expanded-row]="category.CategoryID === selectedCategoryId()"
                (click)="selectCategory(category)">
            </tr>
            <tr mat-row *matRowDef="let category; columns: ['expandedDetail']"
                class="detail-row"
                [class.hidden]="category.CategoryID !== selectedCategoryId()">
            </tr>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .category-container {
      padding: 20px;
      height: calc(100vh - 100px);
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex: 0 0 auto;
    }
    .header h2 {
      margin: 0;
    }
    ::ng-deep .header .mat-mdc-paginator {
      background: transparent;
      min-height: 48px;
      height: 48px;
      display: flex;
      align-items: center;
    }
    ::ng-deep .header .mat-mdc-paginator-container {
      min-height: 48px;
      height: 48px;
      padding: 0;
      justify-content: flex-end;
    }
    h2 {
      margin-top: 0;
      margin-bottom: 20px;
      flex: 0 0 auto;
    }
    .mat-elevation-z8 {
      overflow: auto;
      border-radius: 4px;
      flex: 1;
      min-height: 0;
    }
    table {
      width: 100%;
      table-layout: fixed;
    }
    .mat-mdc-table {
      border-spacing: 0;
      background: transparent;
    }
    .mat-mdc-row {
      height: 48px;
    }
    .mat-mdc-header-row {
      height: 48px;
      position: sticky;
      top: 0;
      z-index: 1;
      background: white;
    }
    td.mat-column-CategoryName,
    td.mat-column-Description {
      padding: 0 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 48px;
      line-height: 48px;
    }
    td.mat-column-actions {
      width: 100px;
      padding-right: 8px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    th.mat-header-cell {
      padding: 0 16px;
      height: 48px;
      line-height: 48px;
    }
    tr.category-row {
      cursor: pointer;
      height: 48px;
      width: 100%;
    }
    tr.category-row:hover {
      background: rgba(0, 0, 0, 0.04);
    }
    tr.category-row.expanded-row {
      background: rgba(0, 0, 0, 0.04);
      border-left: 4px solid #3498db;
    }
    tr.detail-row {
      height: 0;
    }
    tr.detail-row.hidden {
      display: none;
    }
    .mat-elevation-z8 {
      overflow: hidden;
      border-radius: 4px;
    }
    ::ng-deep .mat-mdc-paginator {
      min-height: 56px;
      height: 56px;
      overflow: hidden;
    }
    ::ng-deep .mat-mdc-paginator-container {
      min-height: 56px;
      height: 56px;
      padding: 0 8px;
      justify-content: flex-end;
    }
    ::ng-deep .mat-mdc-paginator-range-label {
      margin: 0 16px;
    }
    ::ng-deep .mat-mdc-paginator-navigation-container {
      display: flex;
      align-items: center;
    }
    ::ng-deep .mat-mdc-icon-button {
      position: relative;
      overflow: hidden;
    }
    ::ng-deep .mat-mdc-icon-button .mat-mdc-button-ripple {
      overflow: hidden;
    }
    ::ng-deep .mat-mdc-paginator-navigation-previous,
    ::ng-deep .mat-mdc-paginator-navigation-next {
      margin: 0 4px;
      overflow: hidden;
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
    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      align-items: center;
      padding: 0 8px;
      height: 100%;
    }
    td.mat-column-CategoryName {
      width: 200px;
      padding: 0 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    td.mat-column-Description {
      padding: 0 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    td.mat-column-actions {
      width: 120px;
      padding: 0;
      vertical-align: middle;
    }

    table {
      width: 100%;
      table-layout: fixed;
    }

    .mat-mdc-cell {
      word-wrap: break-word;
      white-space: normal;
    }

    .mat-mdc-table {
      width: 100%;
      table-layout: fixed;
    }

    .mat-column-CategoryName {
      width: 200px;
    }

    .mat-column-Description {
      width: auto;
    }

    .mat-column-actions {
      width: 120px;
    }

    .mat-icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `],
  animations: [
    trigger('detailExpand', [
      state('void', style({
        height: '0',
        opacity: '0',
        transform: 'translateY(-10px)',
        padding: '0 16px'
      })),
      state('expanded', style({
        height: '*',
        opacity: '1',
        transform: 'translateY(0)',
        padding: '16px'
      })),
      transition('void => expanded', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({
          height: '*',
          opacity: '1',
          transform: 'translateY(0)',
          padding: '16px'
        }))
      ]),
      transition('expanded => void', [
        animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({
          height: '0',
          opacity: '0',
          transform: 'translateY(-10px)',
          padding: '0 16px'
        }))
      ])
    ])
  ],
})
export class CategoryComponent implements OnInit {
  categories = signal<Array<Category>>([]);
  loading = signal(false);
  error = signal('');
  selectedCategoryId = signal<number | undefined>(undefined);
  categoryProductCount = signal<Record<number, number>>({});

  displayedColumns: string[] = ['CategoryName', 'Description', 'actions'];
  dataSource: MatTableDataSource<Category>;

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator && this.dataSource) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor(
    private dialog: MatDialog,
    private categoryService: CategoryService,
    private productService: ProductService
  ) {
    this.dataSource = new MatTableDataSource<Category>([]);
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProductCounts();

    // Subscribe to product changes
    this.productService.productChanges$.subscribe(() => {
      this.loadProductCounts();
    });
  }

  selectCategory(category: Category) {
    this.selectedCategoryId.set(
      this.selectedCategoryId() === category.CategoryID ? undefined : category.CategoryID
    );
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

  loadProductCounts(): void {
    this.productService.getProducts().subscribe({
      next: (data: { value: Array<any> }) => {
        const counts: Record<number, number> = {};
        data.value.forEach(product => {
          if (product.CategoryID) {
            counts[product.CategoryID] = (counts[product.CategoryID] || 0) + 1;
          }
        });
        this.categoryProductCount.set(counts);
      }
    });
  }

  openAddCategoryDialog() {
    const dialogRef = this.dialog.open(EditCategoryDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  openEditCategoryDialog(category: Category) {
    const dialogRef = this.dialog.open(EditCategoryDialogComponent);
    dialogRef.componentInstance.setEditMode(category);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  hasProducts(categoryId: number): boolean {
    return (this.categoryProductCount()[categoryId] || 0) > 0;
  }

  deleteCategory(category: Category) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Delete Category',
        message: `Are you sure you want to delete category "${category.CategoryName}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoryService.deleteCategory(category.CategoryID).subscribe({
          next: () => {
            this.loadCategories();
          },
          error: () => {
            this.error.set('Failed to delete category');
          }
        });
      }
    });
  }
}
