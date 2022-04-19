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

  url_backend: string = URL_BACKEND + "/cliente";

  clientes: Cliente[] = [];
  mensajeLista!: string;
  data: any = {};

  constructor(private clienteService: ClienteService) {
    this.data.nombres = "";
    this.data.dni = "";
  }

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.clienteService.clienteLista().subscribe(resp => {
      this.clientes = resp;
      this.mensajeLista = "";
    }, err => {
      this.mensajeLista = "Sin datos que mostrar";
    });
  }

  limpiar(): void {
    if (this.data.dni != "") {
      this.data.dni = "";
    }

  }

  limpiar2(): void {
    if (this.data.nomberes != "") {
      this.data.nombres = "";
    }

  }

  buscar(): void {
    if (this.data.nombres != "") {
      const nombre = this.data.nombres.replaceAll(' ', '');
      this.clienteService.buscarPorNombres(nombre).subscribe(resp => {
        this.clientes = resp;
        this.mensajeLista = "";
      }, err => {
        this.mensajeLista = "Sin datos que mostrar";
      });
    }
    else if (this.data.dni != "") {
      this.clienteService.buscarPorDni(this.data.dni).subscribe(resp => {
        this.clientes = resp;
        this.mensajeLista = "";
      }, err => {
        this.mensajeLista = "Sin datos que mostrar";
      });
    }
    else {
      Swal.fire({
        icon: 'info',
        title: 'Datos incompletos',
        text: 'Ingrese nombres o documento para continuar'
      });
    }
  }

  suspender(cliente: Cliente): void {
    Swal.fire({
      icon: 'question',
      title: '¿Seguro que desea suspender?',
      text: 'Confirme si desea suspender o no',
      showCancelButton: true,
      confirmButtonText: 'Si, suspender',
      cancelButtonText: 'No, suspender'
    }).then(resp => {
      if (resp.value) {
        cliente.estado = 'Suspendido';
        this.clienteService.editarEstado(cliente).subscribe(resp => {
          this.ngOnInit();
          Swal.fire({
            icon: 'success',
            text: resp.mensaje
          });
        });
      }
    });
  }


  activar(cliente: Cliente): void {

    Swal.fire({
      icon: 'question',
      title: '¿Seguro que desea activar?',
      text: 'Confirme si desea activar o no',
      showCancelButton: true,
      confirmButtonText: 'Si, activar',
      cancelButtonText: 'No, activar'
    }).then(resp => {
      if (resp.value) {
        cliente.estado = 'Activo';
        this.clienteService.editarEstado(cliente).subscribe(resp => {
          this.ngOnInit();
          Swal.fire({

            icon: 'success',
            text: resp.mensaje
          });
        });
      }
    });
  }

}
