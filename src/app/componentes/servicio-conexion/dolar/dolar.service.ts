import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { URL_BACKEND } from '../../sistema/config/config';

@Injectable({
  providedIn: 'root'
})
export class DolarService {

  private url:string = URL_BACKEND+"/dolar";  

  constructor(private http:HttpClient) { }  

  public crearDolar(dolar:any) : Observable<any> {
    return this.http.post(this.url+"/pacrear", dolar).pipe(
      catchError(e => {       

        return throwError(() => e);
      })
    );
  }

  public obtenerDolar() : Observable<any> {
    return this.http.get(this.url+"/obtener").pipe(
      map(resp => resp),
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

}
