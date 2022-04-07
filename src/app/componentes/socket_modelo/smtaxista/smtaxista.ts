import { Calificacion } from "../../modelo/calificacion/calificacion";
import { SMVehiculo } from "../smvehiculo/smvehiculo";

export class SMTaxista {

    idtaxista!:number;
    dni!:string;
    nombre!:string;
    apellidos!:string;
    fotoPerfil!:string;
    estado!:string;
    disponibilidad!:string;
    vehiculo!:SMVehiculo;
    calificacion!:Calificacion;
}
