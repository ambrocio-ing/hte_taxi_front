import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { URL_BACKEND } from '../../sistema/config/config'
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { SMServicioTaxi } from '../../socket_modelo/smserviciotaxi/smserviciotaxi';

@Injectable({
  providedIn: 'root'
})
export class Vigilante2Service {

  private url:string = URL_BACKEND+"/st";
  
  constructor(private http:HttpClient) { }  
 
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
    return this.http.post(this.url+"/steditar",smservicioTaxi).pipe(
      map(resp => resp),
      catchError(e => {

        if(e.error.status == 404 || e.error.status == 500){
          Swal.fire({
            icon:'error',
            title:'Operación fallida',
            text: e.error.mensaje
          });
        }
        
        return throwError(() => e);
      })
    );
  }


}
