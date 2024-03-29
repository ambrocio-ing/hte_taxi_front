import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EmailValuesDto } from '../../security_modelo/email-values/emailvaluesdto';
import { JwtDto } from '../../security_modelo/jwtDto/jwt-dto';
import { EmailPasswordService } from '../../servicio-conexion/email-password/email-password.service';
import { LoginService } from '../../servicio-conexion/login/login.service';
import { VigilanteService } from '../../usuarios/int-taxista/vigilante.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  data:any = {};   
  olvidePassword:boolean = false;

  sendEmail:EmailValuesDto = new EmailValuesDto();

  constructor(private router: Router, public loginService:LoginService,
    private vigilante:VigilanteService, private emailPassService:EmailPasswordService) { 

  }  

  ngOnInit(): void {
   
    if(this.loginService.isAuthenticate()){
      if(this.loginService.validarRol("ROlE_CLIENT")){
        this.router.navigate(['intusuario']);
      }
      else if(this.loginService.validarRol("ROlE_CABBIE")){
        this.router.navigate(['inttaxista']);
        this.loginService.estado("Disponible");
      }
      else if(this.loginService.validarRol("ROlE_ADMIN") || this.loginService.validarRol("ROLE_USER")){
        this.router.navigate(['admi']);
      }
      else{
        this.loginService.cerrarSesion();
        this.router.navigate(['']);
      }      
    }

  }

  enviar(event:any){    
    event.preventDefault();
    if(this.data.username != null && this.data.password != null){
      this.loginService.login(this.data).subscribe(resp => {
        const jwtdto:JwtDto = resp;
        this.loginService.guardarUsuario(jwtdto);
        const token = jwtdto.token;
        const payload = token.split('.')[1];
        const payloadDecode = atob(payload);
        const values = JSON.parse(payloadDecode);
        const roles:string[] = values.roles;

        if(roles.length == 1 && roles[0] == "ROLE_CLIENT"){
          this.loginService.estado("Disponible");
          this.router.navigate(['intusuario']);
        }
        else if(roles.length == 1 && roles[0] == "ROLE_CABBIE"){
          this.vigilante.consultarPago();
          //this.loginService.estado("Disponible");
        }
        else if(roles.indexOf('ROLE_ADMIN') >= 0 || roles.indexOf('ROLE_USER') >= 0){
          this.router.navigate(['admi']);
        }
        else{
          Swal.fire({
            icon:'info',
            title:'Datos no válidos',
            text:'No se a podido validar sus datos con éxito, por favor intentelo mas tarde'            
          });
          sessionStorage.clear();
          this.router.navigate(['']);
        }

      });
    }
    else{
      Swal.fire({
        icon:'info',
        title:'Datos incompletos',
        text:'Ingrese sus credenciales para continuar'
      });
    }
  }  

  olvideContra() : void {
    this.olvidePassword = true;
  }

  enviarEmail() : void {
    if(this.olvidePassword && this.sendEmail.mailTo != null){
      this.emailPassService.enviarPeticion(this.sendEmail).subscribe(resp => {
        Swal.fire({
          icon:'success',
          title:'OK',
          text: resp.mensaje
        });
      });
    }
    else{
      Swal.fire({
        icon:'info',
        title:'Datos incompletos',
        text: 'Ingrese datos solicitados para continuar'
      });
    }
  }

  cancelarEnvio() : void {
    this.olvidePassword = false;
  }
  
}
