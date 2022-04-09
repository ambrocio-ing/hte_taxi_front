import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Reclamo } from '../../modelo/reclamo/reclamo';
import { URL_BACKEND } from '../../sistema/config/config';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class ReclamoService {

  private url:string = URL_BACKEND + "/reclamo";
  private httpHeaders = new HttpHeaders({'Content-Type' : 'application/json'});

  constructor(private http:HttpClient, private loginService:LoginService, private router:Router) { }

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

  reclamoLista() : Observable<Reclamo[]> {
    return this.http.get<Reclamo[]>(this.url+"/relista", {headers : this.agregarAutorizacion()}).pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  reclamoBuscar(fecha:String) : Observable<Reclamo[]> {
    return this.http.get<Reclamo[]>(this.url+"/rebuscar/"+fecha, {headers : this.agregarAutorizacion()}).pipe(
      catchError(e => {

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);
      })
    );
  }

  reclamoGuardar(reclamo:Reclamo) : Observable<any> {
    return this.http.post(this.url+"/recrear", reclamo, {headers : this.agregarAutorizacion()}).pipe(
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

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);

      })
    );
  }

  reclamoObtener(id:number) : Observable<Reclamo> {
    return this.http.get(this.url+"/reobtener/"+id, {headers : this.agregarAutorizacion()}).pipe(
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

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);

      })
    );
  }

  reclamoEliminar(id:number) : Observable<any> {
    return this.http.delete(this.url+"/reeliminar/"+id, {headers : this.agregarAutorizacion()}).pipe(
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

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);

      })
    );
  }

}
