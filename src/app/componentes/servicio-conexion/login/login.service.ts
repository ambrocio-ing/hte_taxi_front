import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { JwtDto } from '../../security_modelo/jwtDto/jwt-dto';
import { URL_BACKEND } from '../../sistema/config/config';

@Injectable({
  providedIn: 'root'
})
export class LoginService {  

  private url:string = URL_BACKEND+"/auth";  

  public _usuario!:JwtDto;
  public _token!:string;
  public _disponible!:string;

  constructor(private http:HttpClient) { }

  public get usuario() : JwtDto {
    if(this._usuario != null){
      return this._usuario;
    }
    else if(this._usuario == null && sessionStorage.getItem("usuario") != null){
      this._usuario = JSON.parse(sessionStorage.getItem("usuario") || '{}') as JwtDto;
      return this._usuario;
    }
    else{
      return new JwtDto();
    }
  }

  public get token(): string {
    if(this._token != null && this._token != ""){
      return this._token;
    }
    else if((this._token == null || this._token == "") && sessionStorage.getItem("token") != null){
      return sessionStorage.getItem("token") || '';
    }
    else {
      return "";
    }
  }

  public get disponible() : string {

    if(this._disponible != null || this._disponible != ""){
      return this._disponible;
    }
    else if((this._disponible == null || this._disponible == "") 
      && sessionStorage.getItem("disponible") != null){
      return sessionStorage.getItem("disponible") || '';
    }
    else {
      return "";
    }

  }

  public isDisponible() : boolean {
    if(this.disponible != null && this.disponible != ""){
      if(this.disponible == "Disponible"){
        return true;  
      }
      else {
        return false;
      }
    }
    else{
      return false;
    }   

  }

  //para manejar estado del taxista
  public estado(estado:string): void {
    this._disponible = estado;
    sessionStorage.setItem("disponible", this._disponible);
  } 

  public login(data:any) : Observable<JwtDto> {
    return this.http.post(this.url+"/login", data).pipe(
      map(resp => resp as JwtDto),
      catchError(e => {

        if(e.status == 404 || e.status == 500){
          Swal.fire({
            icon:'error',
            title:'Autenticación Fallida',
            text:e.error.mensaje
          });
        }
        else{
          Swal.fire({
            icon:'info',
            title:'Error al establecer conexión',
            text:'No se pudo establecer conexión con el servidor'
          });
        }

        return throwError(() => e);
      })
    );
  }

  public refrescarToken(jwtDto:JwtDto) : Observable<JwtDto> {
    return this.http.post(this.url+"/refrescar", jwtDto).pipe(
      map(resp => resp as JwtDto)
      
    );
  }
  
  public guardarUsuario(jwtDto:JwtDto){
    this._usuario = new JwtDto();    
    this._usuario.id = jwtDto.id;
    this._usuario.dni = jwtDto.dni;
    this._usuario.nombre = jwtDto.nombre;
    this._usuario.apellidos = jwtDto.apellidos;
    this._usuario.fotoPerfil = jwtDto.fotoPerfil;    
    this._usuario.email = jwtDto.email;  

    this._token = jwtDto.token;

    sessionStorage.setItem("usuario", JSON.stringify(this._usuario));
    sessionStorage.setItem("token", this._token);   

  } 

  public setUsuario(jwtDto:JwtDto){
    this._usuario = new JwtDto();    
    this._usuario.id = jwtDto.id;
    this._usuario.dni = jwtDto.dni;
    this._usuario.nombre = jwtDto.nombre;
    this._usuario.apellidos = jwtDto.apellidos;
    this._usuario.fotoPerfil = jwtDto.fotoPerfil;    
    this._usuario.email = jwtDto.email;  

    sessionStorage.setItem("usuario", JSON.stringify(this._usuario));    
  } 

  public refresToken(token:string){
    this._token = token;
    sessionStorage.setItem("token", this._token);
  }

  public validarRol(rolename:string): boolean {
    if(this.token != null && this.token != ""){
      const roles = this.getRoles();
      if(roles.indexOf(rolename) >= 0){
        return true;
      }
      else{
        return false;
      }

    }
    else{
      return false;
    }

  }

  public cerrarSesion(){
    this._usuario = new JwtDto();
    this._token = "";
    this._disponible = "";    
    sessionStorage.clear();
  }  

  public isAuthenticate() : boolean {
    if(this.token != null && this.token != "" && this.usuario != null){
      return true;
    }
    else{
      return false;
    }
  }

  public getRoles() : string[] {
    if(this.token != null && this.token != ""){
      const tok = this.token;
      const payload = tok.split('.')[1];
      const payloadDecode = atob(payload);
      const values = JSON.parse(payloadDecode);
      const roles:string[] = values.roles;
      return roles;
    }
    else{
      return [];
    }
  }

}
