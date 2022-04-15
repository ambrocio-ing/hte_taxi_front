import { Usuario } from "../../security_modelo/usuario/usuario";
import { Persona } from "../persona/persona";

export class Cliente {

    idcliente!:number;
    estado!:string;
    persona!:Persona;
    usuario!:Usuario;

}
