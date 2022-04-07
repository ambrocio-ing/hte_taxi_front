import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from '../../servicio-conexion/cliente/cliente.service';
import { Cliente } from '../../modelo/cliente/cliente';
import { URL_BACKEND } from 'src/app/componentes/sistema/config/config';
import { SMServicioTaxi } from '../../socket_modelo/smserviciotaxi/smserviciotaxi';
import { LoginService } from '../../servicio-conexion/login/login.service';
import Swal from 'sweetalert2';
 
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  @Input() estadoPerfil!:boolean;
  @Output() cerraPerfil : EventEmitter<boolean> = new EventEmitter();

  public url_backend = URL_BACKEND+"/pcliente";
  nombreUsuario!:string;

  constructor(private router: Router, private cliService:ClienteService, 
    public loginService:LoginService) {

    this.formarNombre();

  }

  cliente:Cliente = new Cliente();
  mensajeCliente = "";

  //servicio_taxis:SMServicioTaxi[] = [];
  //mensajeServicios = "";

  idcliente!:number;

  ngOnInit(): void {

    this.idcliente = this.loginService.usuario.id;

    this.recuperarDatos();
    //this.recuperarHistorial();

  }

  /*recuperarHistorial() : void {
    this.cliService.historial(this.idcliente).subscribe(datos => {
      this.servicio_taxis = datos;
      this.mensajeServicios = "";
    }, err => {
      this.mensajeServicios = "Sin datos que mostrar";
    });
  }*/

  recuperarDatos() : void{
    this.cliService.obtenerDatos(this.idcliente).subscribe(dato => {
      this.cliente = dato;
      this.mensajeCliente = "";
    }, err => {
      this.mensajeCliente = "Sus datos no fueron validados";
    });
  }

  formarNombre(){
    const nombre = this.loginService.usuario.nombre+" "+this.loginService.usuario.apellidos;
    const arrayNom = nombre.split(" ");
    this.nombreUsuario = arrayNom[0];

    for(let i = 1; i < arrayNom.length; i++){
      this.nombreUsuario += " "+arrayNom[i][0].toUpperCase()+".";
    }

  }  

  serrarSesion(): void {
    //this.loginService.desconectarSocket.emit('desconectar');
    this.loginService.cerrarSesion();
    Swal.fire({
      icon: 'success',
      title: 'Vuelva pronto',
      text: 'Sesión cerrada con éxito'
    }).then(resp => {
      this.router.navigate(['']);
    });
  }

  cerrar_perfil() : void {
    this.cerraPerfil.emit(false);
  }
  
}
