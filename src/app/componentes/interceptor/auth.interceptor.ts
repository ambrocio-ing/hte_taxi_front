import { Injectable } from "@angular/core";
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { LoginService } from "../servicio-conexion/login/login.service";
import Swal from 'sweetalert2';
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private loginService:LoginService, private router:Router){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {        
        
        return next.handle(req).pipe(
            catchError(e => {
                if(e.status == 401){
                    if(this.loginService.isAuthenticate()){
                        this.loginService.cerrarSesion();
                    }
                    this.router.navigate(['login']);
                }

                if(e.status == 403){
                    Swal.fire({
                        icon:'warning',
                        title:'Acceso denegado',
                        text:'No tienes permiso para realizar esta acción'
                    });
                    this.loginService.cerrarSesion();
                    this.router.navigate(['login']);
                }

                return throwError(e);

            })
        );

    }

}

