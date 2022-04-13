import { Injectable } from "@angular/core";
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { LoginService } from "../servicio-conexion/login/login.service";
import { catchError, concatMap } from "rxjs/operators";
import { JwtDto } from "../security_modelo/jwtDto/jwt-dto";
import Swal from "sweetalert2";
import { Router } from "@angular/router";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(private loginService: LoginService, private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (!this.loginService.isAuthenticate()) {
            return next.handle(req);
        }

        let authReq = req;
        const token = this.loginService.token;
        authReq = this.addToken(req, token);

        return next.handle(authReq).pipe(catchError((err: HttpErrorResponse) => {

            console.log('*********REFRESCANDO EN INTERCEPTOR', err);
            if (err.status === 401) {
                let jwtDto: JwtDto = new JwtDto();
                jwtDto.token = this.loginService.token;
                return this.loginService.refrescarToken(jwtDto).pipe(concatMap((data: any) => {

                    this.loginService.refresToken(data.token);
                    authReq = this.addToken(req, data.token);
                    return next.handle(authReq);

                }));
            }
            else if (err.status === 403) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Acceso denegado',
                    text: 'No tienes permiso para realizar esta acción'
                });
                this.loginService.cerrarSesion();
                this.router.navigate(['login']);
                return throwError(err);
            }
            else {
                return throwError(err);
            }

        }));

    }

    private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
        return req.clone({ headers: req.headers.set('Authorization', 'Bearer ' + token) });
    }

}

