import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Food {
  _id?: string;
  name: string;
  qty: number;
  expiry: string;
  category: string;
  storage: string;
  notes?: string;
  status?: 'inventory' | 'donation' | 'expired'; // ✅ 加入 expired
  owner?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BrowseFoodService {
  private apiUrl = 'http://localhost:5001/api/foods';  // 改成 /api/foods

  constructor(private http: HttpClient) {}

  getFoods(): Observable<Food[]> {
    return this.http.get<Food[]>(this.apiUrl);
  }

  /** 更新食物状态（Donate / Inventory） */
  updateFoodStatus(id: string, status: 'inventory' | 'donation' | 'expired'): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }


  /** 更新食物数量（Used / Meal） */
  updateFoodQty(id: string, newQty: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/qty`, { qty: newQty });
  }
}
