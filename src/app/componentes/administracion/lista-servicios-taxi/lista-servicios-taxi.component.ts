import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TaxistaService } from '../../servicio-conexion/taxista/taxista.service';
import { SMServicioTaxi } from '../../socket_modelo/smserviciotaxi/smserviciotaxi';

@Component({
  selector: 'app-lista-servicios-taxi',
  templateUrl: './lista-servicios-taxi.component.html',
  styleUrls: ['./lista-servicios-taxi.component.css']
})
export class ListaServiciosTaxiComponent implements OnInit {

  @Input() idtaxista!:number;
  @Input() estadoModal!:boolean;
  @Output() cerraModal : EventEmitter<boolean> = new EventEmitter();

  data:any = {};
  smservicios:SMServicioTaxi[] = [];
  mensajeLista!:string;
  
  constructor(private taxistaService:TaxistaService) { }  

  ngOnInit(): void {
    this.listar();
  }

  listar() : void {
    this.taxistaService.historial(this.idtaxista).subscribe(resp => {
      this.smservicios = resp;
      this.mensajeLista = "";
    }, err => {
      this.mensajeLista = "Sin datos que mostrar";
    });
  }

  buscar() : void {
    if(this.data.fecha != null){
      this.taxistaService.buscarSmsPorFecha(this.idtaxista, this.data.fecha).subscribe(resp => {
        this.smservicios = resp;
        this.mensajeLista = "";
      }, err => {
        this.mensajeLista = "Sin datos que mostrar";
      });
    }
  }

  cerrar() : void {
    this.cerraModal.emit(false);
  }

}
