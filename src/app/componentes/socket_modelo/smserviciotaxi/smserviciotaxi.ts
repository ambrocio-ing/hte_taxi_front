import { SMCliente } from "../smcliente/smcliente";
import { SMTaxista } from "../smtaxista/smtaxista";
import { Ubicacion } from "../ubicacion/ubicacion";

export class SMServicioTaxi {

    idstaxi!:number;
    fecha!:Date;
    cliente!:SMCliente;
    taxista!:SMTaxista;
    estado!:string;    
    ubicacion!:Ubicacion;
    precio!:number;

}
