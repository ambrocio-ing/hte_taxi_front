import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { ChangePasswordDto } from '../../security_modelo/change-password/changepassworddto';
import { EmailPasswordService } from '../../servicio-conexion/email-password/email-password.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})

export class ChangePasswordComponent implements OnInit {

  cpdto:ChangePasswordDto = new ChangePasswordDto();

  constructor(private activatedRoute:ActivatedRoute, 
    private emailPassService:EmailPasswordService) { 

  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const tokenPassword = params.get('tokenPassword');
      console.log('TOKEN PASSWORD',tokenPassword)
      if(tokenPassword != null){
        this.cpdto.tokenPassword = tokenPassword;
      }
    });
  }

  enviar() : void {    
    if(this.cpdto.password != null && this.cpdto.confirmarPassword != null 
      && this.cpdto.tokenPassword != null){

      this.emailPassService.cambiarContra(this.cpdto).subscribe(resp => {
        Swal.fire({
          icon:'success',
          title:'Cambio exitoso',
          text:resp.mensaje
        });
      });

    }
    else{
      Swal.fire({
        icon:'info',
        title:'Datos incompletos',
        text:'Complete los campos solicitados para continuar'
      });
    }
  }

}
