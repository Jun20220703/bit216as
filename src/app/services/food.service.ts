import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Food {
  _id?: string;
  name: string;
  qty: number;          // ← backend と合わせる
  expiry: string;       // ← 追加
  category: string;
  storage: string;
  notes?: string;       // ← optional
}

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private apiUrl = 'http://localhost:5001/api/foods';

  constructor(private http: HttpClient) {}

  getFoods(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addFood(food: any): Observable<any> {
    console.log('Sending to backend:', food);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.apiUrl, food);
  }

  deleteFood(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
