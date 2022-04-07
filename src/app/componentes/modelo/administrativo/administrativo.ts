import { Usuario } from "../../security_modelo/usuario/usuario";

export class Administrativo {

    idadmin!:number;
    dni!:string;
    nombre!:string;
    apellidos!:string;
    email!:string;
    usuario!:Usuario;

}
