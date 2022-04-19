import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Reclamo } from '../../modelo/reclamo/reclamo';
import { ClienteService } from '../../servicio-conexion/cliente/cliente.service';
import { LoginService } from '../../servicio-conexion/login/login.service';
import { ReclamoService } from '../../servicio-conexion/reclamo/reclamo.service';
import { TaxistaService } from '../../servicio-conexion/taxista/taxista.service';
import { URL_BACKEND } from '../../sistema/config/config';
import { SMCliente } from '../../socket_modelo/smcliente/smcliente';
import { SMTaxista } from '../../socket_modelo/smtaxista/smtaxista';

@Component({
  selector: 'app-reclamo',
  templateUrl: './reclamo.component.html',
  styleUrls: ['./reclamo.component.css']
})
export class ReclamoComponent implements OnInit {

  reclamo:Reclamo = new Reclamo();
  reclamoCliente:boolean = false;
  reclamoTaxista:boolean = false;

  nombreUsuario!:string;

  url_cliente:string = URL_BACKEND+"/cliente";
  url_taxista:string = URL_BACKEND+"/taxista";

  mensajeImagen!:string;
  esImagen!:boolean;
  archivo!:File;

  isCheket:boolean = false;

  constructor(private router: Router, private reclamoService:ReclamoService,
    private activatedRoute:ActivatedRoute, private taxistaService:TaxistaService,
    public loginService:LoginService, private clienteService:ClienteService) { 

    this.reclamo.cliente = new SMCliente();
    this.reclamo.taxista = new SMTaxista();
    this.formarNombre();

  }

  ngOnInit(): void {

    this.activatedRoute.paramMap.subscribe((param) => {
      const id = param.get('id');
      const tipo = param.get('tipo');

      if(id != null && tipo != null){
        if(tipo == "taxista"){
          this.reclamoTaxista = true;
          this.clienteService.smCliente(+id).subscribe(resp => {
            this.reclamo.cliente = resp;

            this.reclamo.tipo = "Taxista";
            this.reclamo.taxista.idtaxista = this.loginService.usuario.id;
            this.reclamo.taxista.dni = this.loginService.usuario.dni;          
          });         

        }
        else if(tipo == "cliente"){
          this.reclamoCliente = true;
          this.taxistaService.smTaxista(+id).subscribe(resp => {
            this.reclamo.taxista = resp;

            this.reclamo.tipo = "Cliente";
            this.reclamo.cliente.idcliente = this.loginService.usuario.id;
            this.reclamo.cliente.dni = this.loginService.usuario.dni;
          });
        }        
      }      

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

  enviar(){
    this.reclamo.fecha = new Date(Date.now());
    if(this.reclamo.cliente.idcliente > 0 && this.reclamo.taxista.idtaxista > 0 && 
      this.reclamo.tipo != null && this.reclamo.descripcion.length > 0){
      if(this.isCheket){
        this.enviarConImagen();
      }
      else{
        this.enviarSinImagen();
      }     

    }
    else{
      Swal.fire({
        icon:'info',
        title:'Atención',
        text: 'Datos incompletos'
      });
    }
  }

  enviarSinImagen() : void {
    this.reclamoService.reclamo_Guardar(this.reclamo).subscribe(resp => {
      Swal.fire({
        icon:'success',
        title:'Reclamo enviado',
        text: resp.mensaje
      });

      this.reclamo.descripcion = "";

    });
  }

  enviarConImagen() : void {
    if(this.archivo != null  && this.esImagen == true){
      this.reclamoService.reclamoGuardar(this.reclamo, this.archivo).subscribe(resp => {
        Swal.fire({
          icon:'success',
          title:'Reclamo enviado',
          text: resp.mensaje
        });

        this.reclamo.descripcion = "";

      });
    }
    else{
      Swal.fire({
        icon:'info',
        title:'Datos incompletos',
        text: 'Seleccione una imagen como evidencia'
      });
    }
  }

  capturarEstado(event:any) : void {
    if(event.target.checked){
      this.isCheket = true;
    }
    else{
      this.isCheket = false;
    }
  }

  capturarImagen(event:any) : void {
    const imagen:File = event.target.files[0];
    if(imagen.type.indexOf('image') < 0){
      this.mensajeImagen = "No es una imagen";
      this.esImagen = false;
    }
    else{
      this.esImagen = true;
      this.archivo = imagen;
    }
  }

  solicitar() : void {
    this.router.navigate(['intusuario']);
  }

  versolicitudes() : void {
    this.router.navigate(['inttaxista']);
  }
  
  cerrarSesion() : void {
    this.loginService.cerrarSesion();
    this.router.navigate(['']);
  }

}
