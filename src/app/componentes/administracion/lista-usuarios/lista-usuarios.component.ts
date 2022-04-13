import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Cliente } from '../../modelo/cliente/cliente';
import { ClienteService } from '../../servicio-conexion/cliente/cliente.service';
import { URL_BACKEND } from '../../sistema/config/config';

@Component({
  selector: 'app-lista-usuarios',
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css']
})
export class ListaUsuariosComponent implements OnInit {

  url_backend:string = URL_BACKEND+"/cliente";

  clientes:Cliente[] = [];
  mensajeLista!:string;
  data:any = {};
  
  constructor(private clienteService:ClienteService) { 
    this.data.nombres = "";
    this.data.dni = "";
  }

  ngOnInit(): void {
    this.listar();
  }

  listar() : void {
    this.clienteService.clienteLista().subscribe(resp => {
      this.clientes = resp;
      this.mensajeLista = "";
    }, err => {
      this.mensajeLista = "Sin datos que mostrar";
    });
  }

  limpiar() : void {
    if(this.data.dni != ""){
      this.data.dni = "";
    }
    
  }

  limpiar2() : void {
    if(this.data.nomberes != ""){
      this.data.nombres = "";
    }
    
  }

  buscar() : void {
    if(this.data.nombres != ""){
      const nombre = this.data.nombres.replaceAll(' ','');
      this.clienteService.buscarPorNombres(nombre).subscribe(resp => {
        this.clientes = resp;
        this.mensajeLista = "";
      }, err => {
        this.mensajeLista = "Sin datos que mostrar";
      });
    }
    else if(this.data.dni != ""){
      this.clienteService.buscarPorDni(this.data.dni).subscribe(resp => {
        this.clientes = resp;
        this.mensajeLista = "";
      }, err => {
        this.mensajeLista = "Sin datos que mostrar";
      });
    }
    else{
      Swal.fire({
        icon:'info',
        title:'Datos incompletos',
        text:'Ingrese nombres o documento para continuar'
      });
    }
  }  

  eliminar(cliente:Cliente) : void {
    Swal.fire({
      icon:'question',
      title:'¿Seguro que desea eliminar?',
      text:'Confirme si desea eliminar o no',
      showCancelButton:true,
      confirmButtonText:'Si, eliminar',
      cancelButtonText:'No, eliminar'
    }).then(resp => {
      if(resp.value){
        this.clienteService.clienteEliminar(cliente.idcliente).subscribe(resp => {
          Swal.fire({
            icon:'success',            
            text:resp.mensaje
          });
        });
      }
    });
  }  

}
