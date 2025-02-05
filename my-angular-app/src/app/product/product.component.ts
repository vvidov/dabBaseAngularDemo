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
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    ConfirmDialogComponent
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
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
      paginator.page.subscribe(event => {
        const categoryPage = this.route.snapshot.params['page'];
        const categoryId = this.route.snapshot.params['id'];
        const productPage = event.pageIndex + 1;

        this.router.navigate([
          '/home/categoryPage',
          categoryPage,
          'category',
          categoryId,
          'productPage',
          productPage
        ]);
      });
    }
  }

  constructor(
    private dialog: MatDialog,
    private productService: ProductService,  // Keep only this declaration
    private route: ActivatedRoute,
    private router: Router
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

  deleteProduct(product: Product) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { title: 'Delete Product', message: 'Are you sure you want to delete this product?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.deleteProduct(product.ProductID).subscribe({
          next: () => {
            this.loadProducts();
          },
          error: () => {
            this.error.set('Failed to delete product');
          }
        });
      }
    });
  }
}
