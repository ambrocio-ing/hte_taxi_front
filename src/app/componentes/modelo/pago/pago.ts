import { SMTaxista } from "../../socket_modelo/smtaxista/smtaxista";

export class Pago {

    idpago!:number;
    fecha!:string;
    codigo!:string;
    estado!:string;
    subtotal!:number;
    total!:number;
    comprobante!:string;
    taxista!:SMTaxista;

}
