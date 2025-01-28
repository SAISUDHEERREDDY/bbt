import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Upload, upload } from './upload';

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(private http: HttpClient) {}

  uploadThumbnail(file: File) {
    return this.upload(file, '/vod_apis/uploadThumbnails');
  }

  upload(file: File, baseUrl: string): Observable<Upload> {
    const data = new FormData();
    data.append('file', file);
    return this.http
      .post(baseUrl, data, {
        reportProgress: true,
        observe: 'events'
      })
      .pipe(upload());
  }
}
