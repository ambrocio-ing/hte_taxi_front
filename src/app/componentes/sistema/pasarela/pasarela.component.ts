import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Pago } from '../../modelo/pago/pago';
import { CulqiService } from '../../servicio-conexion/culqi/culqi.service';
import { LoginService } from '../../servicio-conexion/login/login.service';
import { PagoService } from '../../servicio-conexion/pago/pago.service';
import { SMTaxista } from '../../socket_modelo/smtaxista/smtaxista';

@Component({
  selector: 'app-pasarela',
  templateUrl: './pasarela.component.html',
  styleUrls: ['./pasarela.component.css']
})
export class PasarelaComponent implements OnInit {

  @ViewChild('number2', { static: false }) el2!: ElementRef;
  @ViewChild('number3', { static: false }) el3!: ElementRef;
  @ViewChild('number4', { static: false }) el4!: ElementRef;

  cvv: string = "";
  year: string = "";
  mes: string = "";

  enestado: boolean = false;

  primero: string = "";
  segundo: string = "";
  tercero: string = "";
  cuarto: string = "";

  annios: Annio[] = [];
  culqi:any = {card:null,cvv:null,ex_mes:null,ex_anio:null};

  mensajencard!: string;
  preloader: boolean = false;

  //visa - master card
  visa: boolean = false;

  //american
  american: boolean = false;

  //diners
  diners: boolean = false;
  pago:Pago = new Pago();
  email!:string;

  constructor(private router: Router, private cuservice: CulqiService, 
    private pagoService:PagoService, private loginService:LoginService) {

    this.email = this.loginService.usuario.email;
  }  

