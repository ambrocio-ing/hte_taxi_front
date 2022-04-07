import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  cbPedido:EventEmitter<SMServicioTaxi> = new EventEmitter();

  private url:string = URL_BACKEND+"/cliente";
  private httpHeaders = new HttpHeaders({'Content-Type':'application/json'});

  constructor(private http:HttpClient, private loginService:LoginService) { }

  private url_protegido = URL_BACKEND+"/pcliente";
  private http_headers = new HttpHeaders({'Content-Type':'application/json'});

  public isAuthentication(): boolean{
    if(this.loginService.usuario != null){
      return true;
    }
    else {
      return false;
    }
  }

  //lista general
  public clienteLista() : Observable<Cliente[]>{
    return this.http.get(this.url+"/cllista").pipe(
      map((resp) => resp as Cliente[]),
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  //obtener datos del cliente
  public obtenerDatos(id:number): Observable<Cliente>{
    return this.http.get(this.url_protegido+"/datos/"+id, {headers : this.http_headers}).pipe(
      map(resp => {
        return resp as Cliente;
      }),

      catchError(e => {
        return throwError(() => e);
      })

    );
  }

  public smCliente(id:number): Observable<SMCliente>{
    return this.http.get(this.url_protegido+"/smcli/obtener/"+id, {headers : this.http_headers}).pipe(
      map(resp => {
        return resp as SMCliente;
      }),

      catchError(e => {
        return throwError(() => e);
      })

    );
  }

  public editarCalificacion(taxista:SMTaxista): Observable<any>{
    return this.http.post(this.url_protegido+"/cali/editar",taxista, {headers : this.http_headers}).pipe(
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

        return throwError(() => e);
      })

    );
  }

  //listar historial
  public historial(idcliente:number) : Observable<SMServicioTaxi[]> {
    return this.http.get<SMServicioTaxi[]>(this.url_protegido+"/historial/"+idcliente, {headers : this.http_headers}).pipe(
      catchError(e => {
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
