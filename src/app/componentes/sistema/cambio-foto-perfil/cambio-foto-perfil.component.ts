import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';
import { JwtDto } from '../../security_modelo/jwtDto/jwt-dto';
import { ClienteService } from '../../servicio-conexion/cliente/cliente.service';
import { LoginService } from '../../servicio-conexion/login/login.service';
import { TaxistaService } from '../../servicio-conexion/taxista/taxista.service';
import { URL_BACKEND } from '../config/config';

@Component({
  selector: 'app-cambio-foto-perfil',
  templateUrl: './cambio-foto-perfil.component.html',
  styleUrls: ['./cambio-foto-perfil.component.css']
})
export class CambioFotoPerfilComponent implements OnInit {   
  
  @Input() visible:boolean = false;
  @Output() cerrarModalPerfil : EventEmitter<boolean> = new EventEmitter();

  tipo!:string; 

  url_backend_cliente:string = URL_BACKEND + "/cliente";
  url_backend_taxista:string = URL_BACKEND + "/taxista";

  imagen!:File;
  erroImagen!:string;

  constructor(public loginService:LoginService, private clienteService:ClienteService,
    private taxistaService:TaxistaService) { }

  ngOnInit(): void {

    if(this.loginService.validarRol("ROLE_CLIENT")){
      this.tipo = "cliente";
    }
    else if(this.loginService.validarRol("ROLE_CABBIE")){
      this.tipo = "taxista";
    }

  }

  capturarImagen(event:any) : void {
    const img:File = event.target.files[0];
    if(img.type.indexOf("image") < 0){
      this.erroImagen = "El archivo no es una imagen";
    }
    else{
      this.erroImagen = "";
      this.imagen = img;
    }
  }

  guardar() : void {
    if(this.tipo == "cliente" && this.erroImagen == ""){
      this.clienteService.editarPerfil(this.loginService.usuario.id, this.imagen).subscribe(resp => {

        let jwtDto:JwtDto = this.loginService.usuario;
        jwtDto.fotoPerfil = resp.nombre;
        this.loginService.setUsuario(jwtDto);

        Swal.fire({
          icon:'success',
          title:'Perfil actualizado',
          text: resp.mensaje
        });

      });
    }
    else if(this.tipo == "taxista" && this.erroImagen == ""){
      this.taxistaService.editarPerfil(this.loginService.usuario.id, this.imagen).subscribe(resp => {

        let jwtDto:JwtDto = this.loginService.usuario;
        jwtDto.fotoPerfil = resp.nombre;
        this.loginService.setUsuario(jwtDto);
        
        Swal.fire({
          icon:'success',
          title:'Perfil actualizado',
          text: resp.mensaje
        });

      });
    }
    else{
      Swal.fire({
        icon:'info',
        title:'Datos incompletos',
        text: 'Suba una imagen válida para continuar'
      });
    }
  }

  cerrarModal() : void {
    this.cerrarModalPerfil.emit(false);
  }

}
