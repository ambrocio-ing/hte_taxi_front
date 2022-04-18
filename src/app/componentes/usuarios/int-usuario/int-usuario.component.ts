import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Client } from '@stomp/stompjs'
import { SMUbicacion } from '../../socket_modelo/smubicacion/smubicacion';
import * as SockJS from 'sockjs-client';
import { LoginService } from '../../servicio-conexion/login/login.service';
import { SMServicioTaxi } from '../../socket_modelo/smserviciotaxi/smserviciotaxi';
import { MapboxserviceService } from '../../mapbox-model-cliente/mapboxservice.service';
import { SMTaxista } from '../../socket_modelo/smtaxista/smtaxista';
import { URL_BACKEND } from '../../sistema/config/config';
import Swal from 'sweetalert2';
import { Ubicacion } from '../../socket_modelo/ubicacion/ubicacion';
import { SMCliente } from '../../socket_modelo/smcliente/smcliente';
import { Vigilante2Service } from './vigilante2.service';
import { ClienteService } from '../../servicio-conexion/cliente/cliente.service';

@Component({
  selector: 'app-int-usuario',
  templateUrl: './int-usuario.component.html',
  styleUrls: ['./int-usuario.component.css']
})

export class IntUsuarioComponent implements OnInit {

  private client!: Client;
  conectado: boolean = false;
  smubicacion: SMUbicacion = new SMUbicacion();
  ubicacion: Ubicacion = new Ubicacion();
  idcliente!: number;
  url_backend: string = URL_BACKEND + "/cliente";
  url_backend_taxista = URL_BACKEND + "/taxista/obtener/imagen";
  nombreUsuario!: string;

  smtaxistaSelecionado!: SMTaxista;
  estadoDetalle: boolean = false;

  visibleMapa: boolean = false;

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

  estadoTaxista1: boolean = false;
  estadoTaxista2: boolean = false;
  estadoTaxista3: boolean = false;
  estadoTaxista4: boolean = false;
  estadoTaxista5: boolean = false;

  estadoRespuesta1: boolean = false;
  estadoRespuesta2: boolean = false;
  estadoRespuesta3: boolean = false;
  estadoRespuesta4: boolean = false;
  estadoRespuesta5: boolean = false;

  estadoSolicitar1: boolean = true;
  estadoSolicitar2: boolean = true;
  estadoSolicitar3: boolean = true;
  estadoSolicitar4: boolean = true;
  estadoSolicitar5: boolean = true;

  smservicioTaxiPedido1: SMServicioTaxi = new SMServicioTaxi();
  smservicioTaxiPedido2: SMServicioTaxi = new SMServicioTaxi();
  smservicioTaxiPedido3: SMServicioTaxi = new SMServicioTaxi();
  smservicioTaxiPedido4: SMServicioTaxi = new SMServicioTaxi();
  smservicioTaxiPedido5: SMServicioTaxi = new SMServicioTaxi();

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

  estado_perfil: boolean = false;
  estadoAceptar: boolean = false;

  smservicioTaxis: SMServicioTaxi[] = [];
  mensajeServicios!: string;

  estadoRe: boolean = false;
  posicion: any = null;

  visibleEditarPerfil:boolean = false;

  constructor(private router: Router, public loginService: LoginService,
    private mapboxService: MapboxserviceService, public vigilante: Vigilante2Service,
    private renderer: Renderer2, private cliService: ClienteService) {

    this.idcliente = this.loginService.usuario.id;
    this.formarNombre();
    this.location();

    this.crearNuevos();

  }

