import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Pago } from '../../modelo/pago/pago';
import { DolarService } from '../../servicio-conexion/dolar/dolar.service';
import { LoginService } from '../../servicio-conexion/login/login.service';
import { PagoService } from '../../servicio-conexion/pago/pago.service';
import { SMServicioTaxi } from '../../socket_modelo/smserviciotaxi/smserviciotaxi';
import { URL_BACKEND } from '../config/config';
import { SMTaxista } from '../../socket_modelo/smtaxista/smtaxista';

@Component({
  selector: 'app-suscripcion',
  templateUrl: './suscripcion.component.html',
  styleUrls: ['./suscripcion.component.css']
})
export class SuscripcionComponent implements OnInit {

  url_backend:string = URL_BACKEND+"/taxista";
  nombreUsuario!:string;
  pagos:Pago[] = [];
  mensajeHistorial!:string;
  idtaxista!:number;
  data:any = {};

  estadoPago:boolean = false;
  formaPago!:string;

  pago:Pago = new Pago(); 
  total1!:number;  
  total2!:number;  

  imagen!:File;
  noImagen!:string;

  comision!:number;
  conversion!:number;

  constructor(public loginService:LoginService, private router:Router,
    private pagoService:PagoService,
    private activatedRoute:ActivatedRoute, private dolarService:DolarService) {

    this.formarNombre();
    this.idtaxista = this.loginService.usuario.id;
    this.recuperarDolar();
    
  }

  ngOnInit(): void {

    this.activatedRoute.paramMap.subscribe(param => {
      const id = param.get('id');
      if(id != null){
        this.pagoService.pagoObtener(+id).subscribe(resp => {
          this.pago = resp;
          this.pago.taxista = new SMTaxista();
          this.estadoPago = true;
          this.comision = this.calcularComision(this.pago.subtotal);

          this.total1 = this.pago.subtotal + this.comision;   
          this.total2 = this.pago.subtotal;       

        }, err => {
          this.estadoPago = false;
        });
      }
      else{
        this.pagoService.verificarPagoPendiente(this.idtaxista).subscribe(resp => {
          if(resp.ok == "Incompleto" || resp.ok == "Faltan"){
            this.estadoPago = false;
          }
          else if(resp.ok == "ok"){
            this.pagoService.pagoObtener(+resp.id).subscribe(resp => {
              this.pago = resp;
              this.pago.taxista = new SMTaxista();
              this.estadoPago = true;

              this.comision = this.calcularComision(this.pago.subtotal);
              
              this.total1 = this.pago.subtotal + this.comision;
              this.total2 = this.pago.subtotal;   

            }, err => {
              this.estadoPago = false;
            });
          }
          
        });
      }
    });

    this.listar();

  }

  seleccionFormaPago(event:any): void {
    this.formaPago = event.target.value;
  }

  listar() : void {
    this.pagoService.pagoHistorial(this.idtaxista).subscribe(resp => {
      this.pagos = resp;
       
      this.mensajeHistorial = "";
    }, err => {
      this.mensajeHistorial = "Sin datos que mostrar";
    });
  }

  formarNombre() {
    const nombre = this.loginService.usuario.nombre + " " + this.loginService.usuario.apellidos;
    const arrayNom = nombre.split(" ");
    this.nombreUsuario = arrayNom[0];

    for (let i = 1; i < arrayNom.length; i++) {
      this.nombreUsuario += " " + arrayNom[i][0].toUpperCase() + ".";
    }

  }

  calcularComision(precio: number) : number {
    let tc = ((0.042 * precio) + (0.30 * this.conversion)) + ((0.042 * precio) + (0.30 * this.conversion)) * 0.18;
    
    return +(Math.round(tc * 100) / 100).toFixed(2);
  }

  buscar() : void {
    if(this.data.fecha != null){
      this.pagoService.buscarPorFecha(this.idtaxista, this.data.fecha).subscribe(resp => {
        this.pagos = resp;
        this.mensajeHistorial = "";
      }, err => {
        this.mensajeHistorial = "Sin datos que mostrar";
      });
    }
    else{
      Swal.fire({
        icon:'info',
        title:'Datos incompletos',
        text:'Ingrese una fecha para continuar'
      });
    }
  }

  continuar() : void {
    this.pago.taxista.idtaxista = this.idtaxista;
    this.pago.taxista.dni = this.loginService.usuario.dni;
    if(this.pago.idpago > 1 && this.formaPago != null && 
      this.formaPago != "" && this.pago.total > 0){      
      //continuar aqui
      this.pagoService.pagoEditar(this.pago).subscribe(resp => {
        sessionStorage.setItem("idp", resp.id);
        sessionStorage.setItem("fp", this.formaPago);
        this.router.navigate(['pasarela']);
      }, err => {
        Swal.fire({
          icon:'info',
          title:'Error al guardar cambios',
          text:'No fue posible guardar cambios, por favor intentelo mas tarde'
        });
      });
    }
    else{
      Swal.fire({
        icon:'info',
        title:'Datos incompletos',
        text:'Es posible que aya olvidado marcar forma de pago'
      });
    }
  }

  capturarImagen(event:any) : void {
    const img = event.target.files[0];
    if(img.type.indexOf("image") < 0){
      this.noImagen = "El archivo no es una imagen";
    }
    else{
      this.noImagen = "";
      this.imagen = img;
    }
  }

  confirmar() : void {
    if(this.noImagen == "" && this.imagen != null){
      this.pagoService.pagoMonedero(this.pago.idpago, this.pago.subtotal, this.imagen).subscribe(resp => {
        Swal.fire({
          icon:'success',
          title:'Operación exitosa',
          text:resp.mensaje
        });
        this.pago = new Pago();
        this.total1 = 0;
        this.total2 = 0;
        this.ngOnInit();

      }, err => {
        //console.log('verificar',err)
        if(err.status == 404 || err.status == 500){
          Swal.fire({
            icon:'error',
            title:'Pago no procesado',
            text:err.error.mensaje
          });
        }
        else{
          Swal.fire({
            icon:'error',
            title:'Pago no procesado',           
            text:'Su pago no se a podido procesar por favor intentelo mas tarde'
          });
        }        
      });
    }
    else{
      Swal.fire({
        icon:'info',
        title:'Datos incompletos',
        text:'Suba su comprobante como una imagen para continuar'
      });
    }
  }

  verSolicitudes() : void {
    this.router.navigate(['inttaxista']);
  }

  cerrarSesion() : void {
    this.loginService.cerrarSesion();
    this.router.navigate(['']);
  }

  recuperarDolar() {
    this.dolarService.obtenerDolar().subscribe(resp => {
      this.conversion = resp.valor;
    });
  }

}
