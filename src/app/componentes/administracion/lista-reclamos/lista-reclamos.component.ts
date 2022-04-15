import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Reclamo } from '../../modelo/reclamo/reclamo';
import { LoginService } from '../../servicio-conexion/login/login.service';
import { ReclamoService } from '../../servicio-conexion/reclamo/reclamo.service';
import { URL_BACKEND } from '../../sistema/config/config';

@Component({
  selector: 'app-lista-reclamos',
  templateUrl: './lista-reclamos.component.html',
  styleUrls: ['./lista-reclamos.component.css']
})
export class ListaReclamosComponent implements OnInit {

  url_backend:string = URL_BACKEND+"/cliente"; 

  reclamos:Reclamo[] = [];
  mensajeLista!:string;

  nombreImagen!:string;
  mostrarImagen:boolean = false;

  data:any = {};

  constructor(private reclamoService:ReclamoService, 
    public loginService:LoginService) {     

  }

  ngOnInit(): void {

    this.reclamoService.reclamoLista().subscribe(resp => {
      this.reclamos = resp;
      this.mensajeLista = "";
    }, err => {
      console.log(err);
      this.mensajeLista = "Sin datos qu mostrar";
    });

  } 

  buscar() : void {    
    if(this.data.fecha != null){
      this.reclamoService.reclamoBuscar(this.data.fecha.toString()).subscribe(resp => {
        this.reclamos = resp;
        this.mensajeLista = "";
      }, err => {
        this.mensajeLista = "Sin datos que mostrar";
      });
    }
    else{
      Swal.fire({
        icon:'info',
        title:'Fecha no encontrado',
        text:'Ingrese una fecha válida para realizar busqueda'
      });
    }
  }

  eliminar(reclamo:Reclamo) : void {
    this.reclamoService.reclamoEliminar(reclamo.idreclamo).subscribe(resp => {
      Swal.fire({
        icon:'success',
        title:'Operación exitosa',
        text: resp.mensaje
      });
      this.ngOnInit();
    });
  }

  visualizar(reclamo:Reclamo) : void {
    this.nombreImagen = reclamo.evidencia;
    this.mostrarImagen = true;
  }  

  refrescar() : void {
    this.ngOnInit();
  }
}
