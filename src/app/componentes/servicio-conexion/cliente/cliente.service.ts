import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Cliente } from '../../modelo/cliente/cliente';
import { URL_BACKEND } from '../../sistema/config/config';
import { catchError, map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { SMServicioTaxi } from '../../socket_modelo/smserviciotaxi/smserviciotaxi';
import { SMCliente } from '../../socket_modelo/smcliente/smcliente';
import { SMTaxista } from '../../socket_modelo/smtaxista/smtaxista';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  cbPedido:EventEmitter<SMServicioTaxi> = new EventEmitter();

  private url:string = URL_BACKEND+"/cliente";
  private url_protegido = URL_BACKEND+"/pcliente";

  constructor(private http:HttpClient) { }
  
  //lista general
  public clienteLista() : Observable<Cliente[]>{
    return this.http.get(this.url_protegido+"/cllista").pipe(
      map((resp) => resp as Cliente[]),
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  //obtener datos del cliente
  public obtenerDatos(id:number): Observable<Cliente>{
    return this.http.get(this.url_protegido+"/datos/"+id).pipe(
      map(resp => {
        return resp as Cliente;
      }),     

      catchError(e => {      

        return throwError(() => e);
      })

    );
  }

  public smCliente(id:number): Observable<SMCliente>{
    return this.http.get(this.url_protegido+"/smcli/obtener/"+id).pipe(
      map(resp => {
        return resp as SMCliente;
      }),

      catchError(e => {      

        return throwError(() => e);
      })

    );
  }

  public editarCalificacion(taxista:SMTaxista): Observable<any>{
    return this.http.post(this.url_protegido+"/cali/editar",taxista).pipe(
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

  //listar historial
  public historial(idcliente:number) : Observable<SMServicioTaxi[]> {
    return this.http.get<SMServicioTaxi[]>(this.url_protegido+"/historial/"+idcliente).pipe(
      catchError(e => {       
        return throwError(() => e);
      })
    );
  }

  public clienteEliminar(idcliente:number) : Observable<any> {
    return this.http.delete(this.url_protegido+"/cleliminar/"+idcliente).pipe(
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

  public editarEstado(cliente:Cliente) : Observable<any> {
    
    return this.http.post(this.url_protegido+"/editar/estado", cliente).pipe(
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

  public buscarPorNombres(nombres:string) : Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.url_protegido+"/nombre/"+nombres).pipe(
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

  public buscarPorDni(dni:string) : Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.url_protegido+"/dnis/"+dni).pipe(
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

  public editarPerfil(id:any, imagen:File) : Observable<any> {

    const formData = new FormData();
    formData.append("id", id);
    formData.append("imagen", imagen);

    return this.http.post(this.url_protegido+"/imagen/editar", formData).pipe(
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

  //ingreso libre ===================================
  public clienteGuardar(cliente:Cliente, perfil:File, dni:File):Observable<any>{
    
    return this.http.post(this.url+"/clcrear", cliente).pipe(

      switchMap((resp : any) => {

        let formData = new FormData();
        formData.append("idcliente", resp.idcliente);
        formData.append("archivo1", perfil);   
        formData.append("archivo2", dni);
            
        return this.http.post(`${this.url}/climagenes`, formData).pipe(
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

        return throwError(() => e);
      })
    );

  }  

  public eliminarCliente(id:number) : Observable<any> {
    return this.http.delete(this.url+"/cleliminar/"+id).pipe(
      map(resp => resp),
      catchError(e => {
        return throwError(e);
      })
    );
  }
  

}
