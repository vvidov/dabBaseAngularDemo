import { Component, inject, OnInit, signal, ViewChild, AfterViewInit } from '@angular/core';
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
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    ProductComponent,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
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
export class CategoryComponent implements OnInit, AfterViewInit {
  readonly DEFAULT_PAGE_SIZE = 5;
  readonly PAGE_SIZE_OPTIONS = [5];

  categories = signal<Array<Category>>([]);
  loading = signal(false);
  error = signal('');
  selectedCategoryId = signal<number | undefined>(undefined);
  categoryProductCount = signal<Record<number, number>>({});

  displayedColumns: string[] = ['CategoryName', 'Description', 'actions'];
  dataSource: MatTableDataSource<Category>;

  private initialPage: number | undefined;

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator && this.dataSource) {
      this.dataSource.paginator = paginator;
      // Set initial page if it exists
      if (this.initialPage !== undefined) {
        paginator.pageIndex = Math.max(0, this.initialPage - 1);
      }
      paginator.page.subscribe(event => {
        // Clear selected category when page changes
        this.selectedCategoryId.set(undefined);
        // Convert 0-based index to 1-based page for URL
        const pageNumber = event.pageIndex + 1;
        this.router.navigate(['/home/categoryPage', pageNumber]);
      });
    }
  }

  constructor(
    private dialog: MatDialog,
    private categoryService: CategoryService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dataSource = new MatTableDataSource<Category>([]);
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const pageParam = params['page'];
      const categoryId = params['id'];

      if (pageParam) {
        this.initialPage = +pageParam;
      }

      if (categoryId) {
        this.selectedCategoryId.set(+categoryId);
      }
    });

    this.loadCategories();
    this.loadProductCounts();
  }

  ngAfterViewInit(): void {
    // Set initial page after view (and paginator) is initialized
    if (this.initialPage !== undefined && this.paginator) {
      this.paginator.pageIndex = Math.max(0, this.initialPage - 1);
    }
  }

  selectCategory(category: Category) {
    // Use initialPage if paginator is not yet available
    const currentPage = this.initialPage ||
      (this.paginator?.pageIndex !== undefined ? this.paginator.pageIndex + 1 : 1);

    if (this.selectedCategoryId() === category.CategoryID) {
      this.selectedCategoryId.set(undefined);
      this.router.navigate(['/home/categoryPage', currentPage]);
    } else {
      this.selectedCategoryId.set(category.CategoryID);
      this.router.navigate(['/home/categoryPage', currentPage, 'category', category.CategoryID]);
    }
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
