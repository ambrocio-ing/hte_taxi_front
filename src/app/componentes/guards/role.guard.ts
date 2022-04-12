import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../servicio-conexion/login/login.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private loginService:LoginService, private router:Router){

  }

  canActivate( route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    if(!this.loginService.isAuthenticate()){
      this.router.navigate(['login']); 
      return false;
    }
    
    let role = route.data['role'] as string[];
    if(role.length == 2){
      if(this.loginService.validarRol(role[0]) || this.loginService.validarRol(role[1])){
        return true;
      }
      else{
        this.loginService.cerrarSesion();
        this.router.navigate(['login']);  
        return false;
      }      
    }

    if(role.length == 1){
      if(this.loginService.validarRol(role[0])){
        return true;
      }
      else{
        this.loginService.cerrarSesion();
        this.router.navigate(['login']);        
        return false;
      }  
    }

    this.loginService.cerrarSesion();
    this.router.navigate(['login']);
    return false;
  }
  
}
