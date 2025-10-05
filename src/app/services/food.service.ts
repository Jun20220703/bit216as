import { Injectable } from '@angular/core';
// MongoDB接続時は以下を使う
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
// 今はテスト用のローカル配列
  private foodItems: any[] = [
    { name: 'Milk', qty: 2, expiry: '14 Sep 2025', category: 'Dairy', storage: 'Fridge' }
  ];

// --- ローカル配列用 ---
  getFoods() {
    return this.foodItems;
  }

  addFood(item: any) {
    this.foodItems.push(item);
  }

  deleteFood(item: any) {
    this.foodItems = this.foodItems.filter(f => f !== item);
  }
  // --- MongoDB接続時に有効化する部分 ---
  /*
  private apiUrl = 'http://localhost:3000/api/foods';  // Express + MongoDB のエンドポイント

  constructor(private http: HttpClient) {}

  // MongoDBから一覧取得
  getFoods(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // MongoDBに新しいデータ追加
  addFood(food: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, food);
  }

  // MongoDBから削除
  deleteFood(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  */
}
