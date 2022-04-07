import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable, Input } from '@angular/core';
import { Router } from '@angular/router';
import { JwtDto } from '../../security_modelo/jwtDto/jwt-dto';
import { URL_BACKEND } from '../../sistema/config/config';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  @Input() desconectarSocket:EventEmitter<string> = new EventEmitter();
  @Input() desconectar_Socket:EventEmitter<string> = new EventEmitter();

  private url:string = URL_BACKEND+"/login";
  private httHeaders = new HttpHeaders({'Content-Type' : 'application/json'});

  public _usuario!:JwtDto;
  public _token!:string;
  public _disponible!:string;

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

    if(sessionStorage.getItem("disponible") == "Disponible"){

      return true;

    }
    else {
      return false;
    }

  }

  public estado(estado:string): void {
    //this._disponible = estado;
    sessionStorage.setItem("disponible", estado);
  }
  
  constructor(private router:Router, private http:HttpClient) { }

  public guardarUsuario(jwtDto:JwtDto){
    this._usuario = new JwtDto();    
    this._usuario.id = jwtDto.id;
    this._usuario.dni = jwtDto.dni;
    this._usuario.nombre = jwtDto.nombre;
    this._usuario.apellidos = jwtDto.apellidos;
    this._usuario.fotoPerfil = jwtDto.fotoPerfil;
    this._usuario.username = jwtDto.username;
    this._usuario.email = jwtDto.email;
    this._usuario.roles = jwtDto.roles;

    this._token = jwtDto.token;

    sessionStorage.setItem("usuario", JSON.stringify(this._usuario));
    sessionStorage.setItem("token", this._token);
    sessionStorage.setItem("disponible", "Disponible");

  }

  public noDisponibilidad() {
    if(this.disponible == "Disponible"){
      sessionStorage.setItem("disponible", "Ocupado");
    }
    else {
      sessionStorage.setItem("disponible", "Disponible");
    }
  }

  public validarRol(rolename:string): boolean {

    if(this.usuario != null){
      const indice = this.usuario.roles.find(x => x == rolename);
      if(indice == null || indice == undefined){
        return false;
      }
      else{
        return true;
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

}
