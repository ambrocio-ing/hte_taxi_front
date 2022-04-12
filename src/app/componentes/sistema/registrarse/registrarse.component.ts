import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Cliente } from '../../modelo/cliente/cliente';
import { Persona } from '../../modelo/persona/persona';
import { Usuario } from '../../security_modelo/usuario/usuario';
import Swal from 'sweetalert2';
import { Taxista } from '../../modelo/taxista/taxista';
import { Vehiculo } from '../../modelo/vehiculo/vehiculo';
import { VehiculoPropietario } from '../../modelo/vehiculoPropietario/vehiculo-propietario';
import { ClienteService } from '../../servicio-conexion/cliente/cliente.service';
import { TaxistaService } from '../../servicio-conexion/taxista/taxista.service';
import { Calificacion } from '../../modelo/calificacion/calificacion';

@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.component.html',
  styleUrls: ['./registrarse.component.css']
})

export class RegistrarseComponent implements OnInit {

  @ViewChild('asFotoDocumento') foto_documento!: ElementRef;

  estadoCliente: boolean = false;
  estadoTaxista: boolean = false;

  estadoDni: boolean = false;
  estadoCarnet: boolean = false;

  estadoDniT: boolean = false;
  estadoCarnetT: boolean = false;

  estadoDniP: boolean = false;
  estadoCarnetP: boolean = false;

  estadoPropiedad: boolean = false;


  cliente: Cliente = new Cliente();
  taxista: Taxista = new Taxista();

  //lista general para los archivos
  archivos: File[] = [];

  //cliente
  foto_perfil!: File;
  validarImagen: boolean = true;
  foto_perfil_error: string = "";

  //taxista
  foto_perfil_cliente!: File;
  foto_dni_cliente!: File;
  foto_targeta_propiedad!: File;
  foto_vehiculo!: File;
  foto_documento_propietario!: File;

  //avisos de imagen fallida
  perfilError: string = "";
  dniError: string = "";
  foto_targeta_propiedad_error: string = "";
  foto_vehiculo_error: string = "";
  foto_documento_propietario_error: string = "";

  //estado validez
  foto_perfil_cliente_estado: boolean = true;
  foto_dni_cliente_estado: boolean = true;
  foto_targeta_propiedad_estado: boolean = true;
  foto_vehiculo_estado: boolean = true;
  foto_documento_propietario_estado: boolean = true;
  estado_chekbox: boolean = true;

  constructor(private router: Router, private renderer: Renderer2,
    private cliService: ClienteService, private taxService: TaxistaService) {

    this.cliente.persona = new Persona();
    this.cliente.usuario = new Usuario();

    this.taxista.persona = new Persona();
    this.taxista.usuario = new Usuario();
    this.taxista.vehiculo = new Vehiculo();
    this.taxista.vehiculo.vehiculoPropietario = new VehiculoPropietario();
    this.taxista.calificacion = new Calificacion();

  }  

  ngOnInit(): void {

  }

  tipoUsuario(event: any): void {
    if (event.target.value == "cliente") {
      this.estadoTaxista = false;
      this.estadoCliente = true;
    }
    else if (event.target.value == "taxista") {
      this.estadoCliente = false;
      this.estadoTaxista = true;
    }
  }

  tipoDocumentoCliente(event: any): void {
    if (event.target.value == "dni") {

      this.estadoCarnet = false;
      this.estadoDni = true;

      if (this.cliente.persona.dni != null) {
        this.cliente.persona.dni = "";
      }
    }
    else if (event.target.value == "carnet") {

      this.estadoDni = false;
      this.estadoCarnet = true;

      if (this.cliente.persona.dni != null) {
        this.cliente.persona.dni = "";
      }

    }
  }

  tipoDocumentoTaxista(event: any): void {
    if (event.target.value == "dni") {

      this.estadoCarnetT = false;
      this.estadoDniT = true;

      if (this.taxista.persona.dni != null) {
        this.taxista.persona.dni = "";
      }
    }
    else if (event.target.value == "carnet") {

      this.estadoDniT = false;
      this.estadoCarnetT = true;

      if (this.taxista.persona.dni != null) {
        this.taxista.persona.dni = "";
      }

    }
  }

  tipoDocumentoPropiedad(event: any): void {
    if (event.target.value == "dni") {

      this.estadoCarnetP = false;
      this.estadoDniP = true;

      if (this.taxista.vehiculo.vehiculoPropietario.documento != null) {
        this.taxista.vehiculo.vehiculoPropietario.documento = "";
      }
    }
    else if (event.target.value == "carnet") {

      this.estadoDniP = false;
      this.estadoCarnetP = true;

      if (this.taxista.vehiculo.vehiculoPropietario.documento != null) {
        this.taxista.vehiculo.vehiculoPropietario.documento = "";
      }

    }
  }

