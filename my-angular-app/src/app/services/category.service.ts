import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:8080/api/categories';  // API endpoint for categories
  http = inject(HttpClient);

  getCategories(): Observable<{ value: Array<Category> }> {
    return this.http.get<{ value: Array<Category> }>(this.apiUrl);
  }

  addCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }
}
