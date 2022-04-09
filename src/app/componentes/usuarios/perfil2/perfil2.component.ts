import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Taxista } from '../../modelo/taxista/taxista';
import { LoginService } from '../../servicio-conexion/login/login.service';
import { TaxistaService } from '../../servicio-conexion/taxista/taxista.service';
import { URL_BACKEND } from '../../sistema/config/config';
import { SMServicioTaxi } from '../../socket_modelo/smserviciotaxi/smserviciotaxi';
import { SMTaxista } from '../../socket_modelo/smtaxista/smtaxista';

@Component({
  selector: 'app-perfil2',
  templateUrl: './perfil2.component.html',
  styleUrls: ['./perfil2.component.css']
})
export class Perfil2Component implements OnInit {

  @Input() estadoModalPerfil!:boolean;
  @Output() cerrarPerfil : EventEmitter<boolean> = new EventEmitter();

  nombreUsuario!:string;
  url_backend:string = URL_BACKEND+"/taxista";

  constructor(private router: Router, private taxService:TaxistaService,
    public loginService:LoginService) {

    this.formarNombre();

  }

  smtaxista:SMTaxista = new SMTaxista();
  mensajeTaxista = "";

  //smservicioTaxi:SMServicioTaxi[] = [];
  //mensajeSMS = "";

  idtaxista!:number;

  ngOnInit(): void {

    this.idtaxista = this.loginService.usuario.id;

    this.datos();
    //this.historial();

  }

  cerrar_perfil() : void{
    this.cerrarPerfil.emit(false);
  }

  datos() : void {
    this.taxService.smTaxista(this.idtaxista).subscribe(dato => {
      this.smtaxista = dato;
      this.mensajeTaxista = "";
    }, err => {
      this.mensajeTaxista = "Sin datos que mostrar";
    });
  }

  /*historial() : void {
    this.taxService.historial(this.idtaxista).subscribe(datos => {
      this.smservicioTaxi = datos;
      this.mensajeSMS = "";
    }, err => {
      this.mensajeSMS = "Sin datos que mostrar";
    });
  }*/
  
  formarNombre(){
    const nombre = this.loginService.usuario.nombre+" "+this.loginService.usuario.apellidos;
    const arrayNom = nombre.split(" ");
    this.nombreUsuario = arrayNom[0];

    for(let i = 1; i < arrayNom.length; i++){
      this.nombreUsuario += " "+arrayNom[i][0].toUpperCase()+".";
    }

  }  

  serrarSesion(): void {
    //this.loginService.desconectar_Socket.emit('desconectar');
  }
}
