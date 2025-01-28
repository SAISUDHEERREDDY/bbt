import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class NetTopService {
  constructor(private http: HttpClient) {}
  data: any;

  updateNetDevice(data: any, responseFunc: any): any {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    const url = 'admin/update_net_device?';
    const netData = {
      iface: data.interface,
      ipaddr: data.ipaddr,
      mask: data.mask,
      gateway: data.gwaddr
    };
    console.log(
      'updateNetDevice, netData(iface):' +
        netData.iface +
        ', data(iface):' +
        data.interface +
        ', data(ipaddr):' +
        data.ipaddr
    );
    return this.http.post(url, netData, options).subscribe(responseFunc);
  }
}
