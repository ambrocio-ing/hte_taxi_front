import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Taxista } from '../../modelo/taxista/taxista';
import { VehiculoPropietario } from '../../modelo/vehiculoPropietario/vehiculo-propietario';
import { URL_BACKEND } from '../../sistema/config/config';
import { SMServicioTaxi } from '../../socket_modelo/smserviciotaxi/smserviciotaxi';
import { SMTaxista } from '../../socket_modelo/smtaxista/smtaxista';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})

export class TaxistaService {

  private url: string = URL_BACKEND + "/taxista";
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  private url_protegido: string = URL_BACKEND + "/ptaxista";
  private url_protegido2: string = URL_BACKEND + "/st";
  private http_headers = new HttpHeaders({'Content-Type': 'application/json'});

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
      return this.http_headers.append('Authorization', 'Bearer '+token);

    }
    else{
      return this.http_headers;
    }
  }

  public taxistaLista(): Observable<Taxista[]> {
    return this.http.get<Taxista[]>(this.url_protegido + "/talista", { headers: this.agregarAutorizacion()}).pipe(
      catchError(e => {
        return throwError(() => e)
      })      
      
    );

  }

  public buscarPorDni(dni:string): Observable<Taxista[]> {

    return this.http.get<Taxista[]>(this.url_protegido + "/bdni/"+dni, { headers: this.agregarAutorizacion()}).pipe(
      catchError(e => {

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e)
      })
      
    );

  }

  public buscarPorNombres(nombres:string): Observable<Taxista[]> {

    return this.http.get<Taxista[]>(this.url_protegido + "/bnombre/"+nombres, { headers: this.agregarAutorizacion()}).pipe(
      catchError(e => {

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e)
      })
      
    );

  }

  /*public datos(id:number) : Observable<Taxista> {
    return this.http.get(this.url_protegido+"/datos/"+id, {headers : this.httpheaders}).pipe(
      map(resp => {
        return resp as Taxista;
      }),

      catchError(e => {
        return throwError(() => e);
      })
    );
  }*/

  public smTaxista(id:number) : Observable<SMTaxista> {
    return this.http.get(this.url_protegido+"/smt/obtener/"+id, {headers : this.agregarAutorizacion()}).pipe(
      map(resp => {
        return resp as SMTaxista;
      }),

      catchError(e => {

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);
      })
    );
  }

  public eliminar_Taxista(id:number) : Observable<any> {

    return this.http.delete(this.url_protegido+"/taeliminar/"+id, {headers : this.agregarAutorizacion()}).pipe(
      map(resp => {
        return resp;
      }),

      catchError(e => {
        if (e.status == 400 || e.status == 404 || e.status == 500) {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: e.error.mensaje
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: 'Error: No se ha podido establecer conexión con el sistema'
          });
        }

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);
      })
    );

  }
  
  //historial los 5 ultimos servicios
  public historial(id:number): Observable<SMServicioTaxi[]> {
    return this.http.get<SMServicioTaxi[]>(this.url_protegido+"/historial/"+id, {headers : this.agregarAutorizacion()}).pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  public buscarSmsPorFecha(id:number, fecha:string): Observable<SMServicioTaxi[]> {
    return this.http.get<SMServicioTaxi[]>(this.url_protegido2+"/buscar/"+id+"/"+fecha, {headers : this.agregarAutorizacion()}).pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  //acceso sin permiso ========================================
  public taxistaGuardar(taxista: Taxista): Observable<any> {

    return this.http.post(this.url + "/tacrear", taxista, { headers: this.httpHeaders }).pipe(
      map((resp) => {
        return resp;
      }),
      catchError(e => {

        if (e.status == 400 || e.status == 404 || e.status == 500) {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: e.error.mensaje
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: 'Error: No se ha podido establecer conexión con el sistema'
          });
        }

        return throwError(() => e);

      })
    );
  }  

  public eliminarTaxista(id:number) : Observable<any> {

    return this.http.delete(this.url+"/taeliminar/"+id,{headers : this.httpHeaders}).pipe(
      map(resp => {
        return resp;
      })
    );

  }

  public taxistaGuardarCinco(taxista: Taxista, archivos:File[]): Observable<any> {

    return this.http.post(this.url + "/tacrear", taxista, { headers: this.httpHeaders }).pipe(
      
      switchMap((resp : any) => {

        let formData = new FormData();
        formData.append("idtaxista", resp.idtaxista);
        formData.append("archivo1",archivos[0]);
        formData.append("archivo2",archivos[1]);
        formData.append("archivo3",archivos[2]);
        formData.append("archivo4",archivos[3]);
        formData.append("archivo5",archivos[4]);

        return this.http.post(`${this.url}/cinco/taimagenes`, formData).pipe(
          map(res => {
            return res;
          }),

          catchError(e => {
            this.eliminarTaxista(+resp.idtaxista).subscribe();
            return throwError(() => e);
          })

        );

      }),
      
      catchError(e => {

        if (e.status == 400 || e.status == 404 || e.status == 500) {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: e.error.mensaje
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: 'Error: No se ha podido establecer conexión con el sistema'
          });
        }

        return throwError(() => e);

      })
    );
  }

  public taxistaGuardarCuatro(taxista: Taxista, archivos:File[]): Observable<any> {

    return this.http.post(this.url + "/tacrear", taxista, { headers: this.httpHeaders }).pipe(
      
      switchMap((resp : any) => {

        let formData = new FormData();
        formData.append("idtaxista", resp.idtaxista);
        formData.append("archivo1",archivos[0]);
        formData.append("archivo2",archivos[1]);
        formData.append("archivo3",archivos[2]);
        formData.append("archivo4",archivos[3]);        

        return this.http.post(`${this.url}/cuatro/taimagenes`, formData).pipe(
          map(res => {
            return res;
          }),

          catchError(e => {
            this.eliminarTaxista(+resp.idtaxista).subscribe();
            return throwError(() => e);
          })

        );

      }),
      
      catchError(e => {

        if (e.status == 400 || e.status == 404 || e.status == 500) {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: e.error.mensaje
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: 'Error: No se ha podido establecer conexión con el sistema'
          });
        }

        return throwError(() => e);

      })
    );
  }

  public buscarPropietario(documento:string):Observable<VehiculoPropietario> {
    return this.http.get<VehiculoPropietario>(this.url+"/buscar/propietario/"+documento, {headers : this.httpHeaders});
  }

}