  //cliente
  capturarFotoPerfil(event: any): void {

    let archivo: File = event.target.files[0];
    if (archivo.type.indexOf('image') < 0) {
      this.validarImagen = true;
      this.foto_perfil_error = "El archivo no es una imagen";
    }
    else {
      this.foto_perfil_error = "";
      this.validarImagen = false;
      this.foto_perfil = archivo;
    }

  }

  //taxista
  capturarFoto_Perfil(event: any): void {

    let archivo: File = event.target.files[0];
    if (archivo.type.indexOf('image') < 0) {
      this.perfilError = "El archivo no es una imagen";
      this.foto_perfil_cliente_estado = true;
    }
    else {
      this.perfilError = "";
      this.foto_perfil_cliente = archivo;
      this.foto_perfil_cliente_estado = false;
    }

  }

  capturarFoto_Dni(event: any): void {

    let archivo: File = event.target.files[0];
    if (archivo.type.indexOf('image') < 0) {
      this.dniError = "El archivo no es una imagen";
      this.foto_dni_cliente_estado = true;
    }
    else {
      this.dniError = "";
      this.foto_dni_cliente = archivo;
      this.foto_dni_cliente_estado = false;
    }
  }

  capturarFotoTargetaPropiedad(event: any): void {

    let archivo: File = event.target.files[0];
    if (archivo.type.indexOf('image') < 0) {
      this.foto_targeta_propiedad_error = "El archivo no es una imagen";
      this.foto_targeta_propiedad_estado = true;
    }
    else {
      this.foto_targeta_propiedad_error = "";
      this.foto_targeta_propiedad = archivo;
      this.foto_targeta_propiedad_estado = false;
    }

  }

  capturarFotoVehiculo(event: any): void {

    let archivo: File = event.target.files[0];
    if (archivo.type.indexOf('image') < 0) {

      this.foto_vehiculo_error = "El archivo no es una imagen";
      this.foto_vehiculo_estado = true;
    }
    else {
      this.foto_vehiculo_error = "";
      this.foto_vehiculo = archivo;
      this.foto_vehiculo_estado = false;
    }

  }

  buscarDocumento(event: any): void {
    
    let valor = event.target.value;
    if (valor.length == 8 || valor.length == 12) {
      //lanzar buscador
      this.taxService.buscarPropietario(valor).subscribe(data => {
        this.taxista.vehiculo.vehiculoPropietario = data;
        const infoto = this.foto_documento.nativeElement;
        this.renderer.setAttribute(infoto, 'disabled', 'true');
      }, err => {
        this.taxista.vehiculo.vehiculoPropietario.idpropietario = 0;
      });
      
    }    
    else {
      this.taxista.vehiculo.vehiculoPropietario.idpropietario = 0;
      const infoto = this.foto_documento.nativeElement;
      this.renderer.removeAttribute(infoto, 'disabled');
    }


  }

  capturarFotoDocumentoPropiedatario(event: any): void {

    let archivo: File = event.target.files[0];
    if (archivo.type.indexOf('image') < 0) {
      this.foto_documento_propietario_error = "El archivo no es una imagen";
      this.foto_documento_propietario_estado = true;
    }
    else {
      this.foto_documento_propietario_error = "";
      this.foto_documento_propietario = archivo;
      this.foto_documento_propietario_estado = false;
    }

  }

  validarPropietario(event: any): void {

    if (event.target.value == "Propio") {
      this.estadoPropiedad = false;
      this.foto_documento_propietario_estado = false;
    }
    else if (event.target.value == "Alquilado") {
      this.estadoPropiedad = true;
      this.foto_documento_propietario_estado = true;
    }

  }

  cambiarya(): void {

    if (this.estado_chekbox == true) {
      this.estado_chekbox = false;
    }
    else {
      this.estado_chekbox = true;
    }

  }

  activarOno(): boolean {

    if (this.foto_perfil_cliente_estado || this.foto_dni_cliente_estado ||
      this.foto_targeta_propiedad_estado || this.foto_vehiculo_estado ||
      this.foto_documento_propietario_estado || this.estado_chekbox) {

      return true;

    }
    else {
      return false;
    }
  }

  imagenEsValido(): boolean {

    if (this.foto_perfil_cliente_estado || this.foto_dni_cliente_estado ||
      this.foto_targeta_propiedad_estado || this.foto_vehiculo_estado ||
      this.foto_documento_propietario_estado) {

      return false;

    }
    else {
      return true;
    }
  }

  imagenEsValido2(): boolean {

    if (this.foto_perfil_cliente_estado || this.foto_dni_cliente_estado ||
      this.foto_targeta_propiedad_estado || this.foto_vehiculo_estado) {

      return false;

    }
    else {
      return true;
    }
  }

