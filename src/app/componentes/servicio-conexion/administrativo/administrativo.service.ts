import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { Administrativo } from '../../modelo/administrativo/administrativo';
import { URL_BACKEND } from '../../sistema/config/config';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class AdministrativoService {

  private url:string = URL_BACKEND+"/administrativo";
  //private httpHeaders = new HttpHeaders({'Content-Type' : 'application/json'});

  constructor(private http:HttpClient, private loginService:LoginService, private router:Router) { }

  /*public esNoAutorizado(e:any) : boolean{
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

  public agregarAutorizacion() : HttpHeaders {
    const token = this.loginService.token;
    if(token != null && token != ""){
      return this.httpHeaders.append('Authorization' , 'Bearer '+token);
    }
    else{
      return this.httpHeaders;
    }

  }  */

  public listarAdmi() : Observable<Administrativo[]> {
    return this.http.get<Administrativo[]>(this.url+"/adlista").pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  public crearAdmi(admin:Administrativo) : Observable<any> {
    return this.http.post(this.url+"/adcrear", admin).pipe(
      map(resp => resp),
      catchError(e => {    

        if(e.status == 404 || e.status == 500){
          Swal.fire({
            icon:'error',
            title:'Operación fallida',
            text:e.error.messaje
          });
        }
         
        return throwError(() => e);
      })
    );
  }

  public obtenerAdmi(id:number) : Observable<Administrativo> {
    return this.http.get<Administrativo>(this.url+"/adobtener/"+id).pipe(
      catchError(e => {  
        
        if(e.status == 404 || e.status == 500){
          Swal.fire({
            icon:'error',
            title:'Operación fallida',
            text:e.error.messaje
          });
        }        
        return throwError(() => e);
      })
    );
  }

  public editarAdmi(admin:Administrativo) : Observable<any> {
    return this.http.post(this.url+"/adeditar", admin).pipe(
      map(resp => resp),
      catchError(e => {       

        if(e.status == 404 || e.status == 500){
          Swal.fire({
            icon:'error',
            title:'Operación fallida',
            text:e.error.messaje
          });
        }

        return throwError(() => e);
      })
    );
  }

  public eliminarAdmi(id:number) : Observable<any> {
    return this.http.delete(this.url+"/adeliminar/"+id).pipe(
      map(resp => resp),
      catchError(e => { 

        if(e.status == 404 || e.status == 500){
          Swal.fire({
            icon:'error',
            title:'Operación fallida',
            text:e.error.messaje
          });
        }

        return throwError(() => e);
      })
    );
  }

}
