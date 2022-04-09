import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Cliente } from '../../modelo/cliente/cliente';
import { URL_BACKEND } from '../../sistema/config/config';
import { catchError, map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { SMServicioTaxi } from '../../socket_modelo/smserviciotaxi/smserviciotaxi';
import { LoginService } from '../login/login.service';
import { SMCliente } from '../../socket_modelo/smcliente/smcliente';
import { SMTaxista } from '../../socket_modelo/smtaxista/smtaxista';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  cbPedido:EventEmitter<SMServicioTaxi> = new EventEmitter();

  private url:string = URL_BACKEND+"/cliente";
  private httpHeaders = new HttpHeaders({'Content-Type':'application/json'});

  constructor(private http:HttpClient, private loginService:LoginService, private router:Router) { }

  private url_protegido = URL_BACKEND+"/pcliente";
  private http_headers = new HttpHeaders({'Content-Type':'application/json'});



  private esNoAutorizado(e:any): boolean{
    if(e.status == 401 || e.status == 403){

      if(this.loginService.isAuthenticate()){
        this.loginService.cerrarSesion();
      }

      this.router.navigate(['login']);
      return true;
    }
    else {
      return false;
    }
  }

  private agregarAutorizacion() : HttpHeaders {
    const token = this.loginService.token;
    if(token != null && token != ""){
      return this.http_headers.append('Authorization', 'Bearer '+token);
    }
    else{
      return this.http_headers;
    }
  }

  //lista general
  public clienteLista() : Observable<Cliente[]>{
    return this.http.get(this.url+"/cllista", {headers : this.agregarAutorizacion()}).pipe(
      map((resp) => resp as Cliente[]),
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  //obtener datos del cliente
  public obtenerDatos(id:number): Observable<Cliente>{
    return this.http.get(this.url_protegido+"/datos/"+id, {headers : this.agregarAutorizacion()}).pipe(
      map(resp => {
        return resp as Cliente;
      }),     

      catchError(e => {

        if(this.esNoAutorizado(e)){
          return throwError(() => e);
        }

        return throwError(() => e);
      })

    );
  }

  public smCliente(id:number): Observable<SMCliente>{
    return this.http.get(this.url_protegido+"/smcli/obtener/"+id, {headers : this.agregarAutorizacion()}).pipe(
      map(resp => {
        return resp as SMCliente;
      }),

      catchError(e => {

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);
      })

    );
  }

  public editarCalificacion(taxista:SMTaxista): Observable<any>{
    return this.http.post(this.url_protegido+"/cali/editar",taxista, {headers : this.agregarAutorizacion()}).pipe(
      map(resp => resp),
      catchError(e => {

        if(e.status == 404 || e.status == 500){
          Swal.fire({
            icon:'error',
            title:'Operación fallida',
            text:e.error.messaje
          });
        }
        else{
          Swal.fire({
            icon:'error',
            title:'Operación fallida',
            text:'Error: No se ha podido establecer conexión con el sistema'
          });
        } 

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);
      })

    );
  }

  //listar historial
  public historial(idcliente:number) : Observable<SMServicioTaxi[]> {
    return this.http.get<SMServicioTaxi[]>(this.url_protegido+"/historial/"+idcliente, {headers : this.agregarAutorizacion()}).pipe(
      catchError(e => {

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);
      })
    );
  }
  

  //ingreso libre
  public clienteGuardar(cliente:Cliente, archivo:File):Observable<any>{
    
    return this.http.post(this.url+"/clcrear", cliente, {headers : this.httpHeaders}).pipe(

      switchMap((resp : any) => {

        let formData = new FormData();
        formData.append("idcliente", resp.idcliente);
        formData.append("archivo", archivo);   
            
        return this.http.post(`${this.url}/climagenes`,formData).pipe(
          map(res => {
            return res;
          })
        );

      }),
      
      catchError(e => {
        
        if(e.status == 400 || e.status == 404 || e.status == 500){
          Swal.fire({
            icon:'error',
            title:'Operación fallida',
            text:e.error.messaje
          });
        }
        else{
          Swal.fire({
            icon:'error',
            title:'Operación fallida',
            text:'Error: No se ha podido establecer conexión con el sistema'
          });
        }        

        return throwError(() => e);
      })
    );

  }  
  

}
