import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Pago } from '../../modelo/pago/pago';
import { URL_BACKEND } from '../../sistema/config/config';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})

export class PagoService {

  private url: string = URL_BACKEND + "/pago";
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient, private loginService:LoginService, private router:Router) { }

  private esNoAutorizado(e:any) : boolean {
    if(e.status == 401 || e.status == 403){
      if(this.loginService.isAuthenticate()){
        this.loginService.cerrarSesion();
      }

      this.router.navigate(['login']);
      return true;

    }
    else{
      return false;
    }
  }

  private agregarAutorizacion() : HttpHeaders {
    const token = this.loginService.token;
    if(token != null && token != ""){
      return this.httpHeaders.append('Authorization', 'Bearer '+token);

    }
    else{
      return this.httpHeaders;
    }
  }

  public pagoHistorial(idtaxista: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.url + "/pahistorial/" + idtaxista, { headers: this.agregarAutorizacion()}).pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  public pagoLista(): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.url + "/palista", { headers: this.agregarAutorizacion()}).pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }  

  public pagoEliminar(idpago: number): Observable<any> {
    return this.http.delete(this.url + "/paeliminar/" + idpago, { headers: this.agregarAutorizacion()}).pipe(
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

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);

      })
    );
  }

  public pagoObtener(idpago: number): Observable<Pago> {
    return this.http.get<Pago>(this.url + "/paobtener/" + idpago, { headers: this.agregarAutorizacion()}).pipe(

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

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);

      })
    );
  }

  public obtenerUltimoPago(idpago: number): Observable<Pago> {
    return this.http.get<Pago>(this.url + "/ultimo/pago/" + idpago, { headers: this.agregarAutorizacion()}).pipe(

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

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);

      })
    );
  }

  public obtenerPorTaxista(idtaxista: number): Observable<Pago> {
    return this.http.get<Pago>(this.url + "/por/taxista/" + idtaxista, { headers: this.agregarAutorizacion()}).pipe(

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

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);

      })
    );
  }  

  public obtenerEntreFechas(idtaxista: number, finicio: string, ffin: string): Observable<Pago> {
    return this.http.get<Pago>(this.url + "/entre/fechas/" + idtaxista + "/" + finicio + "/" + ffin, { headers: this.agregarAutorizacion()}).pipe(

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

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);

      })
    );
  }
  
  public verificarPagoPendiente(idtaxista: number): Observable<any> {
    return this.http.get(this.url + "/pendiente/" + idtaxista, { headers: this.agregarAutorizacion()}).pipe(
      map(resp => resp),
      catchError(e => {

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);

      })
    );
  }

  public pagoEditar(pago:Pago): Observable<any> {
    return this.http.post(this.url + "/paeditar", pago, { headers: this.agregarAutorizacion()}).pipe(
      map(resp => resp),

      catchError(e => {        

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);

      })
    );
  }

}
