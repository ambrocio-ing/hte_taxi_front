import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';
import { Pago } from '../../modelo/pago/pago';
import { PagoService } from '../../servicio-conexion/pago/pago.service';

@Component({
  selector: 'app-lista-pagos',
  templateUrl: './lista-pagos.component.html',
  styleUrls: ['./lista-pagos.component.css']
})
export class ListaPagosComponent implements OnInit {

  @Input() estado_modal!:boolean;
  @Input() idtaxista!:number;
  @Output() cerrarModal : EventEmitter<boolean> = new EventEmitter();

  pagos:Pago[] = [];
  mensajeLista!:string;
  data:any = {};

  constructor(private pagoService:PagoService) { }

  ngOnInit(): void {
    this.listar();
  }

  listar() : void {
    this.pagoService.pagoHistorial(this.idtaxista).subscribe(resp => {
      this.pagos = resp;
      this.mensajeLista = "";
    }, err => {
      this.mensajeLista = "Sin datos que mostrar";
    });
  }

  buscar() : void {
    if(this.data.fecha != null && this.data.fecha2 != null){
      this.pagoService.buscarEntreFechas(this.idtaxista,this.data.fecha,this.data.fecha2).subscribe(resp => {
        this.pagos = resp;
        this.mensajeLista = "";
      }, err => {
        this.mensajeLista = "Sin datos que mostrar";
      });
    }
    else{
      Swal.fire({
        icon:'info',
        title:'Datos incompletos',
        text:'Ingrese fecha de inicio y fecha de fin para continuar'
      });
    }
  }

  cerrar() : void {
    this.cerrarModal.emit(false);
  }

}
