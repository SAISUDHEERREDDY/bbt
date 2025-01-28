import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Sysinfo } from './sysinfo';
import { SYSINFODATA } from './mock-sysinfo';

@Injectable({ providedIn: 'root' })
export class SysinfoService {
  sysinfoData: Sysinfo;
  //sysinfoData: Observable<Sysinfo>;
  constructor(private http: HttpClient) {}

  getSysinfo(): Observable<Sysinfo> {
    // const sysinfo = of(SYSINFODATA);
    // return sysinfo;
    // var sysinfo = {};
    // if sysinfo
    var href = window.location.href;
    var arr = href.split(/\//); // extract hostname
    return this.http.get<Sysinfo>('http://' + arr[2] + '/admin/sysinfo');
    // this.sysinfoData = this.http.get<Sysinfo>('http://' + arr[2] + '/admin/sysinfo');
    console.log('getSysinfo');
    // return this.sysinfoData;
  }

  getSysinfoCache(): Sysinfo {
    console.log('getSysinfoCache');
    return this.sysinfoData;
  }

  setSysinfoData(sysinfo: Sysinfo): void {
    console.log('setSysinfoData');
    this.sysinfoData = sysinfo;
  }
}
