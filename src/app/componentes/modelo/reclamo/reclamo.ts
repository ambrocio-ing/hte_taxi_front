import { SMCliente } from "../../socket_modelo/smcliente/smcliente";
import { SMTaxista } from "../../socket_modelo/smtaxista/smtaxista";

export class Reclamo {

    idreclamo!:number;
    fecha!:Date;
    tipo!:string;
    descripcion!:string;
    cliente!:SMCliente;
    taxista!:SMTaxista;
}
