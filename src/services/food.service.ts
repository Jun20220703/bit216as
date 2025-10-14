import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private apiUrl = 'http://localhost:5001/api/foods'; // Node.js サーバーのURL

  constructor(private http: HttpClient) {}

  getFoods(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addFood(food: any): Observable<any> {
    return this.http.post(this.apiUrl, food);
  }

  deleteFood(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
   // 追加：ID で食品を取得
  getFoodById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  // 追加：食品を更新
  updateFood(id: string, food: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, food);
  }
}
