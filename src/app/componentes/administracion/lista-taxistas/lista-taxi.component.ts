import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Taxista } from '../../modelo/taxista/taxista';
import { TaxistaService } from '../../servicio-conexion/taxista/taxista.service';
import { URL_BACKEND } from '../../sistema/config/config';

@Component({
  selector: 'app-lista-taxi',
  templateUrl: './lista-taxi.component.html',
  styleUrls: ['./lista-taxi.component.css']
})
export class ListaTaxiComponent implements OnInit {

  url_backend:string = URL_BACKEND+"/taxista";

  data:any = {nombres:null,dni:null};

  taxistas:Taxista[] = [];
  mensajeLista!:string;

  busquedas:Taxista[] = [];
  mensajeBusqueda!:string;

  estadoDetalle:boolean = false;
  taxistaSeleccionado:Taxista = new Taxista();

  idtaxista!:number;
  mostrarHistorial:boolean = false;
  mostrarPagos:boolean = false;

  paginador:any = {};

  constructor(private taxistaService:TaxistaService) { }

  ngOnInit(): void {
    this.data.nombres="";
    this.data.dni = "";
    this.listar(0);

    this.taxistaService.cbPaginar.subscribe(resp => {
      this.listar(resp);
    });

  }

  listar(page:number){
    this.taxistaService.taxistaLista(page).subscribe(resp => {
      this.taxistas = resp.content;
      this.paginador = resp;
      this.mensajeLista = "";
    }, err => {
      this.mensajeLista = "Sin datos que mostrar";
    });
  } 

  limpiarBusqueda() : void {
    this.busquedas.length = 0;
  }

  buscar() : void {
    if(this.data.nombres.length != 0){
      this.data.nombres = this.data.nombres.replaceAll(' ','');
      this.taxistaService.buscarPorNombres(this.data.nombres).subscribe(resp => {
        this.busquedas = resp;
        this.mensajeBusqueda = "";
      }, err => {
        this.mensajeBusqueda = "Sin datos que mostrar";
      });
    }
    else if(this.data.dni.length != 0){
      this.taxistaService.buscarPorDni(this.data.dni).subscribe(resp => {
        this.busquedas = resp;
        this.mensajeBusqueda = "";
      }, err => {
        this.mensajeBusqueda = "Sin datos que mostrar";
      });
    }
    else{
      Swal.fire({
        icon:'info',
        title:'Datos incompletos',
        text:'Ingrese nombres o documento del taxista a buscar'
      });
    }
  }

  suspender(taxista:Taxista) : void {
    Swal.fire({
      icon:'question',
      title:'Seguro que desea suspender',
      text:'Esta intentando suspender un usuario, por favor confirme su acción',
      showCancelButton:true,
      confirmButtonText:'Si, Suspender',
      cancelButtonText:'No suspender'
    }).then(resp => {
      if(resp.value){
        taxista.estado="Suspendido";
        this.taxistaService.editarEstado(taxista).subscribe(resp => {
          Swal.fire({
            icon:'success',
            title:'Operación éxitosa',
            text:resp.mensaje
          });
          this.ngOnInit();
        });
      }
    });  
    
  }

  activar(taxista:Taxista) : void {
    Swal.fire({
      icon:'question',
      title:'Seguro que desea Activar',
      text:'Esta intentando activar un usuario, por favor confirme su acción',
      showCancelButton:true,
      confirmButtonText:'Si, Activar',
      cancelButtonText:'No Activar'
    }).then(resp => {
      if(resp.value){
        taxista.estado="Activo";
        this.taxistaService.editarEstado(taxista).subscribe(resp => {
          Swal.fire({
            icon:'success',
            title:'Operación éxitosa',
            text:resp.mensaje
          });
          this.ngOnInit();
        });
      }
    });  
    
  }
  ver(taxista:Taxista) : void {
    this.estadoDetalle = true;
    this.taxistaSeleccionado = taxista;
  }

  limpiar() : void {
    if(this.data.dni.length != 0){
      this.data.dni = "";
    }
  }

  limpiar2() : void {
    if(this.data.nombres.length != 0){
      this.data.nombres = "";
    }
  }

  historialPagos(taxista:Taxista) : void {
    this.idtaxista = taxista.idtaxista;
    this.mostrarPagos = true;
  }

  historialTaxis(taxista:Taxista) : void {
    this.idtaxista = taxista.idtaxista;
    this.mostrarHistorial = true;
  }

}
