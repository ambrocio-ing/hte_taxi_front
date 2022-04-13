import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError, map} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Pago } from '../../modelo/pago/pago';
import { URL_BACKEND } from '../../sistema/config/config';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  private url: string = URL_BACKEND + "/pago";  

  constructor(private http: HttpClient) { }  

  public pagoHistorial(idtaxista: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.url + "/pahistorial/" + idtaxista).pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }  

  public pagoObtener(idpago: number): Observable<Pago> {
    return this.http.get<Pago>(this.url + "/paobtener/" + idpago).pipe(

      catchError(e => {

        if (e.status == 404 || e.ststus == 500) {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: e.mensaje
          });
        }
        
        return throwError(() => e);

      })
    );
  }  

  public buscarEntreFechas(idtaxista: number, finicio: string, ffin: string): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.url + "/buscar/" + idtaxista + "/" + finicio + "/" + ffin).pipe(

      catchError(e => {

        if (e.status == 404 || e.ststus == 500) {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: e.error.mensaje
          });
        }
        
        return throwError(() => e);

      })
    );
  }
  
  public verificarPagoPendiente(idtaxista: number): Observable<any> {
    return this.http.get(this.url + "/pendiente/" + idtaxista).pipe(
      map(resp => resp),
      catchError(e => {        

        return throwError(() => e);

      })
    );
  }

  public pagoEditar(pago:Pago): Observable<any> {
    return this.http.post(this.url + "/paeditar", pago).pipe(
      map(resp => resp),

      catchError(e => {  
       
       return throwError(() => e);

      })
    );
  }

}
