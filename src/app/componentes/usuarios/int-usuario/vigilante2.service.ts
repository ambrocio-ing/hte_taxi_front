import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { URL_BACKEND } from '../../sistema/config/config'
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class Vigilante2Service {

  constructor(private http:HttpClient) { }

  url:string = URL_BACKEND+"/st";
  private httpHeaders = new HttpHeaders({'Content-Type' : 'application/json'});

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

  public editarEstado(id:number) : Observable<any>{
    return this.http.put(this.url+"/steditar/"+id, {Headers : this.httpHeaders}).pipe(
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

        return throwError(() => e);
      })
    );
  }


}
