import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { URL_BACKEND } from '../../sistema/config/config';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class DolarService {

  private url:string = URL_BACKEND+"/dolar";
  private httpHeaders = new HttpHeaders({'Content-Type' : 'application/json'});

  constructor(private http:HttpClient, private router:Router, private loginService:LoginService) { }

  private esNoAutorizado(e:any): boolean {
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

  public crearDolar(dolar:any) : Observable<any> {
    return this.http.post(this.url+"/pacrear", dolar, {headers : this.agregarAutorizacion()}).pipe(
      catchError(e => {

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);
      })
    );
  }

  public obtenerDolar() : Observable<any> {
    return this.http.get(this.url+"/obtener", {headers : this.agregarAutorizacion()}).pipe(
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
