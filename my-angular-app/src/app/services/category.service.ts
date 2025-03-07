import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:8080/api/categories';
  http = inject(HttpClient);
  private categoryAdded = new Subject<Category>();
  categoryAdded$ = this.categoryAdded.asObservable();

  getCategories(): Observable<{ value: Array<Category> }> {
    return this.http.get<{ value: Array<Category> }>(`${this.apiUrl}?$select=CategoryID,CategoryName,Description`);
  }

  addCategory(category: Omit<Category, 'CategoryID'>): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category).pipe(
      tap(newCategory => this.categoryAdded.next(newCategory))
    );
  }

  updateCategory(category: Category): Observable<Category> {
    const url = `${this.apiUrl}/CategoryID/${category.CategoryID}`;
    return this.http.patch<Category>(url, {
      CategoryName: category.CategoryName,
      Description: category.Description,
      Picture: null
    });
  }

  deleteCategory(categoryId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/CategoryID/${categoryId}`);
  }
}
