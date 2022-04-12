import { formatDate } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import { Pago } from '../../modelo/pago/pago';
import { LoginService } from '../../servicio-conexion/login/login.service';
import { PagoService } from '../../servicio-conexion/pago/pago.service';
import { SMTaxista } from '../../socket_modelo/smtaxista/smtaxista';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css']
})
export class TicketComponent implements OnInit {

  @ViewChild('imprimir',{static:false}) el!: ElementRef;
  fechahoy = new Date(Date.now());

  constructor(private pagoService:PagoService, private router:Router,
    private loginService:LoginService) { }

  pago:Pago = new Pago();
  codigo!:string;  

  ngOnInit(): void {
    
    const cod = sessionStorage.getItem("codigo");
    if(cod != null){
      this.codigo = cod;
    }

    this.obtenerPago();

  }

  public obtenerPago() : void {

    const id = sessionStorage.getItem("idp");
    if(id != null){
      this.pagoService.pagoObtener(+id).subscribe(resp => {

        this.pago = resp;
        this.pago.taxista = new SMTaxista();
        this.pago.taxista.idtaxista = this.loginService.usuario.id;
        this.pago.taxista.nombre = this.loginService.usuario.nombre;
        this.pago.taxista.apellidos = this.loginService.usuario.apellidos;
        this.pago.taxista.dni = this.loginService.usuario.dni;

        if(this.pago.codigo == "Sin codigo" || this.pago.codigo == null){
          this.pago.estado = "Cancelado";
          this.pago.codigo = sessionStorage.getItem("codigo") || 'sin codigo';
          this.pagoService.pagoEditar(this.pago).subscribe(resp => {

          });
        }

      });
    }

  }

  public imprimirya(){
    const doc = new jsPDF('p','pt','a4');
    doc.html(this.el.nativeElement,{
      callback: (pdf) => {
        let fecha = formatDate(this.fechahoy,'yyyy-MM-dd','en');
        pdf.save(fecha+'ticket.pdf');        
      }
    });
  }

  public inicio():void {   
    Swal.fire({
      icon: 'info',
      title: 'Esta intentando finalizar',
      text: 'Por favor confirme que ya descargó su ticket',
      showCancelButton: true,
      confirmButtonText: 'Si, finalizar',
      cancelButtonText: 'No, finalizar'
    }).then((res) => {      
      if (res.value) {
        this.router.navigate(['inttaxista']);
      }                
    });         
    
  }

}
