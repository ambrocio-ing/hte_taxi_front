import { Usuario } from "../../security_modelo/usuario/usuario";
import { Calificacion } from "../calificacion/calificacion";
import { Persona } from "../persona/persona";
import { Vehiculo } from "../vehiculo/vehiculo";

export class Taxista {

    idtaxista!:number;
    persona!:Persona;
    estado!:string;
    disponibilidad!:string;
    antecedentesPoliciales!:string;
    usuario!:Usuario;
    vehiculo!:Vehiculo;
    calificacion!:Calificacion;

}
