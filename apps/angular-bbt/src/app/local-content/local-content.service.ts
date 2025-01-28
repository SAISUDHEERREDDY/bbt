import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Local } from '../content-model/local';

export interface SerializedLocalContentResponse {
  categories: [
    {
      name: string;
      menuItems: Local[];
    }
  ];
}

@Injectable({
  providedIn: 'root'
})
export class LocalContentService {
  constructor(private http: HttpClient) {}
  loading = false;

  list(): Observable<Local[]> {
    const baseUrl = 'video_player/vod?type=local';
    this.loading = true;
      debugger;
    return this.http.get(baseUrl).pipe(
      map((response: SerializedLocalContentResponse) => {
        this.loading = false;
debugger;
        return response.categories.filter(
          item => item.name === 'LocalContent'
        )[0]?.menuItems;
      })
    );
  }

  dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }

  dataURItoFile(dataURI, name) {
    const blob: Blob = this.dataURItoBlob(dataURI);
    return new File([blob], name);
  }

  updateContent(content: Local) {
    const baseUrl = '/video_player/set_local_info';
    return this.http.post(baseUrl, {
      id: content.itemId,
      titles: content.titles,
      descriptions: content.descriptions,
      file: content.filePath,
      thumb: content.customIcon
    });
  }

  reorderContent(content: Local) {
    const baseUrl = '/video_player/set_local_info';
    const data = { id: content.itemId, order: content.order };

    return this.http.post(baseUrl, data);
  }

  deleteContent(content: Local) {
    const baseUrl = '/video_player/local_delete';
    return this.http.post(baseUrl, {
      id: content.itemId
    });
  }

  uploadContent(file) {
    const baseUrl = '/vod_apis/uploadVideos';
    return this.upload(file, baseUrl);
  }

  uploadThumbnail(file) {
    const baseUrl = '/vod_apis/uploadThumbnails';
    const formData = new FormData();
    formData.append('myfile', file, file.name);
    return this.http.post(baseUrl, formData, {
      headers: { Accept: 'application/json' }
    });
  }

  upload(file, baseUrl) {
    const formData = new FormData();
    formData.append('myfile', file, file.name);
    return this.http.post(baseUrl, formData, {
      headers: { Accept: 'application/json' },
      reportProgress: true,
      observe: 'events'
    });
  }

  reorder(id, prev, next) {
    console.log('reorder :>> ', id, prev, next);
  }
}
