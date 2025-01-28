import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) {}

  checkContentAdmin(pass: string | number): Observable<any> {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    const url = 'video_player/passkey_contentadmin?';
    const key = {
      key: pass.toString()
    };
    return this.http.post(url, key, options);
  }

  checkAdmin(pass: string | number): Observable<any> {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    const url = 'video_player/passkey_admin?';
    const key = {
      key: pass.toString()
    };
    return this.http.post(url, key, options);
  }

  checkEvent(key: string, id: number): Observable<any> {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    const url = 'video_player/passkey_event?';
    const params: {
      key: string;
      id: number;
    } = { key, id };
    return this.http.post(url, params, options);
  }
}
