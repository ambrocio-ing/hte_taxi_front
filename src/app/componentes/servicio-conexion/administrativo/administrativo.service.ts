import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Administrativo } from '../../modelo/administrativo/administrativo';
import { URL_BACKEND } from '../../sistema/config/config';

@Injectable({
  providedIn: 'root'
})
export class AdministrativoService {

  private url:string = URL_BACKEND+"/administrativo";
  private httpHeaders = new HttpHeaders({'Content-Type' : 'application/json'});

  constructor(private http:HttpClient) { }

  public listarAdmi() : Observable<Administrativo[]> {
    return this.http.get<Administrativo[]>(this.url+"/adlista", {headers : this.httpHeaders}).pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  public crearAdmi(admin:Administrativo) : Observable<any> {
    return this.http.post(this.url+"/adcrear", admin, {headers : this.httpHeaders}).pipe(
      map(resp => resp),
      catchError(e => {
        if (e.status == 404 || e.status == 500) {
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
            text: 'Error: No se ha podido establecer conexión con el sistema'
          });
        }
        return throwError(() => e);
      })
    );
  }

  public obtenerAdmi(id:number) : Observable<Administrativo> {
    return this.http.get<Administrativo>(this.url+"/adobtener/"+id, {headers : this.httpHeaders}).pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  public editarAdmi(admin:Administrativo) : Observable<any> {
    return this.http.post(this.url+"/adeditar", admin, {headers : this.httpHeaders}).pipe(
      map(resp => resp),
      catchError(e => {
        if (e.status == 404 || e.status == 500) {
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
            text: 'Error: No se ha podido establecer conexión con el sistema'
          });
        }
        return throwError(() => e);
      })
    );
  }

  public eliminarAdmi(id:number) : Observable<any> {
    return this.http.delete(this.url+"/adeliminar/"+id, {headers : this.httpHeaders}).pipe(
      map(resp => resp),
      catchError(e => {
        if (e.status == 404 || e.status == 500) {
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
            text: 'Error: No se ha podido establecer conexión con el sistema'
          });
        }
        return throwError(() => e);
      })
    );
  }

}
