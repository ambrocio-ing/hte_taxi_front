import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { Administrativo } from '../../modelo/administrativo/administrativo';
import { Usuario } from '../../security_modelo/usuario/usuario';
import { AdministrativoService } from '../../servicio-conexion/administrativo/administrativo.service';
import { DolarService } from '../../servicio-conexion/dolar/dolar.service';

@Component({
  selector: 'app-administrativo',
  templateUrl: './administrativo.component.html',
  styleUrls: ['./administrativo.component.css']
})
export class AdministrativoComponent implements OnInit {

  @ViewChild('asTipo') astipo!:ElementRef;

  administrativo:Administrativo = new Administrativo();
  administrativos : Administrativo[] = [];
  mensajeLista!:string;
  estadoBoton:boolean = false;

  dolar:Dolar = new Dolar();
  dolar1:Dolar = new Dolar();

  constructor(private admiService:AdministrativoService, private renderer:Renderer2,
    private dolarService:DolarService) { 
    this.administrativo.usuario = new Usuario();
  }

  ngOnInit(): void {
    this.listar();
    this.obtenerDolar();
  }

  listar() : void {
    this.admiService.listarAdmi().subscribe(resp => {
      this.administrativos = resp;
      this.mensajeLista = "";
    }, err => {
      this.mensajeLista = "Sin datos que mostrar";
    });
  }

  obtenerDolar() : void {
    this.dolarService.obtenerDolar().subscribe(resp => {
      const dolar = resp as Dolar;
      this.dolar1 = dolar;
    }, err => {

    });
  }

  guardarDolar() : void {
    if(this.dolar1.id != null){
      this.dolar.id = this.dolar1.id;
    }

    if(this.dolar.valor != null && this.dolar.envioProductos != null){
      this.dolarService.crearDolar(this.dolar).subscribe(resp => {        
        Swal.fire({
          icon:'success',
          title:'Operación exitosa',
          text:'Datos almacenados con éxito'
        }).then(res => {
          const dol = resp as Dolar;
          this.dolar1 = dol;
        });

      }, err => {
        if(err.status == 404 || err.status == 500){
          Swal.fire({
            icon:'error',
            title:'Operación faliida',
            text:err.error.mensaje
          });
        }
        else{
          Swal.fire({
            icon:'error',
            title:'Operación fallida',
            text:'No se pudo guardar el registro, hubo un problema de conexión'
          });
        }
       
      });
    }
    else{
      Swal.fire({
        icon:'info',
        title:'Datos incompletos',
        text:'Llena los campos solicitados para continuar'
      });
    }

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

      const busqueda = this.administrativo.usuario.roles.indexOf("ROLE_ADMIN");
      if(busqueda != -1){
        this.administrativo.usuario.roles.length = 0;
        this.administrativo.usuario.roles.push("admin");
        const tipo = this.astipo.nativeElement;
        this.renderer.setAttribute(tipo , 'checked', 'true');
      }
      else{
        this.administrativo.usuario.roles.length = 0;
        this.administrativo.usuario.roles.push("user");
      }

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
      
      const user = this.administrativo.usuario.roles.indexOf('user');
      if(user == -1){
        this.administrativo.usuario.roles.push('user'); 
      }
      
    }
    //console.log('*****LISTA',this.administrativo.usuario.roles);
  }

}

export class Dolar{
  id!:number;
  valor!:number;
  envioProductos!:string;
}
