import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../services/category.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-edit-category-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './edit-category-dialog.component.html',
  styleUrls: ['./edit-category-dialog.component.css']
})

export class EditCategoryDialogComponent {
  categoryForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditCategoryDialogComponent>,
    private categoryService: CategoryService
  ) {
    this.categoryForm = this.fb.group({
      CategoryName: ['', Validators.required],
      Description: ['', Validators.required]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      const category: Category = {
        CategoryID: formValue.CategoryID!, // Add ! to assert non-null
        CategoryName: formValue.CategoryName!,
        Description: formValue.Description!
      };

      const operation = this.isEditMode
        ? this.categoryService.updateCategory(category)
        : this.categoryService.addCategory(category);

      operation.subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error saving category:', error);
        }
      });
    }
  }

  setEditMode(category: Category): void {
    this.isEditMode = true;
    this.categoryForm = this.fb.group({
      CategoryID: [category.CategoryID],  // Add CategoryID to form
      CategoryName: [category.CategoryName, Validators.required],
      Description: [category.Description, Validators.required]
    });
  }
}
