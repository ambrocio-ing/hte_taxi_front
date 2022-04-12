import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { URL_BACKEND } from '../../sistema/config/config';

@Component({
  selector: 'app-visualizacion-imagen',
  templateUrl: './visualizacion-imagen.component.html',
  styleUrls: ['./visualizacion-imagen.component.css']
})
export class VisualizacionImagenComponent implements OnInit {

  url_backend:string = URL_BACKEND+"/cliente";
  @Input() nombre!:string;
  @Input() mostrar!:boolean;
  @Output() cerrar : EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {

  }

  cerrarModal() : void {
    this.cerrar.emit(false);
  }

}
