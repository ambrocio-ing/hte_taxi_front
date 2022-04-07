import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Reclamo } from '../../modelo/reclamo/reclamo';
import { URL_BACKEND } from '../../sistema/config/config';

@Injectable({
  providedIn: 'root'
})
export class ReclamoService {

  private url:string = URL_BACKEND + "/reclamo";
  private httpHeaders = new HttpHeaders({'Content-Type' : 'application/json'});

  constructor(private http:HttpClient) { }

  reclamoLista() : Observable<Reclamo[]> {
    return this.http.get<Reclamo[]>(this.url+"/relista", {headers : this.httpHeaders}).pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  reclamoBuscar(fecha:String) : Observable<Reclamo[]> {
    return this.http.get<Reclamo[]>(this.url+"/rebuscar/"+fecha, {headers : this.httpHeaders}).pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  reclamoGuardar(reclamo:Reclamo) : Observable<any> {
    return this.http.post(this.url+"/recrear", reclamo, {headers : this.httpHeaders}).pipe(
      map(resp => resp),
      catchError(e => {
        if(e.error.status == 404 || e.error.status == 500){
          Swal.fire({
            icon:'error',
            title: 'Operación fallida',
            text : e.error.mensaje
          });
        }
        else{
          Swal.fire({
            icon:'error',
            title: 'Operación fallida',
            text : 'Es posible que no haya conexión al servidor'
          });
        }

        return throwError(() => e);

      })
    );
  }

  reclamoObtener(id:number) : Observable<Reclamo> {
    return this.http.get(this.url+"/reobtener/"+id, {headers : this.httpHeaders}).pipe(
      map(resp => resp as Reclamo),
      catchError(e => {
        if(e.error.status == 404 || e.error.status == 500){
          Swal.fire({
            icon:'error',
            title: 'Operación fallida',
            text : e.error.mensaje
          });
        }
        else{
          Swal.fire({
            icon:'error',
            title: 'Operación fallida',
            text : 'Es posible que no haya conexión al servidor'
          });
        }

        return throwError(() => e);

      })
    );
  }

  reclamoEliminar(id:number) : Observable<any> {
    return this.http.delete(this.url+"/reeliminar/"+id, {headers : this.httpHeaders}).pipe(
      map(resp => resp),
      catchError(e => {
        if(e.error.status == 404 || e.error.status == 500){
          Swal.fire({
            icon:'error',
            title: 'Operación fallida',
            text : e.error.mensaje
          });
        }
        else{
          Swal.fire({
            icon:'error',
            title: 'Operación fallida',
            text : 'Es posible que no haya conexión al servidor'
          });
        }

        return throwError(() => e);

      })
    );
  }

}
