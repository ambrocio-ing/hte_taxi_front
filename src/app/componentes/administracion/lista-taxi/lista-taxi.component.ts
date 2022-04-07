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

  url_backend:string = URL_BACKEND+"/ptaxista";

  data:any = {nombres:null,dni:null};

  taxistas:Taxista[] = [];
  mensajeLista!:string;

  estadoDetalle:boolean = false;
  taxistaSeleccionado:Taxista = new Taxista();

  constructor(private taxistaService:TaxistaService) { }

  ngOnInit(): void {
    this.data.nombres="";
    this.data.dni = "";
    this.listar();

  }

  listar(){
    this.taxistaService.taxistaLista().subscribe(resp => {
      this.taxistas = resp;
      this.mensajeLista = "";
    }, err => {
      this.mensajeLista = "Sin datos que mostrar";
    });
  } 

  buscar() : void {
    if(this.data.nombres.length != 0){
      this.data.nombres = this.data.nombres.replaceAll(' ','');
      this.taxistaService.buscarPorNombres(this.data.nombres).subscribe(resp => {
        this.taxistas = resp;
        this.mensajeLista = "";
      }, err => {
        this.mensajeLista = "Sin datos que mostrar";
      });
    }
    else if(this.data.dni.length != 0){
      this.taxistaService.buscarPorDni(this.data.dni).subscribe(resp => {
        this.taxistas = resp;
        this.mensajeLista = "";
      }, err => {
        this.mensajeLista = "Sin datos que mostrar";
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

  eliminar(taxista:Taxista) : void {
    this.taxistaService.eliminar_Taxista(taxista.idtaxista).subscribe(resp => {
      Swal.fire({
        icon:'success',
        title:'Registro eliminado',
        text:resp.mensaje
      });
      this.ngOnInit();
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

}
