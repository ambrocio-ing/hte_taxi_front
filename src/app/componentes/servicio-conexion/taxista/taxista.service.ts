import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Taxista } from '../../modelo/taxista/taxista';
import { VehiculoPropietario } from '../../modelo/vehiculoPropietario/vehiculo-propietario';
import { URL_BACKEND } from '../../sistema/config/config';
import { SMServicioTaxi } from '../../socket_modelo/smserviciotaxi/smserviciotaxi';
import { SMTaxista } from '../../socket_modelo/smtaxista/smtaxista';

@Injectable({
  providedIn: 'root'
})
export class TaxistaService {

  private url: string = URL_BACKEND + "/taxista"; 
  private url_protegido: string = URL_BACKEND + "/ptaxista";
  private url_protegido2: string = URL_BACKEND + "/st";  

  cbPaginar:EventEmitter<number> = new EventEmitter();

  constructor(private http: HttpClient) { }
 

  public taxistaLista(page:number): Observable<any> {
    return this.http.get(this.url_protegido + "/tapaginar/"+page).pipe(
      map((resp:any) => {
        resp.content as Taxista[];
        return resp;
      }),

      catchError(e => {
        return throwError(() => e)
      })    
      
    );
  }

  public buscarPorDni(dni:string): Observable<any> {

    return this.http.get(this.url_protegido + "/bdni/"+dni).pipe(
      map((resp:any) => {        
        return resp as Taxista[];
      }),

      catchError(e => {
        return throwError(() => e)
      })      
    );
  }

  public buscarPorNombres(nombres:string): Observable<Taxista[]> {

    return this.http.get(this.url_protegido + "/bnombre/"+nombres).pipe(
      map((resp:any) => {
        
        return resp as Taxista[];
      }),
      catchError(e => {       

        return throwError(() => e)
      })      
    );
  }  

  public smTaxista(id:number) : Observable<SMTaxista> {
    return this.http.get(this.url_protegido+"/smt/obtener/"+id).pipe(
      map(resp => {
        return resp as SMTaxista;
      }),
      catchError(e => {        
        return throwError(() => e);
      })
    );
  }

  public eliminar_Taxista(id:number) : Observable<any> {

    return this.http.delete(this.url_protegido+"/taeliminar/"+id).pipe(
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

        return throwError(() => e);
      })
    );

  }

  public editarEstado(taxista:Taxista) : Observable<any> {

    return this.http.post(this.url_protegido+"/editar/estado", taxista).pipe(
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

        return throwError(() => e);
      })
    );

  }
  
  //historial los 5 ultimos servicios
  public historial(id:number): Observable<SMServicioTaxi[]> {
    return this.http.get<SMServicioTaxi[]>(this.url_protegido+"/historial/"+id).pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  public buscarSmsPorFecha(id:number, fecha:string): Observable<SMServicioTaxi[]> {
    return this.http.get<SMServicioTaxi[]>(this.url_protegido2+"/buscar/"+id+"/"+fecha).pipe(
      catchError(e => {
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

  //acceso sin permiso ======================================== 

  public eliminarTaxista(id:number) : Observable<any> {

    return this.http.delete(this.url+"/taeliminar/"+id).pipe(
      map(resp => {
        return resp;
      })
    );

  }

  public taxistaGuardarCinco(taxista: Taxista, archivos:File[]): Observable<any> {

    return this.http.post(this.url + "/tacrear", taxista).pipe(
      
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

    return this.http.post(this.url + "/tacrear", taxista).pipe(
      
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
    return this.http.get<VehiculoPropietario>(this.url+"/buscar/propietario/"+documento);
  }

}
