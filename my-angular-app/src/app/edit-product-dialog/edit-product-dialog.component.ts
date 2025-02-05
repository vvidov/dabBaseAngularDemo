import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-edit-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-product-dialog.component.html',
  styleUrls: ['./edit-product-dialog.component.css']
})
export class EditProductDialogComponent {
  isEditMode = false;
  productId?: number;
  categoryId: number = 0;  // Add this line

  productForm = new FormGroup({
    ProductName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    UnitPrice: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
    UnitsInStock: new FormControl(0, { nonNullable: true }),
    QuantityPerUnit: new FormControl('', { nonNullable: true }),
    Discontinued: new FormControl(false, { nonNullable: true })
  });

  constructor(
    private dialogRef: MatDialogRef<EditProductDialogComponent>,
    private productService: ProductService
  ) {}

  setEditMode(product: Product) {
    this.isEditMode = true;
    this.productId = product.ProductID;
    this.productForm.patchValue({
      ProductName: product.ProductName,
      UnitPrice: product.UnitPrice,
      UnitsInStock: product.UnitsInStock,
      QuantityPerUnit: product.QuantityPerUnit,
      Discontinued: product.Discontinued
    });
  }

  setCategoryId(id: number) {
    this.categoryId = id;
  }

  onSave() {
    if (this.productForm.valid) {
      const formValue = this.productForm.getRawValue();
      const product: Product = {
        ProductID: this.productId || 0,
        CategoryID: this.categoryId,  // Use stored categoryId
        ProductName: formValue.ProductName,
        UnitPrice: formValue.UnitPrice,
        UnitsInStock: formValue.UnitsInStock,
        QuantityPerUnit: formValue.QuantityPerUnit,
        Discontinued: formValue.Discontinued
      };

      const operation = this.isEditMode
        ? this.productService.updateProduct(product)
        : this.productService.addProduct(product);

      operation.subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error: Error) => {
          console.error('Error saving product:', error);
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
