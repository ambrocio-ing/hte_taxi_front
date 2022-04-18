import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import Swal from 'sweetalert2';
import { MapboxserviceService } from '../../mapbox-model-cliente/mapboxservice.service';
import { LoginService } from '../../servicio-conexion/login/login.service';
import { URL_BACKEND } from '../../sistema/config/config';
import { SMCliente } from '../../socket_modelo/smcliente/smcliente';
import { SMServicioTaxi } from '../../socket_modelo/smserviciotaxi/smserviciotaxi';
import { SMTaxista } from '../../socket_modelo/smtaxista/smtaxista';
import { SMUbicacion } from '../../socket_modelo/smubicacion/smubicacion';
import { Ubicacion } from '../../socket_modelo/ubicacion/ubicacion';
import { VigilanteService } from './vigilante.service';
import { TaxistaService } from '../../servicio-conexion/taxista/taxista.service';

@Component({
  selector: 'app-int-taxista',
  templateUrl: './int-taxista.component.html',
  styleUrls: ['./int-taxista.component.css']
})

export class IntTaxistaComponent implements OnInit, OnDestroy {

  @ViewChild('asPrecio1') asprecio1!: ElementRef;
  //@ViewChild('asTable1') astable1!: ElementRef;
  //@ViewChild('asTr1') astr1!: ElementRef;

  @ViewChild('asPrecio2') asprecio2!: ElementRef;
  //@ViewChild('asTable2') astable2!: ElementRef;
  //@ViewChild('asTr2') astr2!: ElementRef;

  @ViewChild('asPrecio3') asprecio3!: ElementRef;
  //@ViewChild('asTable3') astable3!: ElementRef;
  //@ViewChild('asTr3') astr3!: ElementRef;

  @ViewChild('asPrecio4') asprecio4!: ElementRef;
  //@ViewChild('asTable4') astable4!: ElementRef;
  //@ViewChild('asTr4') astr4!: ElementRef;

  @ViewChild('asPrecio5') asprecio5!: ElementRef;
  //@ViewChild('asTable5') astable5!: ElementRef;
  //@ViewChild('asTr5') astr5!: ElementRef;

  private client!: Client;
  conectado: boolean = false;

  smsubicacion: SMUbicacion = new SMUbicacion();
  idtaxista!: number;
  nombreUsuario!: string;

  //ranking_smservicios:SMServicioTaxi[] = [];

  url_backend: string = URL_BACKEND + "/taxista";
  url_backend_cli: string = URL_BACKEND + "/cliente/obtener/imagen";

  smservicioTaxi1: SMServicioTaxi = new SMServicioTaxi();
  smservicioTaxi2: SMServicioTaxi = new SMServicioTaxi();
  smservicioTaxi3: SMServicioTaxi = new SMServicioTaxi();
  smservicioTaxi4: SMServicioTaxi = new SMServicioTaxi();
  smservicioTaxi5: SMServicioTaxi = new SMServicioTaxi();

  estadoConfirmacion1: boolean = false;
  estadoConfirmacion2: boolean = false;
  estadoConfirmacion3: boolean = false;
  estadoConfirmacion4: boolean = false;
  estadoConfirmacion5: boolean = false;

  estadoAceptar: boolean = false;

  mensaje1!: string;
  mensaje2!: string;
  mensaje3!: string;
  mensaje4!: string;
  mensaje5!: string;

  resaltar1!: string;
  resaltar2!: string;
  resaltar3!: string;
  resaltar4!: string;
  resaltar5!: string;

  minuto1!: number;
  segundo1!: number;

  minuto2!: number;
  segundo2!: number;

  minuto3!: number;
  segundo3!: number;

  minuto4!: number;
  segundo4!: number;

  minuto5!: number;
  segundo5!: number;

  smservicioTaxiSeleccionado!: SMServicioTaxi;
  estadoModalMapa: boolean = false;
  estadoModalPerfil: boolean = false;

  enviar1: boolean = false;
  enviar2: boolean = false;
  enviar3: boolean = false;
  enviar4: boolean = false;
  enviar5: boolean = false;  

  smservicioTaxis: SMServicioTaxi[] = [];
  mensajeServicios!: string;

  smservicioEnCurso: SMServicioTaxi = new SMServicioTaxi();
  posicion: any = null;

  visibleEditarPerfil:boolean = false;

  constructor(private router: Router,
    private mapboxService: MapboxserviceService, public loginService: LoginService,
    private vigilante: VigilanteService, private renderer: Renderer2,
    private taxService: TaxistaService) {

    this.idtaxista = loginService.usuario.id;
    this.formarNombre();
    this.getLocation();
    this.crearNuevos();

  }

  ngOnDestroy(): void {
    this.client.deactivate();
  }

