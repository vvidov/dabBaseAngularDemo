import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';  // API endpoint for products
  http = inject(HttpClient);

  getProducts(): Observable<{ value: Array<Product> }> {
    return this.http.get<{ value: Array<Product> }>(this.apiUrl);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  addProduct(product: Omit<Product, 'ProductID'>): Observable<Product> {
    const payload = {
      ProductName: product.ProductName,
      UnitPrice: product.UnitPrice,
      UnitsInStock: product.UnitsInStock,
      QuantityPerUnit: product.QuantityPerUnit,
      CategoryID: product.CategoryID,
      Discontinued: product.Discontinued
    };
    return this.http.post<Product>(this.apiUrl, payload);
  }

  updateProduct(product: Product): Observable<Product> {
    const url = `${this.apiUrl}/ProductID/${product.ProductID}`;
    return this.http.patch<Product>(url, {
      ProductName: product.ProductName,
      UnitPrice: product.UnitPrice,
      UnitsInStock: product.UnitsInStock,
      QuantityPerUnit: product.QuantityPerUnit,
      Discontinued: product.Discontinued
    });
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ProductID/${productId}`);
  }
}
