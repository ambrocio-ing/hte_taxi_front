import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Administrativo } from '../../modelo/administrativo/administrativo';
import { Usuario } from '../../security_modelo/usuario/usuario';
import { AdministrativoService } from '../../servicio-conexion/administrativo/administrativo.service';

@Component({
  selector: 'app-administrativo',
  templateUrl: './administrativo.component.html',
  styleUrls: ['./administrativo.component.css']
})
export class AdministrativoComponent implements OnInit {

  administrativo:Administrativo = new Administrativo();
  administrativos : Administrativo[] = [];
  mensajeLista!:string;
  estadoBoton:boolean = false;

  constructor(private admiService:AdministrativoService) { 
    this.administrativo.usuario = new Usuario();
  }

  ngOnInit(): void {
    this.listar();
  }

  listar() : void {
    this.admiService.listarAdmi().subscribe(resp => {
      this.administrativos = resp;
      this.mensajeLista = "";
    }, err => {
      this.mensajeLista = "Sin datos que mostrar";
    });
  }

  enviar(event:any){
    console.log('*******',this.administrativo);
    event.preventDefault();
    if(!this.estadoBoton){
      this.guardar();
    }
    else{
      this.editar();
    }

  }

  guardar(): void{
    if(this.administrativo.idadmin == null || this.administrativo.idadmin == undefined ){
      this.admiService.crearAdmi(this.administrativo).subscribe(resp => {
        Swal.fire({
          icon:'success',
          title:'Operación exitosa',
          text:resp.mensaje
        });
        this.ngOnInit();
        this.cancelar();
      });
    }
    else{
      Swal.fire({
        icon:'info',
        title:'Operación no válida',
        text:'Esta intentando crear nuevo registro, sobre un registro existente, por favor cancele o refresque la página'
      });
    }
  }

  ver(admin:Administrativo) : void {
    this.admiService.obtenerAdmi(admin.idadmin).subscribe(resp => {
      this.administrativo = resp;
      this.administrativo.usuario.password = "Editar???";
      this.estadoBoton = true;
    }, err=> {
      Swal.fire({
        icon:'info',
        title:'Operación fallida',
        text:'No se pudo recuperar el registro'
      });
    });
  }

  editar(): void {
    if(this.administrativo.idadmin != null && this.administrativo.idadmin > 0){
      this.admiService.editarAdmi(this.administrativo).subscribe(resp => {
        Swal.fire({
          icon:'success',
          title:'Operación exitosa',
          text:resp.mensaje
        });
        this.ngOnInit();
        this.cancelar();
      });
    }
    else{
      Swal.fire({
        icon:'info',
        title:'Operación no válida',
        text:'Esta intentando editar un registro no existente, por favor cancele o refresque la página'
      });
    }
  }

  cancelar() : void {    
    this.administrativo = new Administrativo();
    this.administrativo.usuario = new Usuario();
    this.estadoBoton = false;
  }

  eliminar(admin:Administrativo) : void {
    Swal.fire({
      icon:'question',
      title:'Seguro que desea eliminar???',
      showCancelButton:true,
      confirmButtonText:'Si, Eliminar',
      cancelButtonText:'No, Eliminar'
    }).then(resp => {
      if(resp.value){
        this.admiService.eliminarAdmi(admin.idadmin).subscribe(res => {
          Swal.fire({icon:'success',title:'Operación exitosa',text:res.mensaje});
          this.ngOnInit();
        });
      }
    });
  }  

  tipo(event:any) : void {
    //console.log('*****EVENTO',event);
    if(event.target.checked){
      this.administrativo.usuario.roles.push('admin');
    }
    else if(!event.target.checked){
      const indice = this.administrativo.usuario.roles.indexOf('admin');    
      if(indice != -1){
        this.administrativo.usuario.roles.splice(indice,1);     
      }       
    }
    //console.log('*****LISTA',this.administrativo.usuario.roles);
  }

}
