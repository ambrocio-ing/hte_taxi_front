import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { URL_BACKEND } from '../../sistema/config/config';
import { formatDate } from '@angular/common'
import { PagoService } from '../../servicio-conexion/pago/pago.service';
import { LoginService } from '../../servicio-conexion/login/login.service';
import { Router } from '@angular/router'
import { SMServicioTaxi } from '../../socket_modelo/smserviciotaxi/smserviciotaxi';

@Injectable({
  providedIn: 'root'
})

export class VigilanteService {

  private url: string = URL_BACKEND + "/st";
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  //pago: Pago = new Pago();
  //public _fecha: string = "";

  constructor(private http: HttpClient, private pagoService: PagoService,
    private loginService: LoginService, private router: Router) {

    //this.cargarFecha();

  }

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
      return this.httpHeaders.append('Authorization', 'Bearer '+token);

    }
    else{
      return this.httpHeaders;
    }
  }

  public guardarEstadoServicio(numero: number, estado: string): void {
    sessionStorage.setItem("servicio" + numero, estado);
  }

  public obtenerEstadoServicio(numero: number): string {
    if (sessionStorage.getItem("servicio" + numero) != null) {
      return sessionStorage.getItem("servicio" + numero) || "";
    }
    else {
      return "";
    }
  }

  public editarEstado(smservicioTaxi:SMServicioTaxi): Observable<any> {
    return this.http.post(this.url + "/steditar",smservicioTaxi, {headers: this.agregarAutorizacion()}).pipe(
      map(resp => resp),
      catchError(e => {
        if (e.error.status == 404 || e.error.status == 500) {
          Swal.fire({
            icon: 'error',
            title: 'Operación fallida',
            text: e.error.mensaje
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Sin servicio',
            text: 'Es posible que el servidor este inactivo'
          });
        }

        if(this.esNoAutorizado(e)){
          return throwError(e);
        }

        return throwError(() => e);
      })
    );
  }
 
  public consultarPago() : void {
    this.pagoService.verificarPagoPendiente(this.loginService.usuario.id).subscribe(resp => {
      console.log('RESPUESTA PAGOS2',resp);
      if(resp.ok == "ok" && resp.dias == 16){        
        Swal.fire({
          icon: 'info',
          title: 'Se a detectado un pago pendiente',
          text: 'Desea ir a pagar en estos momentos?, tienes todo el día para realizar tu pago, pasado ese tiempo será obligatorio',
          showCancelButton: true,
          confirmButtonText: 'Ir a pagar',
          cancelButtonText: 'Mas tarde'
        }).then((res) => {
          console.log('*****RESPUESTA DEL SWAL',res);
          if (res.value) {
            this.router.navigate(['suscripcion', resp.id]);
          }
          else{
            this.router.navigate(['inttaxista']);
          }            
        });
      }
      else if(resp.ok == "ok" && resp.dias > 16){
        this.router.navigate(['suscripcion', resp.id]);
      }
      else if(resp.ok == "Incompleto" || resp.ok == "Faltan" || resp.ok == "Sin pagos"){
        this.router.navigate(['inttaxista']);
      }
      else{
        Swal.fire({
          icon: 'error',
          title: 'Operación fallida',
          text: 'No se a podido validar con éxito sus datos por favor intentelo mas tarde'
        });
        this.loginService.cerrarSesion();
        this.router.navigate(['']);
      }

    }, err => {
      Swal.fire({
        icon: 'error',
        title: 'Operación fallida',
        text: 'No se a podido validar con éxito sus datos por favor intentelo mas tarde'
      });
      this.loginService.cerrarSesion();
      this.router.navigate(['']);
    });
  }

  public consultar_Pago() : void {
    this.pagoService.verificarPagoPendiente(this.loginService.usuario.id).subscribe(resp => {
      console.log('RESPUESTA PAGOS1',resp);
      if(resp.ok == "ok" && resp.dias == 16){        
        Swal.fire({
          icon: 'info',
          title: 'Se a detectado un pago pendiente',
          text: 'Desea ir a pagar en estos momentos?, tienes todo el día para realizar tu pago, pasado ese tiempo será obligatorio',
          showCancelButton: true,
          confirmButtonText: 'Ir a pagar',
          cancelButtonText: 'Mas tarde'
        }).then((res) => {
          console.log('*****RESPUESTA DEL SWAL',res);
          if (res.value) {
            this.router.navigate(['suscripcion', resp.id]);
          }                    
        });
      }
      else if(resp.ok == "ok" && resp.dias > 16){
        this.router.navigate(['suscripcion', resp.id]);
      }      
      else{

      }

    }, err => {
      Swal.fire({
        icon: 'error',
        title: 'Operación fallida',
        text: 'No se a podido validar con éxito sus datos por favor intentelo mas tarde'
      });
      this.loginService.cerrarSesion();
      this.router.navigate(['']);
    });
  }

  //metodos para validacion de pago

  public fecha(): string {
    const fechahoy = formatDate(new Date(Date.now()), 'yyyy-MM-dd', 'en');
    return fechahoy;

  }

  /*public validarDiaDePago(): boolean {

    if (this._fecha == null || this._fecha == "") {
      //this.cargarFecha();
    }
    console.log('************FECHA RECUPERADO2',this._fecha);
    if (this.compararFechas(this._fecha, this.fecha()) > 15) {
      return true;
    }
    else {
      return false;
    }

  }

  public diasDesdeUltimoPago(): number {
    console.log('************FECHA RECUPERADO3',this._fecha);
    if (this._fecha == null || this._fecha == "") {
      return 0;
    }
    else {
      const dias = this.compararFechas(this._fecha, this.fecha());
      return dias;
    }

  }

  public compararFechas(f1: string, f2: string): number {

    const araryFinicio = f1.split('-');
    const arrayFfin = f2.split('-');

    const fecha1 = Date.UTC(+araryFinicio[0], +araryFinicio[1] - 1, +araryFinicio[2]);
    const fecha2 = Date.UTC(+arrayFfin[0], +arrayFfin[1] - 1, +arrayFfin[2]);
    const diferencia = fecha2 - fecha1;
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    return dias;

  }*/

  /*public cargarFecha(): void {
    this.pagoService.obtenerUltimoPago(this.loginService.usuario.id).subscribe(resp => {
      this._fecha = resp.fecha;
    }, err => {
      this._fecha = "";
    });
  }  */

}
