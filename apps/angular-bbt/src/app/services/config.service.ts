import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) {}

  // Load the configuration file
  loadConfig(): Promise<void> {
    return this.http.get('assets/VodSettings.ini')
      .toPromise()
      .then((data) => {
        this.config = data;
      })
      .catch((error) => {
        console.error('Error loading configuration:', error);
      });
  }

  // Get a specific configuration value
  getConfigValue(key: string): any {
    return this.config ? this.config[key] : null;
  }
}