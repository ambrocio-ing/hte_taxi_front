import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ClienteService } from '../../servicio-conexion/cliente/cliente.service';
import { SMTaxista } from '../../socket_modelo/smtaxista/smtaxista';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})

export class RankingComponent implements OnInit {  

  @Input() estadoCali!:boolean;
  @Input() smtaxista!:SMTaxista; 
  @Output() cerrarCali : EventEmitter<boolean> = new EventEmitter();

  currenRate:number = 0;
  uno:number = 1;
  dos:number = 2;
  tres:number = 3;
  cuatro:number = 4;
  cinco:number = 5;

  constructor(private router: Router, private clienteService:ClienteService) { }

  ngOnInit(): void {

  }

  guardar() : void {
    if(this.currenRate == 1){
      this.smtaxista.calificacion.uno++;
    }
    else if(this.currenRate == 2){
      this.smtaxista.calificacion.dos++;
    }
    else if(this.currenRate == 3){
      this.smtaxista.calificacion.tres++;
    }
    else if(this.currenRate == 4){
      this.smtaxista.calificacion.cuatro++;
    }
    else if(this.currenRate == 5){
      this.smtaxista.calificacion.cinco++;
    }
    else{
      Swal.fire({icon:'info', title:'Califique para continuar', text:'Pinche las estrellas dependiendo de su preferencia'});
    }

    if(this.currenRate > 0){
      this.smtaxista.calificacion.promedio = this.encontrarMayor();      
      this.clienteService.editarCalificacion(this.smtaxista).subscribe(resp =>{
        Swal.fire({
          icon:'success', 
          title:'Operación éxitosa', 
          text: resp.mensaje
        });

      });

    }

  }

  cerrarPagina() : void {
    this.cerrarCali.emit(false);
  } 

  encontrarMayor() : number{

    let promedio = this.smtaxista.calificacion.uno;
    if(this.smtaxista.calificacion.dos > promedio){
      promedio = this.smtaxista.calificacion.dos;
    }

    if(this.smtaxista.calificacion.tres > promedio){
      promedio = this.smtaxista.calificacion.tres;
    }

    if(this.smtaxista.calificacion.cuatro > promedio){
      promedio = this.smtaxista.calificacion.cuatro;
    }

    if(this.smtaxista.calificacion.cinco > promedio){
      promedio = this.smtaxista.calificacion.cinco;
    }

    return promedio;

  }

}
