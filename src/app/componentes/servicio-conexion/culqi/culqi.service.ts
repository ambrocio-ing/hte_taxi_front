import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CulqiService {

  constructor(private http:HttpClient) { }

  getTokenCulqi(clculqi:any):Observable<any>{
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer pk_test_1c14cb711272721b')
      .set(InterceptorSkipHeader, '');
    return this.http.post('https://secure.culqi.com/v2/tokens',clculqi,{headers:httpHeaders})
  }

  getChargeCulqi(clculqi:any):Observable<any>{
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer sk_test_5bb79532376651a3')
      .set(InterceptorSkipHeader, '');
    return this.http.post('https://api.culqi.com/v2/charges',clculqi,{headers:httpHeaders})
  }
}

export const InterceptorSkipHeader = 'X-Skip-Interceptor';

