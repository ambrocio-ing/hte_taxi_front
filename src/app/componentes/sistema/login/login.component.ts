import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { JwtDto } from '../../security_modelo/jwtDto/jwt-dto';
import { LoginService } from '../../servicio-conexion/login/login.service';
import { VigilanteService } from '../../usuarios/int-taxista/vigilante.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, public loginService:LoginService,
    private vigilante:VigilanteService) { 

  }

  jwtdto:JwtDto = new JwtDto();

  data:any = {};

  ngOnInit(): void {
   
  }

  enviar(event:any){    
    event.preventDefault();
    if(this.data.tipo == "cliente"){
      this.jwtdto.id = 1;
      this.jwtdto.dni = "12345789";
      this.jwtdto.nombre = "Juan Carlos";
      this.jwtdto.apellidos = "Mendoza Inga";
      this.jwtdto.fotoPerfil = "567c7676-fce0-4000-ac4b-d7669ec1eea5_actividad.jpeg";
      this.jwtdto.username = "juancarlosmi";
      this.jwtdto.email = "juan@gmail.com";
      this.jwtdto.roles = ["ROLE_CLIENT"];
      this.loginService.guardarUsuario(this.jwtdto);
      this.router.navigate(['intusuario']);
    }
    else if(this.data.tipo == "taxista"){
      
      this.jwtdto.id = 41;
      this.jwtdto.dni = "55222111";
      this.jwtdto.nombre = "Mario";
      this.jwtdto.apellidos = "Morales Ramires";
      this.jwtdto.fotoPerfil = "dd39b0dc-4679-449f-bd4a-2ad6f19095a1_actividad.png";
      this.jwtdto.username = "juancarlosmi";
      this.jwtdto.email = "mario@gmail.com";
      this.jwtdto.roles = ["ROLE_CABBIE"];
      this.loginService.guardarUsuario(this.jwtdto);

      this.vigilante.consultarPago();   
      
    }
    else if(this.data.tipo == "admin"){
      
      //1 | Admin     | 12345678 | admin@gmail.com | Admin  |         1 
      this.jwtdto.id = 1;
      this.jwtdto.dni = "12345678";
      this.jwtdto.nombre = "Admin";
      this.jwtdto.apellidos = "Admin";
      this.jwtdto.fotoPerfil = "";
      this.jwtdto.username = "admin";
      this.jwtdto.email = "admin@gmail.com";
      this.jwtdto.roles = ["ROLE_ADMIN"];
      this.loginService.guardarUsuario(this.jwtdto);
      this.router.navigate(['admi']);
    }
    else {
      Swal.fire({
        icon:'error',
        title:'Operación fallida',
        text:'Imposible continuar con la sesión'
      });
    }
  }
  
  
}