  ngOnInit(): void {

    if (this.loginService.isAuthenticate()) {
      if (this.loginService.validarRol('ROLE_CABBIE') == false) {
        this.loginService.cerrarSesion();
        this.router.navigate(['']);
      }
    }
    else {
      this.loginService.cerrarSesion();
      this.router.navigate(['']);
    }

    this.client = new Client();
    this.client.webSocketFactory = () => {
      return new SockJS("http://localhost:8080/taxi_sock");
    }

    this.client.onConnect = (frame) => {
      console.log('taxista conectado ' + this.client.connected + ' : ' + frame);

      //permanece a la escucha de la peticion de los clientes sobre taxistas cercanos
      this.client.subscribe('/staxi/pet_ubicacion', (event) => {
        const ubicacion: SMUbicacion = JSON.parse(event.body) as SMUbicacion;
        console.log('****Respuesta en taxista', ubicacion);
        console.log('****COORDENADAS DE TAXISTA', this.smsubicacion);

        if (ubicacion.idcliente != 0 && ubicacion != null && this.loginService.isDisponible()) {
          let coords: number[] = [];
          coords.push(-77.2059918);
          coords.push(-11.4909882);
          coords.push(ubicacion.origen_lng);
          coords.push(ubicacion.origen_lat); 

          this.mapboxService.validarDistancia(coords).subscribe(resp => {
            console.log('RESPUESTA CON LA DISTANCIA', resp);
            if (resp[0] <= 3) {

              //si el taxista esta a menos de 3 km envia su ubicacion al cliente
              ubicacion.idtaxista = this.loginService.usuario.id;
              ubicacion.origen_lng = 0;
              ubicacion.origen_lat = 0;
              this.client.publish({ destination: '/app/respuesta_ubicacion', body: JSON.stringify(ubicacion) });
            }

          }, err => {
            console.log(err);
          });
        }

      });

      //Operacion ----> 2 llega la notificacion de servicio
      this.client.subscribe('/staxi/nuevo_servicio/' + this.loginService.usuario.id, (event) => {
        const smservicioTaxi: SMServicioTaxi = JSON.parse(event.body) as SMServicioTaxi;
        console.log('NUEVA PETICION DE SERVICIO****', smservicioTaxi);
        if (smservicioTaxi.estado == "Pedido" && this.loginService.isDisponible()) {

          this.asignarServicios(smservicioTaxi);

        }
        else if (smservicioTaxi.estado == "Cancelado") {
          this.cancelarServicio(smservicioTaxi);
        }

      });

      //notifica la confirmacion del cliente
      //Operacion ---> 4
      this.client.subscribe('/staxi/confirmado/' + this.idtaxista, (event) => {
        const smservicioTaxi: SMServicioTaxi = JSON.parse(event.body) as SMServicioTaxi;

        if (smservicioTaxi.estado == "Aceptado") {
          this.notificarConfirmacion(smservicioTaxi);
        }
        else if (smservicioTaxi.estado == "Cancelado") {
          this.notificarCancelacion(smservicioTaxi);
        }
        else {

        }

      });

      //Operacion --> 6 inicio de taxi
      this.client.subscribe('/staxi/ok_taxi/' + this.loginService.usuario.dni, (event) => {
        const smservicioTaxi: SMServicioTaxi = JSON.parse(event.body) as SMServicioTaxi;
        if (smservicioTaxi.estado == "Iniciado") {

          this.notificarOk(smservicioTaxi);
        }
      });

      //Operacion de cancelacion en caso de error
      this.client.subscribe('/staxi/inicio_error/' + this.loginService.usuario.dni, (event) => {
        const smservicioTaxi: SMServicioTaxi = JSON.parse(event.body) as SMServicioTaxi;
        this.errorFinal(smservicioTaxi);
      });

      //Cualquier error
      this.client.subscribe('/staxi/error_tax/' + this.idtaxista, (event) => {
        const smservicioTaxi: SMServicioTaxi = JSON.parse(event.body) as SMServicioTaxi;

        this.errorDeServidor(smservicioTaxi);

      });    

      //cuando el pasajero cancela el taxi
      this.client.subscribe('/staxi/taxi_cancelado/' + this.idtaxista, (event) => {
        const id = +event.body;
        if (id == this.smservicioEnCurso.idstaxi) {
          Swal.fire({
            icon: 'info',
            title: 'Taxi cancelado',
            text: 'El pasajero acaba de cancelar el servicio, por favor refresque y espere una solicitud'
          });

          this.loginService.estado("Disponible");
          this.smservicioEnCurso = new SMServicioTaxi();
          this.smservicioEnCurso.taxista = new SMTaxista();
          this.smservicioEnCurso.cliente = new SMCliente();
          
          this.taxService.historial(this.idtaxista).subscribe(datos => {
            this.smservicioTaxis = datos;
            this.mensajeServicios = "";
          }, err => {
            this.mensajeServicios = "Sin datos que mostrar";
          });
        }

      });  

      this.conectado = true;

      //notifica a los clientes que un taxista se acaba de conectar
      this.smsubicacion.idtaxista = this.idtaxista;
      this.smsubicacion.origen_lng = -77.2059918;
      this.smsubicacion.origen_lat = -11.4909882;
      this.client.publish({ destination: '/app/nuevo_conectado', body: JSON.stringify(this.smsubicacion) });

    }

    this.client.activate();

    this.client.onDisconnect = (frame) => {
      this.conectado = false;
    }

    this.taxService.historial(this.idtaxista).subscribe(datos => {
      this.smservicioTaxis = datos;
      this.mensajeServicios = "";

      if (this.verificarEstadoTaxi() == false) {
        this.loginService.estado("Disponible");
      }
      else {
        const indice = this.smservicioTaxis.find(x => x.estado == "Iniciado");
        if (indice != null && indice != undefined) {
          this.smservicioEnCurso = indice;
        }
        this.loginService.estado("Ocupado");
      }

    }, err => {
      this.loginService.estado("Disponible");
      this.mensajeServicios = "Sin datos que mostrar";
    });

    this.vigilante.consultar_Pago();

  }



