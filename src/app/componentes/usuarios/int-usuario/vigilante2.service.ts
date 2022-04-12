import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { URL_BACKEND } from '../../sistema/config/config'
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { LoginService } from '../../servicio-conexion/login/login.service';
import { Router } from '@angular/router';
import { SMServicioTaxi } from '../../socket_modelo/smserviciotaxi/smserviciotaxi';

@Injectable({
  providedIn: 'root'
})
export class Vigilante2Service {

  private url:string = URL_BACKEND+"/st";
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

  public guardarPedido(id:number, texto:string): void {

    sessionStorage.setItem("pedido"+id, texto);

  }  

  public obtenerPedido(id:number) : string {
    if(sessionStorage.getItem("pedido"+id) != null){
      return sessionStorage.getItem("pedido"+id) || '';
    }
    else {
      return "";
    }
  }

  public editarEstado(smservicioTaxi:SMServicioTaxi) : Observable<any>{
    return this.http.post(this.url+"/steditar",smservicioTaxi, {headers : this.agregarAutorizacion()}).pipe(
      map(resp => resp),
      catchError(e => {

        if(e.error.status == 404 || e.error.status == 500){
          Swal.fire({
            icon:'error',
            title:'Operación fallida',
            text: e.error.mensaje
          });
        }
        else{
          Swal.fire({
            icon:'error',
            title:'Sin servicio',
            text:'Es posible que el servidor este inactivo'
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
