import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ChangePasswordDto } from '../../security_modelo/change-password/changepassworddto';
import { EmailValuesDto } from '../../security_modelo/email-values/emailvaluesdto';
import { URL_BACKEND } from '../../sistema/config/config';

@Injectable({
  providedIn: 'root'
})
export class EmailPasswordService {

  private url:string = URL_BACKEND+"/email-password";  

  constructor(private http:HttpClient) { }

  public enviarPeticion(dto:EmailValuesDto) : Observable<any>{
    return this.http.post(this.url+"/send-email", dto).pipe(
      map(resp => resp),
      catchError(e => {

        if(e.status == 404 || e.status == 500){
          Swal.fire({
            icon:'error',
            title:'Error de petición',
            text:e.error.mensaje
          });
        }
        
        return throwError(e);
      })
    );
  }

  public cambiarContra(cpdto:ChangePasswordDto) : Observable<any>{
    return this.http.post(this.url+"/change-password", cpdto).pipe(
      map(resp => resp),
      catchError(e => {

        if(e.status == 404 || e.status == 500){
          Swal.fire({
            icon:'error',
            title:'Error de petición',
            text:e.error.mensaje
          });
        }
        
        return throwError(e);
      })
    );
  }

}
