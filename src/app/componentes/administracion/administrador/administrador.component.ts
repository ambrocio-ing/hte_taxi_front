import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../servicio-conexion/login/login.service';

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.css']
})
export class AdministradorComponent implements OnInit {

  @ViewChild('asAdmin') asadmin!:ElementRef;
  @ViewChild('asTax') astax!:ElementRef;
  @ViewChild('asReclamos') asreclamos!:ElementRef;

  admin:boolean = false;
  tax:boolean = false;
  reclamos:boolean = false;

  constructor(public loginService:LoginService, private renderer:Renderer2,
    private router:Router) { 
      //this.mostrarAdmin();
  }

  ngOnInit(): void {
    //this.mostrarAdmin();
    this.admin = true;
  }

  mostrarAdmin() : void {
    this.admin = true;
    this.tax = false;
    this.reclamos = false;

    this.quitarClaseAdmin('btn-outline-success');
    this.agregarClaseAdmin('btn-success');

    this.quitarClaseTax('btn-success');
    this.agregarClaseTax('btn-outline-success');  
    
    this.quitarClaseReclamos('btn-success');
    this.agregarClaseReclamos('btn-outline-success'); 
  }

  mostrarTax() : void {
    this.admin = false;
    this.tax = true;
    this.reclamos = false;

    this.quitarClaseAdmin('btn-success');
    this.agregarClaseAdmin('btn-outline-success');

    this.quitarClaseTax('btn-outline-success');
    this.agregarClaseTax('btn-success');  
    
    this.quitarClaseReclamos('btn-success');
    this.agregarClaseReclamos('btn-outline-success'); 
  }

  mostrarReclamos() : void {
    this.admin = false;
    this.tax = false;
    this.reclamos = true;

    this.quitarClaseAdmin('btn-success');
    this.agregarClaseAdmin('btn-outline-success');

    this.quitarClaseTax('btn-success');
    this.agregarClaseTax('btn-outline-success');  
    
    this.quitarClaseReclamos('btn-outline-success');
    this.agregarClaseReclamos('btn-success'); 

  }

  cerrarsesion() : void {
    this.loginService.cerrarSesion();
    this.router.navigate(['']);
  }

  agregarClaseAdmin(clase:string) : void {
    const admin = this.asadmin.nativeElement;
    this.renderer.addClass(admin, clase);
  }

  quitarClaseAdmin(clase:string) : void {
    const admin = this.asadmin.nativeElement;
    this.renderer.removeClass(admin,clase);
  }

  agregarClaseTax(clase:string) : void {
    const tax = this.astax.nativeElement;
    this.renderer.addClass(tax,clase);
  }

  quitarClaseTax(clase:string) : void {
    const tax = this.astax.nativeElement;
    this.renderer.removeClass(tax,clase);
  }

  agregarClaseReclamos(clase:string) : void {
    const recl = this.asreclamos.nativeElement;
    this.renderer.addClass(recl, clase);
  }

  quitarClaseReclamos(clase:string) : void {
    const recl = this.asreclamos.nativeElement;
    this.renderer.removeClass(recl,clase);
  }

}