  ngOnInit(): void {

    /*if(this.loginService.isAuthenticate()){
      if(this.loginService.validarRol('ROLE_CLIENT') == false){
        this.loginService.cerrarSesion();
        this.router.navigate(['']);
      }
    }
    else{
      this.loginService.cerrarSesion();
      this.router.navigate(['']);
    }*/

    //this.smtaxistas.length = 0;
    this.client = new Client();
    this.client.webSocketFactory = () => {
      return new SockJS("http://localhost:8080/taxi_sock");
    }

    this.client.activate();

    this.client.onConnect = (frame) => {
      this.conectado = true;
      console.log("cliente conectado " + this.client.connected + " : " + frame);

      //recibe todas las ubicaciones de los coductores
      this.client.subscribe('/staxi/resp_ubicacion/' + this.idcliente, event => {
        const taxisdisponibles = JSON.parse(event.body) as SMTaxista;

        if (taxisdisponibles.estado != "Sin estado") {
          //this.smtaxistas.push(taxisdisponibles);
          console.log('RECORRIDO FINAL', taxisdisponibles);
          this.asignarTaxistas(taxisdisponibles);
        }

      });

      //estará vigilante de nuevas conexiones por parte de los taxistas
      this.client.subscribe('/staxi/taxi_nuevo', event => {
        const smservicioTaxi: SMServicioTaxi = JSON.parse(event.body) as SMServicioTaxi;
        console.log('****SE DETECTO NUEVO ACCESO', smservicioTaxi);

        if (smservicioTaxi.estado != "Sin coordenadas") {
          let coords: number[] = [];
          coords.push(smservicioTaxi.ubicacion.origen_lng);
          coords.push(smservicioTaxi.ubicacion.origen_lat);
          coords.push(this.smubicacion.origen_lng);
          coords.push(this.smubicacion.origen_lat);

          if (this.validarTaxistas() == false) {

            this.mapboxService.validarDistancia(coords).subscribe(resp => {

              if (resp[0] <= 3) {

                this.asignarTaxistas(smservicioTaxi.taxista);

              }
            });
          }
        }

      });

      //estará vigilante de que un taxista se desconecte de la app
      //meter dentro de un boton
      this.client.subscribe('/staxi/desconec', event => {
        console.log('DESCONECTADO UN TAXISTA');
        const idtax = event.body;
        if (idtax != null && +idtax > 0) {

          if (+idtax == this.smservicioTaxiPedido1.taxista.idtaxista) {

            this.smservicioTaxiPedido1.taxista = new SMTaxista();

          }
          else if (+idtax == this.smservicioTaxiPedido2.taxista.idtaxista) {

            this.smservicioTaxiPedido2.taxista = new SMTaxista();

          }
          else if (+idtax == this.smservicioTaxiPedido3.taxista.idtaxista) {

            this.smservicioTaxiPedido3.taxista = new SMTaxista();

          }
          else if (+idtax == this.smservicioTaxiPedido4.taxista.idtaxista) {

            this.smservicioTaxiPedido4.taxista = new SMTaxista();

          }
          else if (+idtax == this.smservicioTaxiPedido5.taxista.idtaxista) {

            this.smservicioTaxiPedido5.taxista = new SMTaxista();

          }

        }

      });

      //este endpoint trae el precio del taxi
      //Operacion --> 3 trae cotizacion o precio del taxi
      this.client.subscribe('/staxi/respuesta_pedido/' + this.idcliente, event => {

        const smservicioTaxi: SMServicioTaxi = JSON.parse(event.body) as SMServicioTaxi;
        console.log('***LLEGO LA RESPUESTA CON PEDIDO****', smservicioTaxi);

        if (smservicioTaxi.estado == "Confirmado" && smservicioTaxi.precio > 0) {

          this.notificarConfirmacion(smservicioTaxi);

        }
        else if (smservicioTaxi.estado == "Cancelado") {
          this.notificarRechazo(smservicioTaxi);
        }
        else {

        }

      });

      //notificar ok agrega el servicio al historial
      //Operacion --> 5
      this.client.subscribe('/staxi/ok_taxi/' + this.loginService.usuario.dni, (event) => {
        const smservicioTaxi: SMServicioTaxi = JSON.parse(event.body) as SMServicioTaxi;
        if (smservicioTaxi.estado == "Iniciado") {

          this.notificarOk(smservicioTaxi);

        }
      });

      //Notifica en caso de error en el momento final
      this.client.subscribe('/staxi/inicio_error/' + this.loginService.usuario.dni, (event) => {
        const smservicioTaxi: SMServicioTaxi = JSON.parse(event.body) as SMServicioTaxi;
        this.errorFinal(smservicioTaxi);
      });

      //Cualquier error
      this.client.subscribe('/staxi/error_cli/' + this.idcliente, (event) => {
        const smservicioTaxi: SMServicioTaxi = JSON.parse(event.body) as SMServicioTaxi;

        this.errorDeServidor(smservicioTaxi);

      });

      //el taxista cancela el taxi
      this.client.subscribe('/staxi/taxi_cancel/' + this.idcliente, (event) => {
        const id = +event.body;
        if (id == this.smservicioTaxis[0].idstaxi) {
          Swal.fire({
            icon: 'info',
            title: 'Taxi cancelado',
            text: 'El taxista acaba de cancelar el servicio, por favor refresque y solicite otro conductor'
          });

          this.loginService.estado("Disponible");

          this.cliService.historial(this.idcliente).subscribe(datos => {
            this.smservicioTaxis = datos;
            this.mensajeServicios = "";
          }, err => {
            this.mensajeServicios = "Sin datos que mostrar";
          });
        }

      });

      //el taxista finaliza el servicio de taxi
      this.client.subscribe('/staxi/taxi_finalizado/' + this.idcliente, (event) => {
        const id = +event.body;
        const encontrar = this.smservicioTaxis.find(x => x.idstaxi == id);
        if( encontrar != undefined &&  id == encontrar.idstaxi){
          Swal.fire({
            icon: 'info',
            title: 'Servicio de taxi finalizado',
            text: 'Esta intentado cancelar el servicio por favor confirme'
          }).then(resp => {
            this.loginService.estado("Disponible");
            this.cliService.historial(this.idcliente).subscribe(datos => {
              this.smservicioTaxis = datos;
              this.mensajeServicios = "";
            }, err => {
              this.mensajeServicios = "Sin datos que mostrar";
            });
  
          });
        }       
      });

      //solicita las ubicaciones de los taxistas mas cercanos
      this.smubicacion.idcliente = this.loginService.usuario.id;
      this.client.publish({ destination: '/app/peticion_ubicacion', body: JSON.stringify(this.smubicacion) });

    }

    this.client.onDisconnect = (frame) => {
      this.conectado = false;
      console.log("cliente desconectado " + !this.client.connected + " : " + frame);
    }

    this.mapboxService.cbUbicacion.subscribe(dato => {
      console.log('******UBICACION****', dato);
      this.ubicacion = dato;
      this.vigilante.establecerUbicacion(this.ubicacion);
    });

    this.cliService.historial(this.idcliente).subscribe(datos => {
      this.smservicioTaxis = datos;
      this.mensajeServicios = "";
      if (this.verificarEstadoTaxi() == false) {
        this.loginService.estado("Disponible");
      }
      else {
        this.loginService.estado("Ocupado");
      }
    }, err => {
      this.loginService.estado("Disponible");
      this.mensajeServicios = "Sin datos que mostrar";
    });

  }

