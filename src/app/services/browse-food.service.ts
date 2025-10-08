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
}
