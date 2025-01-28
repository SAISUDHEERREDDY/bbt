import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Language } from './language.interface';
import { LangInput } from './lang-input.interface';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  constructor(private http: HttpClient) {}

  getLanguages() {
    return this.http.get<Language[]>('/lms/language/locale/');
  }
}
