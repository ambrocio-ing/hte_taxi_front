import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Pago } from '../../modelo/pago/pago';
import { URL_BACKEND } from '../../sistema/config/config';

@Injectable({
  providedIn: 'root'
})

export class PagoService {

  private url: string = URL_BACKEND + "/pago";
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  public pagoHistorial(idtaxista: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.url + "/pahistorial/" + idtaxista, { headers: this.httpHeaders }).pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  public pagoLista(idtaxista: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.url + "/palista", { headers: this.httpHeaders }).pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  public pagoCrear(pago: Pago): Observable<any> {
    return this.http.post(this.url + "/pacrear", pago, { headers: this.httpHeaders }).pipe(
      map(resp => resp),
      catchError(e => {

        if (e.status == 404 || e.ststus == 500) {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: e.mensaje
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: 'Sin conexión con el servidor, por favor intentelo en otro momento'
          });
        }

        return throwError(() => e);

      })
    );
  }

  public pagoEliminar(idpago: number): Observable<any> {
    return this.http.delete(this.url + "/paeliminar/" + idpago, { headers: this.httpHeaders }).pipe(
      map(resp => resp),
      catchError(e => {

        if (e.status == 404 || e.ststus == 500) {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: e.mensaje
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: 'Sin conexión con el servidor, por favor intentelo en otro momento'
          });
        }

        return throwError(() => e);

      })
    );
  }

  public pagoObtener(idpago: number): Observable<Pago> {
    return this.http.get<Pago>(this.url + "/paobtener/" + idpago, { headers: this.httpHeaders }).pipe(

      catchError(e => {

        if (e.status == 404 || e.ststus == 500) {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: e.mensaje
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: 'Sin conexión con el servidor, por favor intentelo en otro momento'
          });
        }

        return throwError(() => e);

      })
    );
  }

  public obtenerUltimoPago(idpago: number): Observable<Pago> {
    return this.http.get<Pago>(this.url + "/ultimo/pago/" + idpago, { headers: this.httpHeaders }).pipe(

      catchError(e => {

        if (e.status == 404 || e.ststus == 500) {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: e.mensaje
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: 'Sin conexión con el servidor, por favor intentelo en otro momento'
          });
        }

        return throwError(() => e);

      })
    );
  }

  public obtenerPorTaxista(idtaxista: number): Observable<Pago> {
    return this.http.get<Pago>(this.url + "/por/taxista/" + idtaxista, { headers: this.httpHeaders }).pipe(

      catchError(e => {

        if (e.status == 404 || e.ststus == 500) {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: e.mensaje
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: 'Sin conexión con el servidor, por favor intentelo en otro momento'
          });
        }

        return throwError(() => e);

      })
    );
  }  

  public obtenerEntreFechas(idtaxista: number, finicio: string, ffin: string): Observable<Pago> {
    return this.http.get<Pago>(this.url + "/entre/fechas/" + idtaxista + "/" + finicio + "/" + ffin, { headers: this.httpHeaders }).pipe(

      catchError(e => {

        if (e.status == 404 || e.ststus == 500) {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: e.mensaje
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: 'Sin conexión con el servidor, por favor intentelo en otro momento'
          });
        }

        return throwError(() => e);

      })
    );
  }

  public obtenerPagoPendiente(idtaxista: number, fecha: string, pago: Pago): Observable<any> {
    return this.http.get(this.url + "/pendiente/" + idtaxista + "/" + fecha, { headers: this.httpHeaders }).pipe(
      switchMap((resp: any) => {

        if (resp.estado == "Nulo") {
          return this.http.post(`${this.url}/pacrear`, pago, { headers: this.httpHeaders }).pipe(
            map((res: any) => {
              return res;
            }),
            
            catchError(e => {

              return throwError(() => e);

            })
          );
        }
        else {
          return resp;
        }

      }),

      catchError(e => {

        return throwError(() => e);

      })
    );
  }

  public verificarPagoPendiente(idtaxista: number): Observable<any> {
    return this.http.get(this.url + "/pendiente/" + idtaxista, { headers: this.httpHeaders }).pipe(
      map(resp => resp),
      catchError(e => {

        return throwError(() => e);

      })
    );
  }

}
