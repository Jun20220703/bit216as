import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private apiUrl = 'http://localhost:5000/api/foods';

  constructor(private http: HttpClient) {}

  getFoods(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addFood(food: any): Observable<any> {
    console.log('Sending to backend:', food);
    return this.http.post<any>(this.apiUrl, food);
  }

  deleteFood(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
