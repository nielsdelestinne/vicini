import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cell } from '../models/cell.model';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  private apiUrl = `${environment.apiUrl}/grid`;

  constructor(private http: HttpClient) { }

  getGridState(roomId: string): Observable<Cell[]> {
    return this.http.get<Cell[]>(`${this.apiUrl}/${roomId}`);
  }

  claimCell(roomId: string, x: number, y: number, username: string): Observable<Cell> {
    return this.http.post<Cell>(`${this.apiUrl}/${roomId}/claim`, { x, y, username });
  }

  releaseCell(roomId: string, x: number, y: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${roomId}/release`, { x, y });
  }
}
