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
  template: `
    <h1 mat-dialog-title>{{ isEditMode ? 'Edit Category' : 'Add Category' }}</h1>
    <div mat-dialog-content>
      <form [formGroup]="categoryForm">
        <mat-form-field>
          <mat-label>Category Name</mat-label>
          <input matInput formControlName="CategoryName">
        </mat-form-field>
        <mat-form-field>
          <mat-label>Description</mat-label>
          <input matInput formControlName="Description">
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button (click)="onSave()" [disabled]="categoryForm.invalid">{{ isEditMode ? 'Save' : 'Add' }}</button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 520px; /* Adjust the width as needed */
      height: 400px; /* Adjust the height as needed */
      margin: 0 16px; /* Add left and right margins */
    }
    mat-form-field {
      width: 100%;
    }
    mat-dialog-content {
      height: calc(100% - 64px); /* Adjust the height to fit within the dialog */
      overflow-y: hidden; /* Disable vertical scrolling */
    }
    mat-dialog-actions {
      display: flex;
      justify-content: flex-end;
      padding: 8px 24px; /* Adjust padding as needed */
    }
    h1 {
      font-size: 1.5rem; /* Adjust the font size as needed */
      margin: 0; /* Remove default margin */
      padding: 24px 24px 0; /* Adjust padding as needed */
    }
    button {
      margin-left: 8px; /* Add some space between buttons */
    }
  `]
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
      if (this.isEditMode) {
        // Update category logic here
      } else {
        this.categoryService.addCategory(this.categoryForm.value).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  setEditMode(category: Category): void {
    this.isEditMode = true;
    this.categoryForm.patchValue(category);
  }
}