  ngOnInit(): void {

    let fp = sessionStorage.getItem("fp");
    if (fp != null) {
      if (fp == "American") {
        this.american = true;
      }
      else if (fp == "Diners") {
        this.diners = true;
      }
      else if (fp == "Visa") {
        this.visa = true;
      }
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Operación fallida',
        text: 'Regrese una instancia y seleccione una forma de pago válido'
      });
    }

    this.llenarAnnio();
    this.obtenerPago();

  }

  obtenerPago() : void {
    const id = sessionStorage.getItem("idp");
    if(id != null){
      this.pagoService.pagoObtener(+id).subscribe(resp => {
        this.pago = resp;
        this.pago.taxista = new SMTaxista();
        this.pago.taxista.idtaxista = this.loginService.usuario.id;
        this.pago.taxista.dni = this.loginService.usuario.dni;
        this.enestado = true;
      }, err => {
        this.enestado = false;
      });
    }
  }

  public capturarcvv() {
    this.cvv = "***";
  }

  public capturarmes(event: any) {
    //document.querySelector('.card-expiration-date div');
    this.mes = event.target.value;
  }

  public capturaryear(event: any) {
    let year1 = event.target.value;
    this.year = year1[2] + year1[3];

  }

  public llenarAnnio(): void {
    const fecha = new Date(Date.now());
    const year = fecha.getFullYear();
    const ye = year - 2000;
    let annioactual: number = year;
    let solodos: number = ye;
    for (var i = 0; i < 50; i++) {

      const annio = new Annio(solodos.toString(), annioactual.toString());
      this.annios.push(annio);
      annioactual++;
      solodos++;
    }

  }  

  //visa
  public agregar1(event: any): void {
    let valor = event.target.value;
    if (valor != null) {
      if (valor.length <= 4) {
        this.primero = valor;
        this.culqi.card = this.primero + this.segundo + this.tercero + this.cuarto;

        if (valor.length == 4) {
          this.el2.nativeElement.focus();
        }
      }

    }
  }

  public agregar2(event: any): void {
    let valor = event.target.value;
    if (valor != null) {
      if (valor.length <= 4) {
        this.segundo = valor;
        this.culqi.card = this.primero + this.segundo + this.tercero + this.cuarto;
        if (valor.length == 4) {
          this.el3.nativeElement.focus();
        }
      }

    }
  }

  public agregar3(event: any): void {
    let valor = event.target.value;
    if (valor != null) {
      if (valor.length <= 4) {
        this.tercero = valor;
        this.culqi.card = this.primero + this.segundo + this.tercero + this.cuarto;
        if (valor.length == 4) {
          this.el4.nativeElement.focus();
        }
      }

    }
  }

  public agregar4(event: any): void {
    let valor = event.target.value;
    if (valor != null) {
      if (valor.length <= 4) {
        this.cuarto = valor;
        this.culqi.card = this.primero + this.segundo + this.tercero + this.cuarto;
      }
    }
  }

  //American
  public agregar44(event: any): void {
    let valor = event.target.value;
    if (valor != null) {
      if (valor.length <= 3) {
        this.cuarto = valor;
        this.culqi.card = this.primero + this.segundo + this.tercero + this.cuarto;
      }
    }
  }

  //Diners
  public agregar11(event: any): void {
    let valor = event.target.value;
    if (valor != null) {
      if (valor.length <= 6) {
        this.primero = valor;
        this.culqi.card = this.primero + this.segundo + this.tercero;

        if (valor.length == 6) {
          this.el2.nativeElement.focus();
        }
      }

    }
  }

  public agregar22(event: any): void {
    let valor = event.target.value;
    if (valor != null) {
      if (valor.length <= 4) {
        this.segundo = valor;
        this.culqi.card = this.primero + this.segundo + this.tercero;

        if (valor.length == 4) {
          this.el3.nativeElement.focus();
        }
      }

    }
  }

  public agregar33(event: any): void {
    let valor = event.target.value;
    if (valor != null) {
      if (valor.length <= 4) {
        this.tercero = valor;
        this.culqi.card = this.primero + this.segundo + this.tercero;

      }

    }
  }  

  public hallar_amount(): string {
    let totalstring = this.pago.total.toString();
    let arraytotal = totalstring.split('.');
    let total = (100 * parseInt(arraytotal[0]) + parseInt(arraytotal[1]));

    return total.toString();
  }

  public irConfirmacion() {
    if (this.culqi.card != null) {
      this.mensajencard = "";
      this.get_token_culqi();
      //console.log('************CULQI',this.culqi);
      //console.log('********PAGO',this.pago);
    }
    else {
      this.mensajencard = "Número de tarjeta no válido";
    }

  }

  public get_token_culqi() {
    this.preloader = true;
    let data = {
      "card_number": this.culqi.card,
      "cvv": this.culqi.cvv,
      "expiration_month": this.culqi.ex_mes,
      "expiration_year": this.culqi.ex_anio,
      "email": this.email 
    };

    this.cuservice.getTokenCulqi(data).subscribe(res => {

      let charge = {
        "amount": this.hallar_amount(),
        "currency_code": "PEN",
        "email": this.email,
        "source_id": res.id
      }

      this.cuservice.getChargeCulqi(charge).subscribe(resp => {
        this.preloader = false;
        //console.log(resp);
        sessionStorage.setItem("codigo", resp.id.toString());
        this.pago.codigo = resp.id;
        this.pago.estado = "Cancelado";
        //console.log('********Pago',this.pago);
        this.pagoService.pagoEditar(this.pago).subscribe(resp => {
          this.router.navigate(['ticket']);
        }, err => {
          this.router.navigate(['ticket']);
        });        
        
      }, err => {
        this.preloader = false;
        Swal.fire({
          icon: 'error',
          title: 'Operación fallida',
          text: err.user_message
        });
      });

    }, err => {
      this.preloader = false;
      Swal.fire({
        icon: 'error',
        title: 'Operación fallida',
        text: 'Error: Servicio no disponible intentelo mas tarde'
      });
    });

  } 

  public cancelar(): void {
    Swal.fire({
      icon: 'question',
      title: 'Seguro que desea cancelar???',
      text: 'Confirme si desea cancelar el pago',
      showCancelButton: true,
      confirmButtonText: 'Si, Cancelar',
      cancelButtonText: 'No, Cancelar'
    }).then((res) => {      
      if (res.value) {
        this.router.navigate(['suscripcion', this.pago.idpago]);
      }                
    });  

  }

}

export class Annio {
  dos: string;
  cuatro: string;

  constructor(dos: string, cuatro: string) {
    this.dos = dos;
    this.cuatro = cuatro;
  }

}
