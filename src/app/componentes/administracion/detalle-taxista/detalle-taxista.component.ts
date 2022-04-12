import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Taxista } from '../../modelo/taxista/taxista';
import { URL_BACKEND } from '../../sistema/config/config';

@Component({
  selector: 'app-detalle-taxista',
  templateUrl: './detalle-taxista.component.html',
  styleUrls: ['./detalle-taxista.component.css']
})

export class DetalleTaxistaComponent implements OnInit {

  url_backend:string = URL_BACKEND+"/taxista";

  @Input() estadoModal!:boolean;
  @Input() taxista:Taxista = new Taxista();
  @Output() cerrar : EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {

  }

  cerrarVentana() : void {
    this.cerrar.emit(false);
  }

}