  errorDeServidor(smservicioTaxi: SMServicioTaxi): void {

    if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido1.taxista.idtaxista) {
      this.renovar1();
    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido2.taxista.idtaxista) {
      this.renovar2();
    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido3.taxista.idtaxista) {
      this.renovar3();
    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido4.taxista.idtaxista) {
      this.renovar4();
    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido5.taxista.idtaxista) {
      this.renovar5();
    }

  }

  errorFinal(smservicioTaxi: SMServicioTaxi): void {

    if (this.smservicioTaxis[0].idstaxi == smservicioTaxi.idstaxi) {
      Swal.fire({
        icon: 'warning',
        title: 'Ocurrio un error al validar el taxi iniciado',
        text: 'El taxi solicitado recientemente será quitado de la lista por favor solicite otro'
      });
      this.cliService.historial(this.idcliente).subscribe(datos => {
        this.smservicioTaxis = datos;
        this.mensajeServicios = "";
      }, err => {
        this.mensajeServicios = "Sin datos que mostrar";
      });
    }

  }

  notificarConfirmacion(smservicioTaxi: SMServicioTaxi): void {

    if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido1.taxista.idtaxista) {
      this.smservicioTaxiPedido1 = smservicioTaxi;
      this.estadoRespuesta1 = true;
      this.vigilante.guardarPedido(1, "Respuesta");
      this.mensaje1 = "Acepte o rechace";
      this.fijarTimer11(this.smservicioTaxiPedido1.taxista.idtaxista);

    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido2.taxista.idtaxista) {
      this.smservicioTaxiPedido2 = smservicioTaxi;
      this.estadoRespuesta2 = true;
      this.vigilante.guardarPedido(2, "Respuesta");
      this.mensaje2 = "Acepte o rechace";
      this.fijarTimer22(this.smservicioTaxiPedido2.taxista.idtaxista);

    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido3.taxista.idtaxista) {
      this.smservicioTaxiPedido3 = smservicioTaxi;
      this.estadoRespuesta3 = true;
      this.vigilante.guardarPedido(3, "Respuesta");
      this.mensaje3 = "Acepte o rechace";
      this.fijarTimer33(this.smservicioTaxiPedido3.taxista.idtaxista);

    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido4.taxista.idtaxista) {
      this.smservicioTaxiPedido4 = smservicioTaxi;
      this.estadoRespuesta4 = true;
      this.vigilante.guardarPedido(4, "Respuesta");
      this.mensaje4 = "Acepte o rechace";
      this.fijarTimer44(this.smservicioTaxiPedido4.taxista.idtaxista);

    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido5.taxista.idtaxista) {
      this.smservicioTaxiPedido5 = smservicioTaxi;
      this.estadoRespuesta5 = true;
      this.vigilante.guardarPedido(5, "Respuesta");
      this.mensaje5 = "Acepte o rechace";
      this.fijarTimer55(this.smservicioTaxiPedido5.taxista.idtaxista);
    }
  }

  notificarRechazo(smservicioTaxi: SMServicioTaxi): void {
    if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido1.taxista.idtaxista) {

      this.mensaje1 = smservicioTaxi.taxista.nombre + " acaba de cancelar";
      setTimeout(() => {
        this.renovar1();
      }, 3000);

    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido2.taxista.idtaxista) {
      this.mensaje2 = smservicioTaxi.taxista.nombre + " acaba de cancelar";
      setTimeout(() => {
        this.renovar2();
      }, 3000);

    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido3.taxista.idtaxista) {
      this.mensaje3 = smservicioTaxi.taxista.nombre + " acaba de cancelar";
      setTimeout(() => {
        this.renovar3();
      }, 3000);

    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido4.taxista.idtaxista) {
      this.mensaje4 = smservicioTaxi.taxista.nombre + " acaba de cancelar";
      setTimeout(() => {
        this.renovar4();
      }, 3000);

    }
    else if (smservicioTaxi.taxista.idtaxista == this.smservicioTaxiPedido5.taxista.idtaxista) {
      this.mensaje5 = smservicioTaxi.taxista.nombre + " acaba de cancelar";
      setTimeout(() => {
        this.renovar5();
      }, 3000);
    }
  }

  notificarOk(smservicioTaxi: SMServicioTaxi): void {

    if (smservicioTaxi.idstaxi == this.smservicioTaxiPedido1.idstaxi) {
      this.vigilante.guardarPedido(1, "Iniciado");
      this.mensaje1 = "Añadiendo servicio a su historial";

    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxiPedido2.idstaxi) {
      this.vigilante.guardarPedido(2, "Iniciado");
      this.mensaje2 = "Añadiendo servicio a su historial";

    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxiPedido3.idstaxi) {
      this.vigilante.guardarPedido(3, "Iniciado");
      this.mensaje3 = "Añadiendo servicio a su historial";

    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxiPedido4.idstaxi) {
      this.vigilante.guardarPedido(4, "Iniciado");
      this.mensaje4 = "Añadiendo servicio a su historial";

    }
    else if (smservicioTaxi.idstaxi == this.smservicioTaxiPedido5.idstaxi) {
      this.vigilante.guardarPedido(5, "Iniciado");
      this.mensaje5 = "Añadiendo servicio a su historial";
    }

    this.cliService.historial(this.idcliente).subscribe(datos => {
      this.smservicioTaxis = datos;
      this.mensajeServicios = "";
      this.loginService.estado("Ocupado");
      this.renovar1();
      this.renovar2();
      this.renovar3();
      this.renovar4();
      this.renovar5();

    }, err => {
      this.loginService.estado("Disponible");
      smservicioTaxi.estado = "Error";
      //Operacion --> 6 cancelar en caso de error
      this.client.publish({ destination: '/app/error_inicio', body: JSON.stringify(smservicioTaxi) });
      this.mensajeServicios = "Sin datos que mostrar";
      if (smservicioTaxi.idstaxi == this.smservicioTaxiPedido1.idstaxi) {

        this.vigilante.guardarPedido(1, "Cancelado");
        this.mensaje1 = "Ocurrio un error cancelando...";
        this.renovar1();

      }
      else if (smservicioTaxi.idstaxi == this.smservicioTaxiPedido2.idstaxi) {
        this.vigilante.guardarPedido(2, "Cancelado");
        this.mensaje2 = "Ocurrio un error cancelando...";
        this.renovar2();

      }
      else if (smservicioTaxi.idstaxi == this.smservicioTaxiPedido3.idstaxi) {
        this.vigilante.guardarPedido(3, "Cancelado");
        this.mensaje3 = "Ocurrio un error cancelando...";
        this.renovar3();

      }
      else if (smservicioTaxi.idstaxi == this.smservicioTaxiPedido4.idstaxi) {
        this.vigilante.guardarPedido(4, "Cancelado");
        this.mensaje4 = "Ocurrio un error cancelando...";
        this.renovar4();

      }
      else if (smservicioTaxi.idstaxi == this.smservicioTaxiPedido5.idstaxi) {
        this.vigilante.guardarPedido(5, "Cancelado");
        this.mensaje5 = "Ocurrio un error cancelando...";
        this.renovar5();
      }

    });

  }

  enviarPedido1(): void {
    if (this.validarUbicacion(this.ubicacion)) {

      this.smservicioTaxiPedido1.fecha = new Date(Date.now());
      this.smservicioTaxiPedido1.estado = "Pedido";
      this.smservicioTaxiPedido1.cliente.idcliente = this.loginService.usuario.id;
      this.smservicioTaxiPedido1.cliente.dni = this.loginService.usuario.dni;
      this.smservicioTaxiPedido1.precio = 0;
      this.smservicioTaxiPedido1.ubicacion = this.ubicacion;

      console.log('LISTO PARA SER ENVIADO', this.smservicioTaxiPedido1);
      this.estadoSolicitar1 = false;
      //hacer publish
      //aqui inicia el pedido(1)
      this.client.publish({ destination: "/app/stcrear", body: JSON.stringify(this.smservicioTaxiPedido1) });

      this.vigilante.guardarPedido(1, "Enviado");
      this.mensaje1 = "Solicitud enviada, no cerrar página";
      this.estadoTaxista1 = true;
      this.fijarTimer1(this.smservicioTaxiPedido1.taxista.idtaxista);

    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Datos imcompletos',
        text: 'Por favor defina una ruta'
      });
    }

  }

  cancelarPedido1(): void {
    this.mensaje1 = "Cancelando...";
    if (this.smservicioTaxiPedido1.idstaxi == null) {
      Swal.fire({
        icon: 'warning',
        title: 'Seguro que desea cancelar?',
        text: 'Si cancela, el taxista será quitado de la lista',
        showCancelButton: true,
        confirmButtonText: 'Si, Cancelar',
        cancelButtonText: 'No, Cancelar'
      }).then((resp) => {
        if (resp.value) {
          console.log('*****RESPUESTA AL CANCELAR', resp);
          this.smservicioTaxiPedido1.fecha = new Date(Date.now());
          this.smservicioTaxiPedido1.estado = "Cancelado";
          this.smservicioTaxiPedido1.cliente.idcliente = this.loginService.usuario.id;
          this.smservicioTaxiPedido1.cliente.dni = this.loginService.usuario.dni;
          this.smservicioTaxiPedido1.precio = 0;
          this.smservicioTaxiPedido1.ubicacion = this.ubicacion;

          //hacer publish
          this.client.publish({ destination: "/app/stcrear", body: JSON.stringify(this.smservicioTaxiPedido1) });

          this.vigilante.guardarPedido(1, "Cancelado");
          this.renovar1(); 
        }
        else {

        }
      });
    }
    else if (this.smservicioTaxiPedido1.idstaxi > 0) {
      this.rechazarPedido1();
    }

  }

  aceptarPedido1(): void {

    this.estadoAceptar = true;
    if (this.smservicioTaxiPedido1.estado == "Confirmado" && this.smservicioTaxiPedido1.precio > 0) {
      this.smservicioTaxiPedido1.estado = "Aceptado";
      this.client.publish({ destination: '/app/taxi_aceptado', body: JSON.stringify(this.smservicioTaxiPedido1) });
      this.mensaje1 = "Confirmación enviada";
      this.vigilante.guardarPedido(1, "Aceptado");
      this.fijarTimer111(this.smservicioTaxiPedido1.taxista.idtaxista);

      this.resaltar1 = "si";
      /*const table = this.astable1.nativeElement;
      const tr = this.astr1.nativeElement;

      this.renderer.addClass(table, 'stilo-modal');
      this.renderer.addClass(tr, 'wrapper2');*/
    }

  }

  rechazarPedido1(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el taxista será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Cancelar',
      cancelButtonText: 'No, Cancelar'
    }).then((resp) => {
      if (resp.value) {
        this.estadoAceptar = false;
        this.smservicioTaxiPedido1.estado = "Cancelado";
        this.client.publish({ destination: '/app/taxi_aceptado', body: JSON.stringify(this.smservicioTaxiPedido1) });
        this.renovar1();
        this.resaltar1 = "no";
        /*const table = this.astable1.nativeElement;
        const tr = this.astr1.nativeElement;

        this.renderer.removeClass(table, 'stilo-modal');
        this.renderer.removeClass(tr, 'wrapper2');*/
      }
      else {

      }
    });

  }

  //METODOS PARA PEDIDO 2
  enviarPedido2(): void {
    if (this.validarUbicacion(this.ubicacion)) {

      this.smservicioTaxiPedido2.fecha = new Date(Date.now());
      this.smservicioTaxiPedido2.estado = "Pedido";
      this.smservicioTaxiPedido2.cliente.idcliente = this.loginService.usuario.id;
      this.smservicioTaxiPedido2.cliente.dni = this.loginService.usuario.dni;
      this.smservicioTaxiPedido2.precio = 0;
      this.smservicioTaxiPedido2.ubicacion = this.ubicacion;

      console.log('LISTO PARA SER ENVIADO 2', this.smservicioTaxiPedido2);
      this.estadoSolicitar2 = false;
      //hacer publish
      //aqui inicia el pedido(1)
      this.client.publish({ destination: "/app/stcrear", body: JSON.stringify(this.smservicioTaxiPedido2) });

      this.vigilante.guardarPedido(2, "Enviado");
      this.mensaje2 = "Solicitud enviada, no cerrar página";
      this.estadoTaxista2 = true;
      this.fijarTimer2(this.smservicioTaxiPedido1.taxista.idtaxista);

    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Datos imcompletos',
        text: 'Por favor defina una ruta'
      });
    }

  }

  cancelarPedido2(): void {
    this.mensaje2 = "Cancelando...";
    if (this.smservicioTaxiPedido2.idstaxi == null) {
      Swal.fire({
        icon: 'warning',
        title: 'Seguro que desea cancelar?',
        text: 'Si cancela, el taxista será quitado de la lista',
        showCancelButton: true,
        confirmButtonText: 'Si, Cancelar',
        cancelButtonText: 'No, Cancelar'
      }).then((resp) => {
        if (resp.value) {
          console.log('*****RESPUESTA AL CANCELAR', resp);
          this.smservicioTaxiPedido2.fecha = new Date(Date.now());
          this.smservicioTaxiPedido2.estado = "Cancelado";
          this.smservicioTaxiPedido2.cliente.idcliente = this.loginService.usuario.id;
          this.smservicioTaxiPedido2.cliente.dni = this.loginService.usuario.dni;
          this.smservicioTaxiPedido2.precio = 0;
          this.smservicioTaxiPedido2.ubicacion = this.ubicacion;

          //hacer publish
          this.client.publish({ destination: "/app/stcrear", body: JSON.stringify(this.smservicioTaxiPedido2) });

          this.vigilante.guardarPedido(2, "Cancelado");
          this.renovar2();
        }
        else {

        }
      });
    }
    else if (this.smservicioTaxiPedido2.idstaxi > 0) {
      this.rechazarPedido2();
    }
  }

  aceptarPedido2(): void {
    this.estadoAceptar = true;
    if (this.smservicioTaxiPedido2.estado == "Confirmado" && this.smservicioTaxiPedido2.precio > 0) {
      this.smservicioTaxiPedido2.estado = "Aceptado";
      this.client.publish({ destination: '/app/taxi_aceptado', body: JSON.stringify(this.smservicioTaxiPedido2) });
      this.mensaje2 = "Confirmación enviada";
      this.vigilante.guardarPedido(2, "Aceptado");
      this.fijarTimer222(this.smservicioTaxiPedido2.taxista.idtaxista);
      this.resaltar2 = "si";
      /*const table = this.astable2.nativeElement;
      const tr = this.astr2.nativeElement;

      this.renderer.addClass(table, 'stilo-modal');
      this.renderer.addClass(tr, 'wrapper2');*/

    }
  }

  rechazarPedido2(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el taxista será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Cancelar',
      cancelButtonText: 'No, Cancelar'
    }).then((resp) => {
      if (resp.value) {
        this.estadoAceptar = false;
        this.smservicioTaxiPedido2.estado = "Cancelado";
        this.client.publish({ destination: '/app/taxi_aceptado', body: JSON.stringify(this.smservicioTaxiPedido2) });
        this.renovar2();
        this.resaltar2 = "no";
        /*const table = this.astable2.nativeElement;
        const tr = this.astr2.nativeElement;

        this.renderer.removeClass(table, 'stilo-modal');
        this.renderer.removeClass(tr, 'wrapper2');*/
      }
      else {

      }
    });
  }

  enviarPedido3(): void {
    if (this.validarUbicacion(this.ubicacion)) {

      this.smservicioTaxiPedido3.fecha = new Date(Date.now());
      this.smservicioTaxiPedido3.estado = "Pedido";
      this.smservicioTaxiPedido3.cliente.idcliente = this.loginService.usuario.id;
      this.smservicioTaxiPedido3.cliente.dni = this.loginService.usuario.dni;
      this.smservicioTaxiPedido3.precio = 0;
      this.smservicioTaxiPedido3.ubicacion = this.ubicacion;

      console.log('LISTO PARA SER ENVIADO 3', this.smservicioTaxiPedido3);
      this.estadoSolicitar3 = false;
      //hacer publish
      //aqui inicia el pedido(1)
      this.client.publish({ destination: "/app/stcrear", body: JSON.stringify(this.smservicioTaxiPedido3) });

      this.vigilante.guardarPedido(3, "Enviado");
      this.mensaje3 = "Solicitud enviada, no cerrar página";
      this.estadoTaxista3 = true;
      this.fijarTimer3(this.smservicioTaxiPedido3.taxista.idtaxista);

    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Datos imcompletos',
        text: 'Por favor defina una ruta'
      });
    }

  }

  cancelarPedido3(): void {
    this.mensaje3 = "Cancelando...";
    if (this.smservicioTaxiPedido3.idstaxi == null) {
      Swal.fire({
        icon: 'warning',
        title: 'Seguro que desea cancelar?',
        text: 'Si cancela, el taxista será quitado de la lista',
        showCancelButton: true,
        confirmButtonText: 'Si, Cancelar',
        cancelButtonText: 'No, Cancelar'
      }).then((resp) => {
        if (resp.value) {
          console.log('*****RESPUESTA AL CANCELAR', resp);
          this.smservicioTaxiPedido3.fecha = new Date(Date.now());
          this.smservicioTaxiPedido3.estado = "Cancelado";
          this.smservicioTaxiPedido3.cliente.idcliente = this.loginService.usuario.id;
          this.smservicioTaxiPedido3.cliente.dni = this.loginService.usuario.dni;
          this.smservicioTaxiPedido3.precio = 0;
          this.smservicioTaxiPedido3.ubicacion = this.ubicacion;

          //hacer publish
          this.client.publish({ destination: "/app/stcrear", body: JSON.stringify(this.smservicioTaxiPedido3) });

          this.vigilante.guardarPedido(3, "Cancelado");
          this.renovar3();
        }
        else {

        }
      });
    }
    else if (this.smservicioTaxiPedido3.idstaxi > 0) {
      this.rechazarPedido3();
    }
  }

  aceptarPedido3(): void {
    this.estadoAceptar = true;
    if (this.smservicioTaxiPedido3.estado == "Confirmado" && this.smservicioTaxiPedido3.precio > 0) {
      this.smservicioTaxiPedido3.estado = "Aceptado";
      this.client.publish({ destination: '/app/taxi_aceptado', body: JSON.stringify(this.smservicioTaxiPedido3) });
      this.mensaje3 = "Confirmación enviada";
      this.vigilante.guardarPedido(3, "Aceptado");
      this.fijarTimer333(this.smservicioTaxiPedido3.taxista.idtaxista);
      this.resaltar3 = "si";
      /*const table = this.astable3.nativeElement;
      const tr = this.astr3.nativeElement;

      this.renderer.addClass(table, 'stilo-modal');
      this.renderer.addClass(tr, 'wrapper2');*/
    }
  }

  rechazarPedido3(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el taxista será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Cancelar',
      cancelButtonText: 'No, Cancelar'
    }).then((resp) => {
      if (resp.value) {
        this.estadoAceptar = false;
        this.smservicioTaxiPedido3.estado = "Cancelado";
        this.client.publish({ destination: '/app/taxi_aceptado', body: JSON.stringify(this.smservicioTaxiPedido3) });
        this.renovar3();
        this.resaltar3 = "no";
        /*const table = this.astable3.nativeElement;
        const tr = this.astr3.nativeElement;

        this.renderer.removeClass(table, 'stilo-modal');
        this.renderer.removeClass(tr, 'wrapper2');*/
      }
      else {

      }
    });
  }

  enviarPedido4(): void {
    if (this.validarUbicacion(this.ubicacion)) {

      this.smservicioTaxiPedido4.fecha = new Date(Date.now());
      this.smservicioTaxiPedido4.estado = "Pedido";
      this.smservicioTaxiPedido4.cliente.idcliente = this.loginService.usuario.id;
      this.smservicioTaxiPedido4.cliente.dni = this.loginService.usuario.dni;
      this.smservicioTaxiPedido4.precio = 0;
      this.smservicioTaxiPedido4.ubicacion = this.ubicacion;

      console.log('LISTO PARA SER ENVIADO 4', this.smservicioTaxiPedido4);
      this.estadoSolicitar4 = false;
      //hacer publish
      //aqui inicia el pedido(1)
      this.client.publish({ destination: "/app/stcrear", body: JSON.stringify(this.smservicioTaxiPedido4) });

      this.vigilante.guardarPedido(4, "Enviado");
      this.mensaje4 = "Solicitud enviada, no cerrar página";
      this.estadoTaxista4 = true;
      this.fijarTimer4(this.smservicioTaxiPedido4.taxista.idtaxista);

    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Datos imcompletos',
        text: 'Por favor defina una ruta'
      });
    }

  }

  cancelarPedido4(): void {
    this.mensaje4 = "Cancelando...";
    if (this.smservicioTaxiPedido4.idstaxi == null) {
      Swal.fire({
        icon: 'warning',
        title: 'Seguro que desea cancelar?',
        text: 'Si cancela, el taxista será quitado de la lista',
        showCancelButton: true,
        confirmButtonText: 'Si, Cancelar',
        cancelButtonText: 'No, Cancelar'
      }).then((resp) => {
        if (resp.value) {
          console.log('*****RESPUESTA AL CANCELAR', resp);
          this.smservicioTaxiPedido4.fecha = new Date(Date.now());
          this.smservicioTaxiPedido4.estado = "Cancelado";
          this.smservicioTaxiPedido4.cliente.idcliente = this.loginService.usuario.id;
          this.smservicioTaxiPedido4.cliente.dni = this.loginService.usuario.dni;
          this.smservicioTaxiPedido4.precio = 0;
          this.smservicioTaxiPedido4.ubicacion = this.ubicacion;

          //hacer publish
          this.client.publish({ destination: "/app/stcrear", body: JSON.stringify(this.smservicioTaxiPedido4) });

          this.vigilante.guardarPedido(4, "Cancelado");
          this.renovar4();
        }
        else {

        }
      });
    }
    else if (this.smservicioTaxiPedido4.idstaxi > 0) {
      this.rechazarPedido4();
    }
  }

  aceptarPedido4(): void {
    this.estadoAceptar = true;
    if (this.smservicioTaxiPedido4.estado == "Confirmado" && this.smservicioTaxiPedido4.precio > 0) {
      this.smservicioTaxiPedido4.estado = "Aceptado";
      this.client.publish({ destination: '/app/taxi_aceptado', body: JSON.stringify(this.smservicioTaxiPedido4) });
      this.mensaje4 = "Confirmación enviada";
      this.vigilante.guardarPedido(4, "Aceptado");
      this.fijarTimer444(this.smservicioTaxiPedido4.taxista.idtaxista);
      this.resaltar4 = "si";
      /*const table = this.astable4.nativeElement;
      const tr = this.astr4.nativeElement;

      this.renderer.addClass(table, 'stilo-modal');
      this.renderer.addClass(tr, 'wrapper2');*/
    }
  }

  rechazarPedido4(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el taxista será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Cancelar',
      cancelButtonText: 'No, Cancelar'
    }).then((resp) => {
      if (resp.value) {
        this.estadoAceptar = false;
        this.smservicioTaxiPedido4.estado = "Cancelado";
        this.client.publish({ destination: '/app/taxi_aceptado', body: JSON.stringify(this.smservicioTaxiPedido4) });
        this.renovar4();
        this.resaltar4 = "no";
        /*const table = this.astable4.nativeElement;
        const tr = this.astr4.nativeElement;

        this.renderer.removeClass(table, 'stilo-modal');
        this.renderer.removeClass(tr, 'wrapper2');*/
      }
      else {

      }
    });
  }

  enviarPedido5(): void {
    if (this.validarUbicacion(this.ubicacion)) {

      this.smservicioTaxiPedido5.fecha = new Date(Date.now());
      this.smservicioTaxiPedido5.estado = "Pedido";
      this.smservicioTaxiPedido5.cliente.idcliente = this.loginService.usuario.id;
      this.smservicioTaxiPedido5.cliente.dni = this.loginService.usuario.dni;
      this.smservicioTaxiPedido5.precio = 0;
      this.smservicioTaxiPedido5.ubicacion = this.ubicacion;

      console.log('LISTO PARA SER ENVIADO5', this.smservicioTaxiPedido5);
      this.estadoSolicitar5 = false;
      //hacer publish
      //aqui inicia el pedido(1)
      this.client.publish({ destination: "/app/stcrear", body: JSON.stringify(this.smservicioTaxiPedido5) });

      this.vigilante.guardarPedido(5, "Enviado");
      this.mensaje5 = "Solicitud enviada, no cerrar página";
      this.estadoTaxista5 = true;
      this.fijarTimer5(this.smservicioTaxiPedido5.taxista.idtaxista);

    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Datos imcompletos',
        text: 'Por favor defina una ruta'
      });
    }

  }

  cancelarPedido5(): void {
    this.mensaje5 = "Cancelando...";
    if (this.smservicioTaxiPedido5.idstaxi == null) {
      Swal.fire({
        icon: 'warning',
        title: 'Seguro que desea cancelar?',
        text: 'Si cancela, el taxista será quitado de la lista',
        showCancelButton: true,
        confirmButtonText: 'Si, Cancelar',
        cancelButtonText: 'No, Cancelar'
      }).then((resp) => {
        if (resp.value) {
          console.log('*****RESPUESTA AL CANCELAR', resp);
          this.smservicioTaxiPedido5.fecha = new Date(Date.now());
          this.smservicioTaxiPedido5.estado = "Cancelado";
          this.smservicioTaxiPedido5.cliente.idcliente = this.loginService.usuario.id;
          this.smservicioTaxiPedido5.cliente.dni = this.loginService.usuario.dni;
          this.smservicioTaxiPedido5.precio = 0;
          this.smservicioTaxiPedido5.ubicacion = this.ubicacion;

          //hacer publish
          this.client.publish({ destination: "/app/stcrear", body: JSON.stringify(this.smservicioTaxiPedido5) });

          this.vigilante.guardarPedido(5, "Cancelado");
          this.renovar5();
        }
        else {

        }
      });
    }
    else if (this.smservicioTaxiPedido5.idstaxi > 0) {
      this.rechazarPedido5();
    }
  }

  aceptarPedido5(): void {
    this.estadoAceptar = true;
    if (this.smservicioTaxiPedido5.estado == "Confirmado" && this.smservicioTaxiPedido5.precio > 0) {
      this.smservicioTaxiPedido5.estado = "Aceptado";
      this.client.publish({ destination: '/app/taxi_aceptado', body: JSON.stringify(this.smservicioTaxiPedido5) });
      this.mensaje5 = "Confirmación enviada";
      this.vigilante.guardarPedido(5, "Aceptado");
      this.fijarTimer444(this.smservicioTaxiPedido5.taxista.idtaxista);
      this.resaltar5 = "si";
      /*const table = this.astable5.nativeElement;
      const tr = this.astr5.nativeElement;

      this.renderer.addClass(table, 'stilo-modal');
      this.renderer.addClass(tr, 'wrapper2');*/
    }
  }

  rechazarPedido5(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Seguro que desea cancelar?',
      text: 'Si cancela, el taxista será quitado de la lista',
      showCancelButton: true,
      confirmButtonText: 'Si, Cancelar',
      cancelButtonText: 'No, Cancelar'
    }).then((resp) => {
      if (resp.value) {
        this.estadoAceptar = false;
        this.smservicioTaxiPedido5.estado = "Cancelado";
        this.client.publish({ destination: '/app/taxi_aceptado', body: JSON.stringify(this.smservicioTaxiPedido5) });
        this.renovar5();
        this.resaltar5 = "no";
        /*const table = this.astable5.nativeElement;
        const tr = this.astr5.nativeElement;

        this.renderer.removeClass(table, 'stilo-modal');
        this.renderer.removeClass(tr, 'wrapper2');*/
      }
      else {

      }
    });
  }

  validarUbicacion(ubicacion: Ubicacion): boolean {

    ubicacion = this.vigilante.ubicacion;

    if (ubicacion != null || ubicacion != undefined) {
      if (ubicacion.origen_lng != null && ubicacion.origen_lat != null &&
        ubicacion.destino_lng != null && ubicacion.destino_lat != null &&
        ubicacion.distanciaestimado > 0 && ubicacion.tiempoestimado > 0 &&
        ubicacion.origen != null && ubicacion.destino != null && ubicacion.tipo != null) {

        this.ubicacion = this.vigilante.ubicacion;
        return true;

      }
      else {
        return false;
      }
    }
    else {
      return false;
    }

  }

  irPerfil() {
    this.estado_perfil = true;
    //this.router.navigate(['perfil-cli']);
  }

  refrescar(): void {
    this.ngOnInit();
  }

  location(): void {
    this.mapboxService.getPosition().then(resp => {
      this.smubicacion.origen_lng = resp.lng;
      this.smubicacion.origen_lat = resp.lat;
      //console.log('COORDENADAS', this.smubicacion);
    }).catch(resp => {
      console.log(resp);
    });

    this.posicion = setInterval(() => {
      this.mapboxService.getPosition().then(resp => {
        this.smubicacion.origen_lng = resp.lng;
        this.smubicacion.origen_lat = resp.lat;
        //console.log('COORDENADAS', this.smubicacion);
      }).catch(resp => {
        console.log(resp);
      });
    }, 10000);

  }

  conectar(): void {

    this.client.activate();

  }

  cerrarSesion() {
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

  verDetalle(taxista: SMTaxista): void {
    this.smtaxistaSelecionado = taxista;
    this.estadoDetalle = true;
    this.estadoRe = false;
  }

  mostrarMapa() {
    this.visibleMapa = true;
  }

  verificarTaxista(id: number): boolean {
    if (this.smservicioTaxiPedido1.taxista.idtaxista == id ||
      this.smservicioTaxiPedido2.taxista.idtaxista == id ||
      this.smservicioTaxiPedido3.taxista.idtaxista == id ||
      this.smservicioTaxiPedido4.taxista.idtaxista == id ||
      this.smservicioTaxiPedido5.taxista.idtaxista == id) {

      return true;
    }
    else {
      return false;
    }
  }

  asignarTaxistas(smtaxista: SMTaxista): void {
    if (this.smservicioTaxiPedido1.taxista.idtaxista == null || this.smservicioTaxiPedido1.taxista.idtaxista == undefined) {
      if (this.verificarTaxista(smtaxista.idtaxista) == false) {
        this.smservicioTaxiPedido1.taxista = smtaxista;
      }

    }
    else if (this.smservicioTaxiPedido2.taxista.idtaxista == null || this.smservicioTaxiPedido2.taxista.idtaxista == undefined) {

      if (this.verificarTaxista(smtaxista.idtaxista) == false) {
        this.smservicioTaxiPedido2.taxista = smtaxista;
      }

    }
    else if (this.smservicioTaxiPedido3.taxista.idtaxista == null || this.smservicioTaxiPedido3.taxista.idtaxista == undefined) {

      if (this.verificarTaxista(smtaxista.idtaxista) == false) {
        this.smservicioTaxiPedido3.taxista = smtaxista;
      }

    }
    else if (this.smservicioTaxiPedido4.taxista.idtaxista == null || this.smservicioTaxiPedido4.taxista.idtaxista == undefined) {

      if (this.verificarTaxista(smtaxista.idtaxista) == false) {
        this.smservicioTaxiPedido4.taxista = smtaxista;
      }

    }
    else if (this.smservicioTaxiPedido5.taxista.idtaxista == null || this.smservicioTaxiPedido5.taxista.idtaxista == undefined) {

      if (this.verificarTaxista(smtaxista.idtaxista) == false) {
        this.smservicioTaxiPedido5.taxista = smtaxista;
      }

    }
    else {
      console.log('OTRO TAXISTA MAS PERO YA NO HAY ESPACIO', smtaxista);
    }
  }

  fijarTimer1(id: number): void {
    this.minuto1 = 5;
    this.segundo1 = 0;

    const interval_segundo = setInterval(() => {
      if (this.vigilante.obtenerPedido(1) == "Enviado") {
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
      if (this.vigilante.obtenerPedido(1) == "Enviado" &&
        id == this.smservicioTaxiPedido1.taxista.idtaxista) {

        this.mensaje1 = "Sin respuesta, cancelando...";

        this.smservicioTaxiPedido1.taxista = new SMTaxista();
        this.estadoTaxista1 = false;
        this.estadoSolicitar1 = true;
      }
      console.log('interval')
    }, 300000);

  }

  fijarTimer2(id: number): void {

    this.minuto2 = 5;
    this.segundo2 = 0;

    const interval_segundo2 = setInterval(() => {
      if (this.vigilante.obtenerPedido(2) == "Enviado") {
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
      if (this.vigilante.obtenerPedido(2) == "Enviado" &&
        id == this.smservicioTaxiPedido2.taxista.idtaxista) {

        this.mensaje2 = "Sin respuesta, cancelando...";
        this.smservicioTaxiPedido2.taxista = new SMTaxista();
        this.estadoTaxista2 = false;
        this.estadoSolicitar2 = true;

      }
      console.log('interval')
    }, 300000);

  }

  fijarTimer3(id: number): void {

    this.minuto3 = 5;
    this.segundo3 = 0;

    const interval_segundo3 = setInterval(() => {
      if (this.vigilante.obtenerPedido(3) == "Enviado") {
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
      if (this.vigilante.obtenerPedido(3) == "Enviado" &&
        id == this.smservicioTaxiPedido3.taxista.idtaxista) {

        this.mensaje3 = "Sin respuesta, cancelando...";
        this.smservicioTaxiPedido3.taxista = new SMTaxista();
        this.estadoTaxista3 = false;
        this.estadoSolicitar3 = true;

      }
      console.log('interval')
    }, 300000);

  }

  fijarTimer4(id: number): void {

    this.minuto4 = 5;
    this.segundo4 = 0;

    const interval_segundo4 = setInterval(() => {
      if (this.vigilante.obtenerPedido(4) == "Enviado") {
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
      if (this.vigilante.obtenerPedido(4) == "Enviado" &&
        id == this.smservicioTaxiPedido4.taxista.idtaxista) {

        this.mensaje4 = "Sin respuesta, cancelando...";
        this.smservicioTaxiPedido4.taxista = new SMTaxista();
        this.estadoTaxista4 = false;
        this.estadoSolicitar4 = true;

      }
      console.log('interval')
    }, 300000);

  }

  fijarTimer5(id: number): void {

    this.minuto5 = 5;
    this.segundo5 = 0;

    const interval_segundo5 = setInterval(() => {
      if (this.vigilante.obtenerPedido(5) == "Enviado") {
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
      if (this.vigilante.obtenerPedido(5) == "Enviado" &&
        id == this.smservicioTaxiPedido5.taxista.idtaxista) {

        this.mensaje5 = "Sin respuesta, cancelando...";
        this.smservicioTaxiPedido5.taxista = new SMTaxista();
        this.estadoTaxista5 = false;
        this.estadoSolicitar5 = true;

      }
      console.log('interval')
    }, 300000);

  }

  validarTaxistas(): boolean {
    if (this.smservicioTaxiPedido1.taxista.idtaxista != null && this.smservicioTaxiPedido2.taxista.idtaxista != null &&
      this.smservicioTaxiPedido3.taxista.idtaxista != null && this.smservicioTaxiPedido4.taxista.idtaxista != null &&
      this.smservicioTaxiPedido5.taxista.idtaxista != null) {

      return true;

    }
    else {
      return false;
    }
  }

  crearNuevos(): void {

    this.smservicioTaxiPedido1.cliente = new SMCliente();
    this.smservicioTaxiPedido1.taxista = new SMTaxista();
    this.smservicioTaxiPedido1.ubicacion = new Ubicacion();

    this.smservicioTaxiPedido2.cliente = new SMCliente();
    this.smservicioTaxiPedido2.taxista = new SMTaxista();
    this.smservicioTaxiPedido2.ubicacion = new Ubicacion();

    this.smservicioTaxiPedido3.cliente = new SMCliente();
    this.smservicioTaxiPedido3.taxista = new SMTaxista();
    this.smservicioTaxiPedido3.ubicacion = new Ubicacion();

    this.smservicioTaxiPedido4.cliente = new SMCliente();
    this.smservicioTaxiPedido4.taxista = new SMTaxista();
    this.smservicioTaxiPedido4.ubicacion = new Ubicacion();

    this.smservicioTaxiPedido5.cliente = new SMCliente();
    this.smservicioTaxiPedido5.taxista = new SMTaxista();
    this.smservicioTaxiPedido5.ubicacion = new Ubicacion();

  }

  fijarTimer11(id: number): void {
    this.minuto1 = 2;
    this.segundo1 = 0;

    const interval_segundo = setInterval(() => {
      if (this.vigilante.obtenerPedido(1) == "Respuesta") {
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
      if (this.vigilante.obtenerPedido(1) == "Respuesta" &&
        id == this.smservicioTaxiPedido1.taxista.idtaxista) {

        this.mensaje1 = "Sin respuesta, cancelando...";
        this.renovar1();

      }
      console.log('interval')
    }, 120000);

  }

  fijarTimer22(id: number): void {

    this.minuto2 = 2;
    this.segundo2 = 0;

    const interval_segundo2 = setInterval(() => {
      if (this.vigilante.obtenerPedido(2) == "Respuesta") {
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
      if (this.vigilante.obtenerPedido(2) == "Respuesta" &&
        id == this.smservicioTaxiPedido2.taxista.idtaxista) {

        this.mensaje2 = "Sin respuesta, cancelando...";
        this.renovar2();

      }
      console.log('interval')
    }, 120000);

  }

  fijarTimer33(id: number): void {

    this.minuto3 = 2;
    this.segundo3 = 0;

    const interval_segundo3 = setInterval(() => {
      if (this.vigilante.obtenerPedido(3) == "Respuesta") {
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
      if (this.vigilante.obtenerPedido(3) == "Respuesta" &&
        id == this.smservicioTaxiPedido3.taxista.idtaxista) {

        this.mensaje3 = "Sin respuesta, cancelando...";
        this.renovar3();

      }
      console.log('interval')
    }, 120000);

  }

  fijarTimer44(id: number): void {

    this.minuto4 = 2;
    this.segundo4 = 0;

    const interval_segundo4 = setInterval(() => {
      if (this.vigilante.obtenerPedido(4) == "Respuesta") {
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
      if (this.vigilante.obtenerPedido(4) == "Respuesta" &&
        id == this.smservicioTaxiPedido4.taxista.idtaxista) {

        this.mensaje4 = "Sin respuesta, cancelando...";
        this.renovar4();

      }
      console.log('interval')
    }, 120000);

  }

  fijarTimer55(id: number): void {

    this.minuto5 = 2;
    this.segundo5 = 0;

    const interval_segundo5 = setInterval(() => {
      if (this.vigilante.obtenerPedido(5) == "Respuesta") {
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
      if (this.vigilante.obtenerPedido(5) == "Respuesta" &&
        id == this.smservicioTaxiPedido5.taxista.idtaxista) {

        this.mensaje5 = "Sin respuesta, cancelando...";
        this.renovar5();

      }
      console.log('interval')
    }, 120000);

  }

  fijarTimer111(id: number): void {

    this.minuto1 = 0;
    this.segundo1 = 0;
    const interval_segundo = setInterval(() => {
      if (this.vigilante.obtenerPedido(1) == "Aceptado") {
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

      if (this.vigilante.obtenerPedido(1) == "Aceptado" &&
        id == this.smservicioTaxiPedido1.taxista.idtaxista) {

        this.mensaje1 = "Sin respuesta, cancelando...";
        this.renovar1();

      }
      console.log('interval')
    }, 30000);

  }

  fijarTimer222(id: number): void {

    this.minuto2 = 0;
    this.segundo2 = 0;

    const interval_segundo2 = setInterval(() => {
      if (this.vigilante.obtenerPedido(2) == "Aceptado") {
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
      if (this.vigilante.obtenerPedido(2) == "Aceptado" &&
        id == this.smservicioTaxiPedido2.taxista.idtaxista) {

        this.mensaje2 = "Sin respuesta, cancelando...";
        this.renovar2();
      }
      console.log('interval')
    }, 30000);

  }

  fijarTimer333(id: number): void {

    this.minuto3 = 0;
    this.segundo3 = 0;

    const interval_segundo3 = setInterval(() => {
      if (this.vigilante.obtenerPedido(3) == "Aceptado") {
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
      if (this.vigilante.obtenerPedido(3) == "Aceptado" &&
        id == this.smservicioTaxiPedido3.taxista.idtaxista) {

        this.mensaje3 = "Sin respuesta, cancelando...";
        this.renovar3();

      }
      console.log('interval')
    }, 30000);

  }

  fijarTimer444(id: number): void {

    this.minuto4 = 0;
    this.segundo4 = 0;

    const interval_segundo44 = setInterval(() => {
      if (this.vigilante.obtenerPedido(4) == "Aceptado") {
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
      if (this.vigilante.obtenerPedido(4) == "Aceptado" &&
        id == this.smservicioTaxiPedido4.taxista.idtaxista) {

        this.mensaje4 = "Sin respuesta, cancelando...";
        this.renovar4();

      }
      console.log('interval')
    }, 30000);

  }

  fijarTimer555(id: number): void {

    this.minuto5 = 0;
    this.segundo5 = 0;

    const interval_segundo5 = setInterval(() => {
      if (this.vigilante.obtenerPedido(5) == "Aceptado") {
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
      if (this.vigilante.obtenerPedido(5) == "Aceptado" &&
        id == this.smservicioTaxiPedido5.taxista.idtaxista) {

        this.mensaje5 = "Sin respuesta, cancelando...";
        this.renovar5();

      }
      console.log('interval')
    }, 30000);

  }

  renovar1(): void {
    this.resaltar1 = "no";
    this.smservicioTaxiPedido1 = new SMServicioTaxi();
    this.smservicioTaxiPedido1.taxista = new SMTaxista();
    this.smservicioTaxiPedido1.cliente = new SMCliente();
    this.smservicioTaxiPedido1.ubicacion = this.ubicacion;
    this.estadoSolicitar1 = true;
    this.estadoTaxista1 = false;
    this.estadoRespuesta1 = false;
    this.estadoAceptar = false;

  }

  renovar2(): void {
    this.resaltar2 = "no";
    this.smservicioTaxiPedido2 = new SMServicioTaxi();
    this.smservicioTaxiPedido2.taxista = new SMTaxista();
    this.smservicioTaxiPedido2.cliente = new SMCliente();
    this.smservicioTaxiPedido2.ubicacion = this.ubicacion;
    this.estadoSolicitar2 = true;
    this.estadoTaxista2 = false;
    this.estadoRespuesta2 = false;
    this.estadoAceptar = false;
  }

  renovar3(): void {
    this.resaltar3 = "no";
    this.smservicioTaxiPedido3 = new SMServicioTaxi();
    this.smservicioTaxiPedido3.taxista = new SMTaxista();
    this.smservicioTaxiPedido3.cliente = new SMCliente();
    this.smservicioTaxiPedido3.ubicacion = this.ubicacion;
    this.estadoSolicitar3 = true;
    this.estadoTaxista3 = false;
    this.estadoRespuesta3 = false;
    this.estadoAceptar = false;
  }

  renovar4(): void {
    this.resaltar4 = "no";
    this.smservicioTaxiPedido4 = new SMServicioTaxi();
    this.smservicioTaxiPedido4.taxista = new SMTaxista();
    this.smservicioTaxiPedido4.cliente = new SMCliente();
    this.smservicioTaxiPedido4.ubicacion = this.ubicacion;
    this.estadoSolicitar4 = true;
    this.estadoTaxista4 = false;
    this.estadoRespuesta4 = false;
    this.estadoAceptar = false;

  }

  renovar5(): void {
    this.resaltar5 = "no";
    this.smservicioTaxiPedido5 = new SMServicioTaxi();
    this.smservicioTaxiPedido5.taxista = new SMTaxista();
    this.smservicioTaxiPedido5.cliente = new SMCliente();
    this.smservicioTaxiPedido5.ubicacion = this.ubicacion;
    this.estadoTaxista5 = false;
    this.estadoSolicitar5 = true;
    this.estadoRespuesta5 = false;
    this.estadoAceptar = false;

  }  

  ver(servicios: SMServicioTaxi): void {
    this.smtaxistaSelecionado = servicios.taxista;
    this.estadoDetalle = true;
    this.estadoRe = true;
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
        text: 'Tienes un servicio de taxi en proceso'
      });
    }

  }

  cancelar(servicios: SMServicioTaxi): void {
    Swal.fire({
      icon: 'question',
      title: 'Seguro que desea cancelar???',
      text: 'Esta intentado cancelar el servicio por favor confirme',
      showCancelButton: true,
      confirmButtonText: 'Si, cancelar',
      cancelButtonText: 'No, cancelar'
    }).then(resp => {
      if (resp.value) {
        servicios.estado = "Cancelado";
        this.client.publish({ destination: '/app/cancelado_pasajero', body: JSON.stringify(servicios) });
        this.loginService.estado("Disponible");       
        const indice = this.smservicioTaxis.indexOf(servicios);
        if(indice != -1){
          this.smservicioTaxis[indice].estado = "Finalizado";
        }
      }
    });

  }

  verificarEstadoTaxi(): boolean {
    const indice = this.smservicioTaxis.find(x => x.estado == "Iniciado");
    if (indice != undefined) {
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