  errorDeServidor(smservicioTaxi: SMServicioTaxi): void {

    if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxi1.taxista.idtaxista) {
      this.vaciar1();
    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxi2.taxista.idtaxista) {
      this.vaciar2();
    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxi3.taxista.idtaxista) {
      this.vaciar3();
    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxi4.taxista.idtaxista) {
      this.vaciar4();
    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxi5.taxista.idtaxista) {
      this.vaciar5();
    }

  }

  errorFinal(smservicioTaxi: SMServicioTaxi): void {

    if (this.smservicioTaxis[0].idstaxi == smservicioTaxi.idstaxi) {
      Swal.fire({
        icon: 'warning',
        title: 'Ocurrio un error al validar el taxi iniciado',
        text: 'El taxi solicitado recientemente será quitado de la lista por favor mantengase a la espera de otra solicitud'
      });
      this.taxService.historial(this.idtaxista).subscribe(datos => {
        this.smservicioTaxis = datos;
        this.mensajeServicios = "";
      }, err => {
        this.mensajeServicios = "Sin datos que mostrar";
      });
    }

  }

  notificarConfirmacion(smservicioTaxi: SMServicioTaxi): void {

    if (smservicioTaxi.idstaxi == this.smservicioTaxi1.idstaxi) {
      this.mensaje1 = "Taxi confirmado responda pronto";
      this.vigilante.guardarEstadoServicio(1, "Aceptado");
      this.fijarTimer111(this.smservicioTaxi1.idstaxi);
      this.estadoConfirmacion1 = true;
    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxi2.idstaxi) {
      this.mensaje2 = "Taxi confirmado responda pronto";
      this.vigilante.guardarEstadoServicio(2, "Aceptado");
      this.fijarTimer222(this.smservicioTaxi2.idstaxi);
      this.estadoConfirmacion2 = true;
    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxi3.idstaxi) {
      this.mensaje3 = "Taxi confirmado responda pronto";
      this.vigilante.guardarEstadoServicio(3, "Aceptado");
      this.fijarTimer333(this.smservicioTaxi3.idstaxi);
      this.estadoConfirmacion3 = true;
    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxi4.idstaxi) {
      this.mensaje4 = "Taxi confirmado responda pronto";
      this.vigilante.guardarEstadoServicio(4, "Aceptado");
      this.fijarTimer444(this.smservicioTaxi4.idstaxi);
      this.estadoConfirmacion4 = true;
    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxi5.idstaxi) {
      this.mensaje5 = "Taxi confirmado responda pronto";
      this.vigilante.guardarEstadoServicio(5, "Aceptado");
      this.fijarTimer555(this.smservicioTaxi5.idstaxi);
      this.estadoConfirmacion5 = true;
    }

  }

  notificarCancelacion(smservicioTaxi: SMServicioTaxi): void {
    if (smservicioTaxi.idstaxi == this.smservicioTaxi1.idstaxi) {
      this.mensaje1 = smservicioTaxi.cliente.nombre + " acaba de cancelar, cancelando...";
      this.vigilante.guardarEstadoServicio(1, "Cancelado");
      setTimeout(() => {
        this.vaciar1();
      }, 5000);

    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxi2.idstaxi) {
      this.mensaje2 = smservicioTaxi.cliente.nombre + " acaba de cancelar, cancelando...";
      this.vigilante.guardarEstadoServicio(2, "Cancelado");
      setTimeout(() => {
        this.vaciar2();
      }, 5000);
    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxi3.idstaxi) {
      this.mensaje3 = smservicioTaxi.cliente.nombre + " acaba de cancelar, cancelando...";
      this.vigilante.guardarEstadoServicio(3, "Cancelado");
      setTimeout(() => {
        this.vaciar3();
      }, 5000);
    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxi4.idstaxi) {
      this.mensaje4 = smservicioTaxi.cliente.nombre + " acaba de cancelar, cancelando...";
      this.vigilante.guardarEstadoServicio(4, "Cancelado");
      setTimeout(() => {
        this.vaciar4();
      }, 5000);
    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxi5.idstaxi) {
      this.mensaje5 = smservicioTaxi.cliente.nombre + " acaba de cancelar, cancelando...";
      this.vigilante.guardarEstadoServicio(5, "Cancelado");
      setTimeout(() => {
        this.vaciar5();
      }, 5000);
    }
  }

  notificarOk(smservicioTaxi: SMServicioTaxi) {
    if (smservicioTaxi.idstaxi == this.smservicioTaxi1.idstaxi) {
      this.mensaje1 = "Agregando servicio a su historial";
      this.vigilante.guardarEstadoServicio(1, "Iniciado");

    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxi2.idstaxi) {
      this.mensaje2 = "Agregando servicio a su historial";
      this.vigilante.guardarEstadoServicio(2, "Iniciado");

    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxi3.idstaxi) {
      this.mensaje3 = "Agregando servicio a su historial";
      this.vigilante.guardarEstadoServicio(3, "Iniciado");

    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxi4.idstaxi) {
      this.mensaje4 = "Agregando servicio a su historial";
      this.vigilante.guardarEstadoServicio(4, "Iniciado");

    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxi5.idstaxi) {
      this.mensaje5 = "Agregando servicio a su historial";
      this.vigilante.guardarEstadoServicio(5, "Iniciado");

    }

    this.taxService.historial(this.idtaxista).subscribe(datos => {
      this.smservicioTaxis = datos;
      this.mensajeServicios = "";
      this.loginService.estado("Ocupado");
      this.vaciar1();
      this.vaciar2();
      this.vaciar3();
      this.vaciar4();
      this.vaciar5();

      const indice = this.smservicioTaxis.find(x => x.estado == "Iniciado");
      if (indice != null && indice != undefined) {
        this.smservicioEnCurso = indice;
      }

    }, err => {
      this.loginService.estado("Disponible");
      this.mensajeServicios = "Sin datos que mostrar";
      //OPeracion --> 7 cancelar en caso de error
      smservicioTaxi.estado = "Error";
      this.client.publish({ destination: '/app/error_inicio', body: JSON.stringify(smservicioTaxi) });

      if (smservicioTaxi.idstaxi == this.smservicioTaxi1.idstaxi) {
        this.mensaje1 = "Ocurrio un error cancelando...";
        this.vigilante.guardarEstadoServicio(1, "Cancelado");
        this.vaciar1();

      }
      else if (smservicioTaxi.idstaxi == this.smservicioTaxi2.idstaxi) {
        this.mensaje2 = "Ocurrio un error cancelando...";
        this.vigilante.guardarEstadoServicio(2, "Cancelado");
        this.vaciar2();

      }
      else if (smservicioTaxi.idstaxi == this.smservicioTaxi3.idstaxi) {
        this.mensaje3 = "Ocurrio un error cancelando...";
        this.vigilante.guardarEstadoServicio(3, "Cancelado");
        this.vaciar3();

      }
      else if (smservicioTaxi.idstaxi == this.smservicioTaxi4.idstaxi) {
        this.mensaje4 = "Ocurrio un error cancelando...";
        this.vigilante.guardarEstadoServicio(4, "Cancelado");
        this.vaciar4();

      }
      else if (smservicioTaxi.idstaxi == this.smservicioTaxi5.idstaxi) {
        this.mensaje5 = "Ocurrio un error cancelando...";
        this.vigilante.guardarEstadoServicio(5, "Cancelado");
        this.vaciar5();
      }
    });

  }

  //devolver el precio del taxi --Operacion --> 3
  aceptarPedido1(): void {
    console.log('************LISTO PARA CONFIRMAR', this.smservicioTaxi1);

    this.smservicioTaxi1.estado = "Confirmado";    

    if (this.smservicioTaxi1.precio > 0) {
      this.vigilante.guardarEstadoServicio(1, "Confirmado");
      //hacer publish      
      //devolver el precio del taxi --Operacion --> 3
      this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi1) });
      this.mensaje1 = "Precio confirmado";

      const ap = this.asprecio1.nativeElement;
      this.renderer.setAttribute(ap, 'readonly', 'true');
      this.enviar1 = true;
      this.fijarTimer11(this.smservicioTaxi1.idstaxi);

    }
    else {
      Swal.fire({
        icon: 'info',
        title: 'Datos incompletos',
        text: 'Es importante que ingrese precio, para que el pasajero tome una desición'
      });
    }
  }

  rechazarPedido1(): void {
    console.log('************LISTO PARA RECHAZAR', this.smservicioTaxi1);
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el posible pasajero será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Rechazar',
      cancelButtonText: 'No, Rechazar'
    }).then((resp) => {
      if (resp.value) {
        this.mensaje1 = "Cancelando...";
        this.smservicioTaxi1.estado = "Cancelado";
        this.vigilante.guardarEstadoServicio(1, "Rechazado");
        //hacer publihs
        this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi1) });
        //console.log('************LISTO PARA RECHAZAR', this.smservicioTaxi1);
        this.vaciar1();
      }
      else {

      }
    });
  }

  //Operacion --> 5
  aceptarTaxi1(): void {

    this.vigilante.guardarEstadoServicio(1, "ok");
    this.smservicioTaxi1.estado = "Iniciado";
    this.client.publish({ destination: '/app/taxi_ok', body: JSON.stringify(this.smservicioTaxi1) });
    this.resaltar1 = "si";
    this.mensaje1 = "Validando servicio";
    this.minuto1 = 0;
    this.segundo1 = 0;

    const interval_segundo111 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(1) == "ok") {
        if (this.segundo1 == 0 && this.minuto1 == 0) {
          //this.minuto1--;
          this.segundo1 = 30;

        }
        else {
          if (this.segundo1 > 0) {
            this.segundo1--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo111);
      if (this.vigilante.obtenerEstadoServicio(1) == "ok") {

        this.mensaje1 = "Sin respuesta, cancelando...";
        this.vaciar1();

      }

    }, 30000);

  }

  rechazarTaxi1(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el posible pasajero será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Rechazar',
      cancelButtonText: 'No, Rechazar'
    }).then((resp) => {
      if (resp.value) {
        this.mensaje1 = "Cancelando...";
        this.smservicioTaxi1.estado = "Canccelado";
        this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi1) });
        this.vigilante.guardarEstadoServicio(1, "Rechazado");
        this.vaciar1();
      }
      else {

      }
    });
  }

  aceptarPedido2(): void {
    console.log('************LISTO PARA CONFIRMAR 2', this.smservicioTaxi2);

    this.smservicioTaxi2.estado = "Confirmado";   

    if (this.smservicioTaxi2.precio > 0) {

      this.vigilante.guardarEstadoServicio(2, "Confirmado");
      //hacer publish
      //devolver el precio del taxi --Operacion --> 3
      this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi2) });
      this.mensaje2 = "Precio confirmado";

      const ap = this.asprecio2.nativeElement;
      this.renderer.setAttribute(ap, 'readonly', 'true');
      this.enviar2 = true;
      this.fijarTimer22(this.smservicioTaxi2.idstaxi);

    }
    else {
      Swal.fire({
        icon: 'info',
        title: 'Datos incompletos',
        text: 'Es importante que ingrese precio, para que el pasajero tome una desición'
      });
    }
  }

  rechazarPedido2(): void {
    console.log('************LISTO PARA RECHAZAR 2', this.smservicioTaxi2);
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el posible pasajero será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Rechazar',
      cancelButtonText: 'No, Rechazar'
    }).then((resp) => {
      if (resp.value) {
        this.mensaje2 = "Cancelando...";
        this.smservicioTaxi2.estado = "Cancelado";
        this.vigilante.guardarEstadoServicio(2, "Rechazado");
        //hacer publihs
        this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi2) });

        this.vaciar2();
      }
      else {

      }
    });
  }

  aceptarTaxi2(): void {
    this.vigilante.guardarEstadoServicio(2, "ok");
    this.smservicioTaxi2.estado = "Iniciado";
    this.client.publish({ destination: '/app/taxi_ok', body: JSON.stringify(this.smservicioTaxi2) });

    this.resaltar2 = "si";
    this.mensaje2 = "Validando servicio";
    this.minuto2 = 0;
    this.segundo2 = 0;

    const interval_segundo222 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(2) == "ok") {
        if (this.segundo2 == 0 && this.minuto2 == 0) {
          //this.minuto1--;
          this.segundo2 = 30;

        }
        else {
          if (this.segundo2 > 0) {
            this.segundo2--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo222);
      if (this.vigilante.obtenerEstadoServicio(2) == "ok") {

        this.mensaje2 = "Sin respuesta, cancelando...";
        this.vaciar2();
      }

    }, 30000);
  }

  rechazarTaxi2(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el posible pasajero será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Rechazar',
      cancelButtonText: 'No, Rechazar'
    }).then((resp) => {
      if (resp.value) {
        this.mensaje2 = "Cancelando...";
        this.vigilante.guardarEstadoServicio(2, "Rechazado");
        this.smservicioTaxi2.estado = "Canccelado";
        this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi2)});
        this.vaciar2();
      }
      else {

      }
    });
  }

  aceptarPedido3(): void {
    console.log('************LISTO PARA CONFIRMAR 3', this.smservicioTaxi3);

    this.smservicioTaxi3.estado = "Confirmado";   
    if (this.smservicioTaxi3.precio > 0) {
      //hacer publish
      this.vigilante.guardarEstadoServicio(3, "Confirmado");
      //devolver el precio del taxi --Operacion --> 3
      this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi3) });
      this.mensaje3 = "Precio confirmado";

      const ap = this.asprecio3.nativeElement;
      this.renderer.setAttribute(ap, 'readonly', 'true');
      this.enviar3 = true;
      this.fijarTimer33(this.smservicioTaxi3.idstaxi);

    }
    else {
      Swal.fire({
        icon: 'info',
        title: 'Datos incompletos',
        text: 'Es importante que ingrese precio, para que el pasajero tome una desición'
      });
    }
  }

  rechazarPedido3(): void {
    console.log('************LISTO PARA RECHAZAR 3', this.smservicioTaxi3);
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el posible pasajero será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Rechazar',
      cancelButtonText: 'No, Rechazar'
    }).then((resp) => {
      if (resp.value) {
        this.mensaje3 = "Cancelando...";
        this.smservicioTaxi3.estado = "Cancelado";
        this.vigilante.guardarEstadoServicio(3, "Rechazado");
        //hacer publihs
        this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi3) });

        this.vaciar3();
      }
      else {

      }
    });
  }

  aceptarTaxi3(): void {
    this.vigilante.guardarEstadoServicio(3, "ok");
    this.smservicioTaxi3.estado = "Iniciado";
    this.client.publish({ destination: '/app/taxi_ok', body: JSON.stringify(this.smservicioTaxi3) });
    this.resaltar3 = "si";
    this.mensaje3 = "Validando servicio";
    this.minuto3 = 0;
    this.segundo3 = 0;

    const interval_segundo333 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(1) == "ok") {
        if (this.segundo3 == 0 && this.minuto3 == 0) {
          //this.minuto1--;
          this.segundo3 = 30;

        }
        else {
          if (this.segundo3 > 0) {
            this.segundo3--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo333);
      if (this.vigilante.obtenerEstadoServicio(3) == "ok") {

        this.mensaje3 = "Sin respuesta, cancelando...";
        this.vaciar3();

      }

    }, 30000);
  }

  rechazarTaxi3(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el posible pasajero será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Rechazar',
      cancelButtonText: 'No, Rechazar'
    }).then((resp) => {
      if (resp.value) {
        this.mensaje3 = "Cancelando...";
        this.vigilante.guardarEstadoServicio(3, "Rechazado");
        this.smservicioTaxi3.estado = "Canccelado";
        this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi3) });
        this.vaciar3();
      }
      else {

      }
    });
  }

  aceptarPedido4(): void {
    console.log('************LISTO PARA CONFIRMAR 4', this.smservicioTaxi4);

    this.smservicioTaxi4.estado = "Confirmado";    

    if (this.smservicioTaxi4.precio > 0) {
      //hacer publish
      this.vigilante.guardarEstadoServicio(4, "Confirmado");
      //devolver el precio del taxi --Operacion --> 3
      this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi4) });
      this.mensaje4 = "Precio confirmado";

      const ap = this.asprecio4.nativeElement;
      this.renderer.setAttribute(ap, 'readonly', 'true');
      this.enviar4 = true;
      this.fijarTimer44(this.smservicioTaxi4.idstaxi);

    }
    else {
      Swal.fire({
        icon: 'info',
        title: 'Datos incompletos',
        text: 'Es importante que ingrese precio, para que el pasajero tome una desición'
      });
    }
  }

  rechazarPedido4(): void {
    console.log('************LISTO PARA RECHAZAR 4', this.smservicioTaxi4);
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el posible pasajero será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Rechazar',
      cancelButtonText: 'No, Rechazar'
    }).then((resp) => {
      if (resp.value) {
        this.mensaje4 = "Cancelando...";
        this.smservicioTaxi4.estado = "Cancelado";
        this.vigilante.guardarEstadoServicio(4, "Rechazado");
        //hacer publihs
        this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi4) });

        this.vaciar4();
      }
      else {

      }
    });
  }

  aceptarTaxi4(): void {
    this.vigilante.guardarEstadoServicio(4, "ok");
    this.smservicioTaxi4.estado = "Iniciado";
    this.client.publish({ destination: '/app/taxi_ok', body: JSON.stringify(this.smservicioTaxi4) });

    this.resaltar4 = "si";
    this.mensaje4 = "Validando servicio";
    this.minuto4 = 0;
    this.segundo4 = 0;

    const interval_segundo444 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(4) == "ok") {
        if (this.segundo4 == 0 && this.minuto4 == 0) {
          //this.minuto1--;
          this.segundo4 = 30;

        }
        else {
          if (this.segundo4 > 0) {
            this.segundo4--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo444);
      if (this.vigilante.obtenerEstadoServicio(4) == "ok") {

        this.mensaje4 = "Sin respuesta, cancelando...";
        this.vaciar4();

      }

    }, 30000);
  }

  rechazarTaxi4(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el posible pasajero será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Rechazar',
      cancelButtonText: 'No, Rechazar'
    }).then((resp) => {
      if (resp.value) {
        this.mensaje4 = "Cancelando...";
        this.vigilante.guardarEstadoServicio(4, "Rechazado");
        this.smservicioTaxi4.estado = "Canccelado";
        this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi4)});
        this.vaciar4();
      }
      else {

      }
    });
  }

  aceptarPedido5(): void {
    console.log('************LISTO PARA CONFIRMAR 5', this.smservicioTaxi5);

    this.smservicioTaxi5.estado = "Confirmado";   
    if (this.smservicioTaxi5.precio > 0) {
      //hacer publish
      this.vigilante.guardarEstadoServicio(5, "Confirmado");
      //devolver el precio del taxi --Operacion --> 3
      this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi5) });
      this.mensaje5 = "Precio confirmado";

      const ap = this.asprecio5.nativeElement;
      this.renderer.setAttribute(ap, 'readonly', 'true');
      this.enviar5 = true;
      this.fijarTimer55(this.smservicioTaxi5.idstaxi);

    }
    else {
      Swal.fire({
        icon: 'info',
        title: 'Datos incompletos',
        text: 'Es importante que ingrese precio, para que el pasajero tome una desición'
      });
    }
  }

  rechazarPedido5(): void {
    console.log('************LISTO PARA RECHAZAR 5', this.smservicioTaxi5);
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el posible pasajero será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Rechazar',
      cancelButtonText: 'No, Rechazar'
    }).then((resp) => {
      if (resp.value) {
        this.mensaje5 = "Cancelando...";
        this.smservicioTaxi5.estado = "Cancelado";
        this.vigilante.guardarEstadoServicio(5, "Rechazado");
        //hacer publihs
        this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi5) });

        this.vaciar5();
      }
      else {

      }
    });
  }

  aceptarTaxi5(): void {
    this.vigilante.guardarEstadoServicio(5, "ok");
    this.smservicioTaxi5.estado = "Iniciado";
    this.client.publish({ destination: '/app/taxi_ok', body: JSON.stringify(this.smservicioTaxi5) });

    this.resaltar5 = "si";
    this.mensaje5 = "Validando servicio";
    this.minuto5 = 0;
    this.segundo5 = 0;

    const interval_segundo555 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(5) == "ok") {
        if (this.segundo5 == 0 && this.minuto5 == 0) {
          //this.minuto1--;
          this.segundo5 = 30;

        }
        else {
          if (this.segundo5 > 0) {
            this.segundo5--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo555);
      if (this.vigilante.obtenerEstadoServicio(5) == "ok") {

        this.mensaje5 = "Sin respuesta, cancelando...";
        this.vaciar5();

      }

    }, 30000);
  }

  rechazarTaxi5(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el posible pasajero será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Rechazar',
      cancelButtonText: 'No, Rechazar'
    }).then((resp) => {
      if (resp.value) {
        this.mensaje5 = "Cancelando...";
        this.vigilante.guardarEstadoServicio(5, "Rechazado");
        this.smservicioTaxi5.estado = "Canccelado";
        this.client.publish({ destination: '/app/strespuesta_pedido', body: JSON.stringify(this.smservicioTaxi5)});
        this.vaciar5();
      }
      else {

      }
    });
  }

  verDetalle(smservicioTaxi: SMServicioTaxi) {
    this.estadoModalMapa = true;
    this.smservicioTaxiSeleccionado = smservicioTaxi;

    const coordenadas = [
      this.smsubicacion.origen_lng,
      this.smsubicacion.origen_lat,
      smservicioTaxi.ubicacion.origen_lng,
      smservicioTaxi.ubicacion.origen_lat
    ];

    this.mapboxService.validarDistancia(coordenadas).subscribe(resp => {      

      if(smservicioTaxi.idstaxi == this.smservicioTaxi1.idstaxi){
        this.smservicioTaxi1.ubicacion.distanciafinal = resp[0];
        this.smservicioTaxi1.ubicacion.tiempofinal = resp[1];
      }
      else if(smservicioTaxi.idstaxi == this.smservicioTaxi2.idstaxi){
        this.smservicioTaxi2.ubicacion.distanciafinal = resp[0];
        this.smservicioTaxi2.ubicacion.tiempofinal = resp[1];
      }
      else if(smservicioTaxi.idstaxi == this.smservicioTaxi3.idstaxi){
        this.smservicioTaxi3.ubicacion.distanciafinal = resp[0];
        this.smservicioTaxi3.ubicacion.tiempofinal = resp[1];
      }
      else if(smservicioTaxi.idstaxi == this.smservicioTaxi4.idstaxi){
        this.smservicioTaxi4.ubicacion.distanciafinal = resp[0];
        this.smservicioTaxi4.ubicacion.tiempofinal = resp[1];
      }
      else if(smservicioTaxi.idstaxi == this.smservicioTaxi5.idstaxi){
        this.smservicioTaxi5.ubicacion.distanciafinal = resp[0];
        this.smservicioTaxi5.ubicacion.tiempofinal = resp[1];
      }

    });

  }

  irPerfil2() {
    this.estadoModalPerfil = true;
  }

  conectar(): void {
    this.client.activate();
  }

  desconectar(): void {
    this.client.publish({ destination: '/app/desconectado', body: this.idtaxista.toString() });
  }

  getLocation() {

    this.mapboxService.getPosition().then(resp => {
      this.smsubicacion.origen_lng = resp.lng;
      this.smsubicacion.origen_lat = resp.lat;

    }).catch(e => {
      console.log("error : ", e);
    });

    this.posicion = setInterval(() => {
      this.mapboxService.getPosition().then(resp => {
        this.smsubicacion.origen_lng = resp.lng;
        this.smsubicacion.origen_lat = resp.lat;

      }).catch(e => {
        console.log("error : ", e);
      })

    }, 10000);
  }

  cerrarSesion(): void {
    this.desconectar();
    this.loginService.cerrarSesion();
    this.client.deactivate();
    Swal.fire({
      icon: 'success',
      title: 'Vuelva pronto',
      text: 'Sesión cerrada con éxito'
    }).then(resp => {
      this.router.navigate(['']);
    });
  }

  formarNombre() {
    const nombre = this.loginService.usuario.nombre + " " + this.loginService.usuario.apellidos;
    const arrayNom = nombre.split(" ");
    this.nombreUsuario = arrayNom[0];

    for (let i = 1; i < arrayNom.length; i++) {
      this.nombreUsuario += " " + arrayNom[i][0].toUpperCase() + ".";
    }

  }

  fijarTimer1(id: number): void {
    this.minuto1 = 5;
    this.segundo1 = 0;

    const interval_segundo = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(1) == "Procesando") {
        if (this.segundo1 == 0 && this.minuto1 > 0) {
          this.minuto1--;
          this.segundo1 = 59;

        }
        else {
          if (this.minuto1 >= 0) {

            this.segundo1--;

          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo);
      if (this.vigilante.obtenerEstadoServicio(1) == "Procesando"
        && id == this.smservicioTaxi1.idstaxi) {

        this.mensaje1 = "Sin respuesta, cancelando...";
        this.vaciar1();
      }

    }, 300000);

  }

  fijarTimer2(id: number): void {

    this.minuto2 = 5;
    this.segundo2 = 0;

    const interval_segundo2 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(2) == "Procesando") {
        if (this.segundo2 == 0 && this.minuto2 > 0) {
          this.minuto2--;
          this.segundo2 = 59;

        }
        else {
          if (this.minuto2 >= 0) {
            this.segundo2--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo2);
      if (this.vigilante.obtenerEstadoServicio(2) == "Procesando" &&
        id == this.smservicioTaxi2.idstaxi) {

        this.mensaje2 = "Sin respuesta, cancelando...";
        this.vaciar2();

      }

      console.log('interval')
    }, 300000);

  }

  fijarTimer3(id: number): void {

    this.minuto3 = 5;
    this.segundo3 = 0;

    const interval_segundo3 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(3) == "Procesando") {

        if (this.segundo3 == 0 && this.minuto3 > 0) {
          this.minuto3--;
          this.segundo3 = 59;

        }
        else {
          if (this.minuto3 >= 0) {
            this.segundo3--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo3);

      if (this.vigilante.obtenerEstadoServicio(3) == "Procesando" &&
        id == this.smservicioTaxi3.idstaxi) {

        this.mensaje3 = "Sin respuesta, cancelando...";
        this.vaciar3();
      }


      console.log('interval')
    }, 300000);

  }

  fijarTimer4(id: number): void {

    this.minuto4 = 5;
    this.segundo4 = 0;

    const interval_segundo4 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(4) == "Procesando") {
        if (this.segundo4 == 0 && this.minuto4 > 0) {
          this.minuto4--;
          this.segundo4 = 59;

        }
        else {
          if (this.minuto4 >= 0) {
            this.segundo4--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo4);

      if (this.vigilante.obtenerEstadoServicio(4) == "Procesando" &&
        id == this.smservicioTaxi4.idstaxi) {

        this.mensaje4 = "Sin respuesta, cancelando...";
        this.vaciar4();

      }
      console.log('interval')
    }, 300000);

  }

  fijarTimer5(id: number): void {

    this.minuto5 = 5;
    this.segundo5 = 0;

    const interval_segundo5 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(5) == "Procesando") {
        if (this.segundo5 == 0 && this.minuto5 > 0) {
          this.minuto5--;
          this.segundo5 = 59;

        }
        else {
          if (this.minuto5 >= 0) {
            this.segundo5--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo5);

      if (this.vigilante.obtenerEstadoServicio(5) == "Procesando" &&
        id == this.smservicioTaxi5.idstaxi) {

        this.mensaje5 = "Sin respuesta, cancelando...";
        this.vaciar5();

      }

      console.log('interval')
    }, 300000);

  }

  asignarServicios(smservicioTaxi: SMServicioTaxi): void {

    if (this.smservicioTaxi1.idstaxi == null || this.smservicioTaxi1.idstaxi == undefined) {

      this.smservicioTaxi1 = smservicioTaxi;
      this.vigilante.guardarEstadoServicio(1, "Procesando");
      this.mensaje1 = "Enviar el precio antes de que termine el tiempo";
      this.fijarTimer1(this.smservicioTaxi1.idstaxi);
      this.enviar1 = false;
    }
    else if (this.smservicioTaxi2.idstaxi == null || this.smservicioTaxi2.idstaxi == undefined) {

      this.smservicioTaxi2 = smservicioTaxi;
      this.vigilante.guardarEstadoServicio(2, "Procesando");
      this.mensaje2 = "Enviar el precio antes de que termine el tiempo";
      this.fijarTimer2(this.smservicioTaxi1.idstaxi);
      this.enviar2 = false;

    }
    else if (this.smservicioTaxi3.idstaxi == null || this.smservicioTaxi3.idstaxi == undefined) {

      this.smservicioTaxi3 = smservicioTaxi;
      this.vigilante.guardarEstadoServicio(3, "Procesando");
      this.mensaje3 = "Enviar el precio antes de que termine el tiempo";
      this.fijarTimer3(this.smservicioTaxi3.idstaxi);
      this.enviar3 = false;

    }
    else if (this.smservicioTaxi4.idstaxi == null || this.smservicioTaxi4.idstaxi == undefined) {

      this.smservicioTaxi4 = smservicioTaxi;
      this.vigilante.guardarEstadoServicio(4, "Procesando");
      this.mensaje4 ="Enviar el precio antes de que termine el tiempo";
      this.fijarTimer4(this.smservicioTaxi4.idstaxi);
      this.enviar4 = false;

    }
    else if (this.smservicioTaxi5.idstaxi == null || this.smservicioTaxi5.idstaxi == undefined) {

      this.smservicioTaxi5 = smservicioTaxi
      this.vigilante.guardarEstadoServicio(5, "Procesando");
      this.mensaje5 ="Enviar el precio antes de que termine el tiempo";
      this.fijarTimer5(this.smservicioTaxi5.idstaxi);
      this.enviar5 = false;

    }
    else {
      console.log('NUEVA PETICION PERO NO HAY ESPACIO', smservicioTaxi);

    }
  }

  cancelarServicio(smservicioTaxi: SMServicioTaxi): void {

    if (this.smservicioTaxi1.cliente.idcliente == smservicioTaxi.cliente.idcliente) {

      this.mensaje1 = "Cancelando...";
      this.vigilante.guardarEstadoServicio(1, "Cancelado");
      this.vaciar1();

    }
    else if (this.smservicioTaxi2.cliente.idcliente == smservicioTaxi.cliente.idcliente) {

      this.mensaje2 = "Cancelando...";
      this.vigilante.guardarEstadoServicio(2, "Cancelado");
      this.vaciar2();

    }
    else if (this.smservicioTaxi3.cliente.idcliente == smservicioTaxi.cliente.idcliente) {

      this.mensaje3 = "Cancelando...";
      this.vigilante.guardarEstadoServicio(3, "Cancelado");
      this.vaciar3();

    }
    else if (this.smservicioTaxi4.cliente.idcliente == smservicioTaxi.cliente.idcliente) {

      this.mensaje4 = "Cancelando...";
      this.vigilante.guardarEstadoServicio(4, "Cancelado");
      this.vaciar4();

    }
    else if (this.smservicioTaxi5.cliente.idcliente == smservicioTaxi.cliente.idcliente) {

      this.mensaje5 = "Cancelando...";
      this.vigilante.guardarEstadoServicio(1, "Cancelado");
      this.vaciar5();

    }
    else {
      console.log('LLEGO LO QUE SEA', smservicioTaxi);

    }
  }

  fijarTimer11(id: number): void {
    this.minuto1 = 2;
    this.segundo1 = 0;

    const interval_segundo = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(1) == "Confirmado") {
        if (this.segundo1 == 0 && this.minuto1 > 0) {
          this.minuto1--;
          this.segundo1 = 59;

        }
        else {
          if (this.minuto1 >= 0) {

            this.segundo1--;

          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo);
      if (this.vigilante.obtenerEstadoServicio(1) == "Confirmado"
        && id == this.smservicioTaxi1.idstaxi) {

        this.mensaje1 = "Sin respuesta, cancelando...";
        this.vaciar1();
      }

    }, 120000);

  }

  fijarTimer22(id: number): void {

    this.minuto2 = 2;
    this.segundo2 = 0;

    const interval_segundo2 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(2) == "Confirmado") {
        if (this.segundo2 == 0 && this.minuto2 > 0) {
          this.minuto2--;
          this.segundo2 = 59;

        }
        else {
          if (this.minuto2 >= 0) {
            this.segundo2--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo2);
      if (this.vigilante.obtenerEstadoServicio(2) == "Confirmado" &&
        id == this.smservicioTaxi2.idstaxi) {

        this.mensaje2 = "Sin respuesta, cancelando...";
        this.vaciar2();

      }

      console.log('interval')
    }, 120000);

  }

  fijarTimer33(id: number): void {

    this.minuto3 = 2;
    this.segundo3 = 0;

    const interval_segundo3 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(3) == "Confirmado") {

        if (this.segundo3 == 0 && this.minuto3 > 0) {
          this.minuto3--;
          this.segundo3 = 59;

        }
        else {
          if (this.minuto3 >= 0) {
            this.segundo3--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo3);

      if (this.vigilante.obtenerEstadoServicio(3) == "Confirmado" &&
        id == this.smservicioTaxi3.idstaxi) {

        this.mensaje5 = "Sin respuesta, cancelando...";
        this.vaciar3();

      }


      console.log('interval')
    }, 120000);

  }

  fijarTimer44(id: number): void {

    this.minuto4 = 2;
    this.segundo4 = 0;

    const interval_segundo4 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(4) == "Confirmado") {
        if (this.segundo4 == 0 && this.minuto4 > 0) {
          this.minuto4--;
          this.segundo4 = 59;

        }
        else {
          if (this.minuto4 >= 0) {
            this.segundo4--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo4);

      if (this.vigilante.obtenerEstadoServicio(4) == "Confirmado" &&
        id == this.smservicioTaxi4.idstaxi) {

        this.mensaje4 = "Sin respuesta, cancelando...";
        this.vaciar4();

      }
      console.log('interval')
    }, 120000);

  }

  fijarTimer55(id: number): void {

    this.minuto5 = 2;
    this.segundo5 = 0;

    const interval_segundo5 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(5) == "Confirmado") {
        if (this.segundo5 == 0 && this.minuto5 > 0) {
          this.minuto5--;
          this.segundo5 = 59;

        }
        else {
          if (this.minuto5 >= 0) {
            this.segundo5--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo5);

      if (this.vigilante.obtenerEstadoServicio(5) == "Confirmado" &&
        id == this.smservicioTaxi5.idstaxi) {

        this.mensaje5 = "Sin respuesta, cancelando...";
        this.vaciar5();

      }

      console.log('interval')
    }, 120000);

  }

  crearNuevos(): void {

    this.smservicioTaxi1.cliente = new SMCliente();
    this.smservicioTaxi1.taxista = new SMTaxista();
    this.smservicioTaxi1.ubicacion = new Ubicacion();

    this.smservicioTaxi2.cliente = new SMCliente();
    this.smservicioTaxi2.taxista = new SMTaxista();
    this.smservicioTaxi2.ubicacion = new Ubicacion();

    this.smservicioTaxi3.cliente = new SMCliente();
    this.smservicioTaxi3.taxista = new SMTaxista();
    this.smservicioTaxi3.ubicacion = new Ubicacion();

    this.smservicioTaxi4.cliente = new SMCliente();
    this.smservicioTaxi4.taxista = new SMTaxista();
    this.smservicioTaxi4.ubicacion = new Ubicacion();

    this.smservicioTaxi5.cliente = new SMCliente();
    this.smservicioTaxi5.taxista = new SMTaxista();
    this.smservicioTaxi5.ubicacion = new Ubicacion();

    this.smservicioEnCurso.taxista = new SMTaxista();
    this.smservicioEnCurso.cliente = new SMCliente();
    this.smservicioEnCurso.ubicacion = new Ubicacion();
  }

  fijarTimer111(id: number): void {
    this.minuto1 = 0;
    this.segundo1 = 0;

    const interval_segundo = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(1) == "Aceptado") {
        if (this.segundo1 == 0 && this.minuto1 == 0) {
          //this.minuto1--;
          this.segundo1 = 30;

        }
        else {
          if (this.segundo1 > 0) {
            this.segundo1--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo);
      if (this.vigilante.obtenerEstadoServicio(1) == "Aceptado" &&
        id == this.smservicioTaxi1.idstaxi) {

        this.mensaje1 = "Sin respuesta, cancelando...";
        this.vaciar1();

      }
      console.log('interval')
    }, 30000);

  }

  fijarTimer222(id: number): void {

    this.minuto2 = 0;
    this.segundo2 = 0;

    const interval_segundo2 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(2) == "Aceptado") {
        if (this.segundo2 == 0 && this.minuto2 == 0) {
          //this.minuto2--;
          this.segundo2 = 30;

        }
        else {
          if (this.segundo2 > 0) {
            this.segundo2--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo2);
      if (this.vigilante.obtenerEstadoServicio(2) == "Aceptado" &&
        id == this.smservicioTaxi2.idstaxi) {

        this.mensaje2 = "Sin respuesta, cancelando...";
        this.vaciar2();

      }
      console.log('interval')
    }, 30000);

  }

  fijarTimer333(id: number): void {

    this.minuto3 = 0;
    this.segundo3 = 0;

    const interval_segundo3 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(3) == "Aceptado") {
        if (this.segundo3 == 0 && this.minuto3 == 0) {
          //this.minuto3--;
          this.segundo3 = 30;

        }
        else {
          if (this.segundo3 > 0) {
            this.segundo3--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo3);
      if (this.vigilante.obtenerEstadoServicio(3) == "Aceptado" &&
        id == this.smservicioTaxi3.idstaxi) {

        this.mensaje3 = "Sin respuesta, cancelando...";
        this.vaciar3();

      }
      console.log('interval')
    }, 30000);

  }

  fijarTimer444(id: number): void {

    this.minuto4 = 0;
    this.segundo4 = 0;

    const interval_segundo44 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(4) == "Aceptado") {
        if (this.segundo4 == 0 && this.minuto4 == 0) {
          //this.minuto4--;
          this.segundo4 = 30;

        }
        else {
          if (this.segundo4 > 0) {
            this.segundo4--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo44);
      if (this.vigilante.obtenerEstadoServicio(4) == "Aceptado" &&
        id == this.smservicioTaxi4.idstaxi) {

        this.mensaje4 = "Sin respuesta, cancelando...";
        this.vaciar4();

      }
      console.log('interval')
    }, 30000);

  }

  fijarTimer555(id: number): void {

    this.minuto5 = 0;
    this.segundo5 = 0;

    const interval_segundo5 = setInterval(() => {
      if (this.vigilante.obtenerEstadoServicio(5) == "Aceptado") {
        if (this.segundo5 == 0 && this.minuto5 == 0) {
          //this.minuto5--;
          this.segundo5 = 30;

        }
        else {
          if (this.segundo5 > 0) {
            this.segundo5--;
          }
        }
      }

    }, 1000);

    setTimeout(() => {
      clearInterval(interval_segundo5);
      if (this.vigilante.obtenerEstadoServicio(5) == "Aceptado" &&
        id == this.smservicioTaxi5.idstaxi) {

        this.mensaje5 = "Sin respuesta, cancelando...";
        this.vaciar5();

      }
      console.log('interval')
    }, 30000);

  }

  vaciar1(): void {
    this.resaltar1 = "no";
    this.smservicioTaxi1 = new SMServicioTaxi();
    this.smservicioTaxi1.taxista = new SMTaxista();
    this.smservicioTaxi1.cliente = new SMCliente();
    this.smservicioTaxi1.ubicacion = new Ubicacion();
    this.enviar1 = false;
    this.estadoConfirmacion1 = false;
    this.estadoAceptar = false;

  }

  vaciar2(): void {
    this.resaltar2 = "no";
    this.smservicioTaxi2 = new SMServicioTaxi();
    this.smservicioTaxi2.taxista = new SMTaxista();
    this.smservicioTaxi2.cliente = new SMCliente();
    this.smservicioTaxi2.ubicacion = new Ubicacion();
    this.enviar2 = false;
    this.estadoConfirmacion2 = false;
    this.estadoAceptar = false;

  }

  vaciar3(): void {
    this.resaltar3 = "no";
    this.smservicioTaxi3 = new SMServicioTaxi();
    this.smservicioTaxi3.taxista = new SMTaxista();
    this.smservicioTaxi3.cliente = new SMCliente();
    this.smservicioTaxi3.ubicacion = new Ubicacion();
    this.enviar3 = false;
    this.estadoConfirmacion3 = false;
    this.estadoAceptar = false;
  }

  vaciar4(): void {
    this.resaltar4 = "no";
    this.smservicioTaxi4 = new SMServicioTaxi();
    this.smservicioTaxi4.taxista = new SMTaxista();
    this.smservicioTaxi4.cliente = new SMCliente();
    this.smservicioTaxi4.ubicacion = new Ubicacion();
    this.enviar4 = false;
    this.estadoConfirmacion4 = false;
    this.estadoAceptar = false;

  }

  vaciar5(): void {
    this.resaltar5 = "no";
    this.smservicioTaxi5 = new SMServicioTaxi();
    this.smservicioTaxi5.taxista = new SMTaxista();
    this.smservicioTaxi5.cliente = new SMCliente();
    this.smservicioTaxi5.ubicacion = new Ubicacion();
    this.enviar5 = false;
    this.estadoConfirmacion5 = false;
    this.estadoAceptar = false;
  }  

  finalizar(servicios: SMServicioTaxi) : void {
    servicios.estado = "Finalizado";
    this.client.publish({destination : '/app/finalizado_taxista', body : JSON.stringify(servicios)});
    Swal.fire({
      icon: 'success',
      title: 'Servicio finalizado',
      text: 'Servicio finalizado con éxito, en caso de que no se aplique  vuelva a ejecutar'
    }).then(res => {
      this.taxService.historial(this.idtaxista).subscribe(datos => {
        this.smservicioTaxis = datos;
        this.mensajeServicios = ""; 
        this.smservicioEnCurso = new SMServicioTaxi();
        this.smservicioEnCurso.taxista = new SMTaxista();
        this.smservicioEnCurso.cliente = new SMCliente();
        this.smservicioEnCurso.ubicacion = new Ubicacion();
        this.loginService.estado("Disponible");
      }, err => {
        this.mensajeServicios = "Sin datos que mostrar";
      });
    });
  }

  cancelarPendiente(smservicio: SMServicioTaxi) {
    Swal.fire({
      icon: 'question',
      title: 'Seguro que desea cancelar???',
      text: 'Esta intentado cancelar el servicio por favor confirme',
      showCancelButton: true,
      confirmButtonText: 'Si, cancelar',
      cancelButtonText: 'No, cancelar'
    }).then(resp => {
      if (resp.value) {
        smservicio.estado = "Cancelado";
        this.client.publish({ destination: '/app/cancelado_taxista', body: JSON.stringify(smservicio) });
        this.loginService.estado("Disponible");
        this.smservicioEnCurso = new SMServicioTaxi();
        this.smservicioEnCurso.taxista = new SMTaxista();
        this.smservicioEnCurso.cliente = new SMCliente();

        this.taxService.historial(this.idtaxista).subscribe(datos => {
          this.smservicioTaxis = datos;
          this.mensajeServicios = "";
        }, err => {
          this.mensajeServicios = "Sin datos que mostrar";
        });
      }
    });
  }

  ver(servicios: SMServicioTaxi) {
    this.smservicioTaxiSeleccionado = servicios;
    this.estadoModalMapa = true;
  }

  ocupado(): void {
    //this.client.deactivate();
    this.loginService.estado("Ocupado");
  }

  disponible(): void {
    //this.client.activate();
    if (this.verificarEstadoTaxi() == false) {
      this.loginService.estado("Disponible");
    }
    else {
      Swal.fire({
        icon: 'info',
        text: 'Tienes Servicio de taxi sin finalizar'
      });
    }

  }

  pagar(): void {

    this.client.deactivate();
    this.router.navigate(['suscripcion']);

  }

  verificarEstadoTaxi(): boolean {
    const indice = this.smservicioTaxis.find(x => x.estado == "Iniciado");
    if (indice != null && indice != undefined) {
      return true;
    }
    else {
      return false;
    }
  }

  editarPerfil() : void {
    this.visibleEditarPerfil = true;
  }

}
