import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Reclamo } from '../../modelo/reclamo/reclamo';
import { URL_BACKEND } from '../../sistema/config/config';

@Injectable({
  providedIn: 'root'
})
export class ReclamoService {

  private url:string = URL_BACKEND + "/reclamo";  

  constructor(private http:HttpClient) { }

  reclamoLista() : Observable<Reclamo[]> {
    return this.http.get<Reclamo[]>(this.url+"/relista").pipe(
      catchError(e => {
        return throwError(() => e);
      })
    );
  }

  reclamoBuscar(fecha:String) : Observable<Reclamo[]> {
    return this.http.get<Reclamo[]>(this.url+"/rebuscar/"+fecha).pipe(
      catchError(e => {

        return throwError(() => e);
      })
    );
  }

  reclamoGuardar(reclamo:Reclamo, archivo:File) : Observable<any> {
    return this.http.post(this.url+"/recrear", reclamo).pipe(
      switchMap((resp:any) => {
        const formData = new FormData();
        formData.append("id", resp.id);
        formData.append("archivo",archivo);

        return this.http.post(`${this.url}/reimagen`, formData).pipe(
          map(res => {
            return res;
          })
        );

      }),
      catchError(e => {
        if(e.error.status == 404 || e.error.status == 500){
          Swal.fire({
            icon:'error',
            title: 'Operación fallida',
            text : e.error.mensaje
          });
        }
        
        return throwError(() => e);

      })
    );
  }

  reclamo_Guardar(reclamo:Reclamo) : Observable<any> {
    return this.http.post(this.url+"/recrear", reclamo).pipe(
      map(resp => resp),
      catchError(e => {
        if(e.error.status == 404 || e.error.status == 500){
          Swal.fire({
            icon:'error',
            title: 'Operación fallida',
            text : e.error.mensaje
          });
        }       

        return throwError(() => e);

      })
    );
  } 

  reclamoEliminar(id:number) : Observable<any> {
    return this.http.delete(this.url+"/reeliminar/"+id).pipe(
      map(resp => resp),
      catchError(e => {
        if(e.error.status == 404 || e.error.status == 500){
          Swal.fire({
            icon:'error',
            title: 'Operación fallida',
            text : e.error.mensaje
          });
        }      

        return throwError(() => e);

      })
    );
  }

}
