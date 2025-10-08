import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Food {
  _id?: string;
  name: string;
  qty: string;
  expiry: string;
  category: string;
  storage: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private apiUrl = 'http://localhost:5000/api/foods'; // ✅ 对应 backend

  constructor(private http: HttpClient) {}

  // 拿到所有 Food 数据
  getFoods(): Observable<Food[]> {
    return this.http.get<Food[]>(this.apiUrl);
  }

  // 新增 Food
  addFood(food: Food): Observable<Food> {
    console.log('📤 Sending to backend:', food);
    return this.http.post<Food>(this.apiUrl, food);
  }

  // 删除 Food
  deleteFood(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // （可选）更新 Food
  updateFood(id: string, food: Partial<Food>): Observable<Food> {
    return this.http.put<Food>(`${this.apiUrl}/${id}`, food);
  }
}