  enviarCliente(): void {

    if (this.cliente != null) {
      this.cliente.usuario.email = this.cliente.persona.email;
      this.cliService.clienteGuardar(this.cliente, this.foto_perfil).subscribe(resp => {

        this.cliente = new Cliente();
        this.cliente.persona = new Persona();
        this.cliente.usuario = new Usuario();

        Swal.fire({
          icon: 'success',
          title: 'Operación éxitosa',
          text: resp.messaje
        }).then(() => {
          //console.log('Funcion cerrada');
          this.router.navigate([''])
        });

        //this.router.navigate(['perfil']);

      });

    }

  }

  enviarTaxista(): void {
    
    this.archivos.length = 0;

    if (this.taxista.vehiculo.propiedad == "Alquilado" && 
      (this.taxista.vehiculo.vehiculoPropietario.idpropietario == 0 || 
      this.taxista.vehiculo.vehiculoPropietario.idpropietario == null)) {

      if (this.imagenEsValido() && this.foto_perfil_cliente != null &&
        this.foto_dni_cliente != null && this.foto_targeta_propiedad != null &&
        this.foto_vehiculo != null && this.foto_documento_propietario != null) {

        this.archivos.push(this.foto_perfil_cliente);
        this.archivos.push(this.foto_dni_cliente);
        this.archivos.push(this.foto_targeta_propiedad);
        this.archivos.push(this.foto_vehiculo);
        this.archivos.push(this.foto_documento_propietario);

      }

    }
    else if (this.taxista.vehiculo.propiedad == "Propio") {

      if (this.imagenEsValido2() && this.foto_perfil_cliente != null &&
        this.foto_dni_cliente != null && this.foto_targeta_propiedad != null &&
        this.foto_vehiculo != null) {

        this.archivos.push(this.foto_perfil_cliente);
        this.archivos.push(this.foto_dni_cliente);
        this.archivos.push(this.foto_targeta_propiedad);
        this.archivos.push(this.foto_vehiculo);

        this.taxista.vehiculo.vehiculoPropietario.documento = this.taxista.persona.dni;
        this.taxista.vehiculo.vehiculoPropietario.nombres = this.taxista.persona.nombre + " " + this.taxista.persona.apellidos;

      }
    }
    else if (this.taxista.vehiculo.vehiculoPropietario.idpropietario != null &&
      this.taxista.vehiculo.vehiculoPropietario.idpropietario > 0 && this.taxista.vehiculo.propiedad == "Alquilado") {

      if (this.imagenEsValido2() && this.foto_perfil_cliente != null &&
        this.foto_dni_cliente != null && this.foto_targeta_propiedad != null &&
        this.foto_vehiculo != null) {

        this.archivos.push(this.foto_perfil_cliente);
        this.archivos.push(this.foto_dni_cliente);
        this.archivos.push(this.foto_targeta_propiedad);
        this.archivos.push(this.foto_vehiculo);

      }
    }

    this.taxista.estado = "Activo";
    this.taxista.disponibilidad = "Disponible";
    this.taxista.usuario.email = this.taxista.persona.email;
    this.taxista.calificacion.uno = 0;
    this.taxista.calificacion.dos = 0;
    this.taxista.calificacion.tres = 0;
    this.taxista.calificacion.cuatro = 0;
    this.taxista.calificacion.cinco = 0;
    this.taxista.calificacion.promedio = 0;

    console.log(this.taxista);
    console.log(this.archivos);

    if (this.taxista != null && this.archivos.length == 5) {

      this.taxService.taxistaGuardarCinco(this.taxista, this.archivos).subscribe(data => {

        this.taxista = new Taxista();
        this.taxista.persona = new Persona();
        this.taxista.usuario = new Usuario();
        this.taxista.vehiculo = new Vehiculo();
        this.taxista.vehiculo.vehiculoPropietario = new VehiculoPropietario();
        this.taxista.calificacion = new Calificacion();

        Swal.fire({
          icon: 'success',
          title: 'Registro éxitoso',
          text: data.mensaje
        }).then(() => {
          //al darle aceptar al swal
          this.router.navigate(['']);
        });

      });

    }
    else if (this.taxista != null && this.archivos.length == 4) {

      this.taxService.taxistaGuardarCuatro(this.taxista, this.archivos).subscribe(data => {

        this.taxista = new Taxista();
        this.taxista.persona = new Persona();
        this.taxista.usuario = new Usuario();
        this.taxista.vehiculo = new Vehiculo();
        this.taxista.vehiculo.vehiculoPropietario = new VehiculoPropietario();
        this.taxista.calificacion = new Calificacion();

        Swal.fire({
          icon: 'success',
          title: 'Registro éxitoso',
          text: data.mensaje
        }).then(() => {
          //al darle aceptar al swal
          this.router.navigate(['']);
        });

      });

    }
    else {
      Swal.fire({
        icon: 'warning',
        title: 'Operación fallida',
        text: 'Ocurrio un error inesperado, por favor refresque la página y vuelva a intentarlo'
      });
    }

  }

  irPerfil() {
    this.router.navigate(['perfil']);
  }

  irPerfilconductor() {
    this.router.navigate(['perfil2']);
  }

}
