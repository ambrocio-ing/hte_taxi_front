import { VehiculoPropietario } from "../vehiculoPropietario/vehiculo-propietario";

export class Vehiculo {

    idvehiculo!:number;
    placa!:string;
    propiedad!:string;
    codigoTargetaPropiedad!:string;
    fotoTargetaPropiedad!:string;
    tipo!:string;
    fotoVehiculo!:string;
    numeroSeguroVehicular!:string;
    companniaSeguro!:string;
    numeroPolicial!:string;
    codigoPermisoCirculacion!:string;
    descripcion!:string;
    vehiculoPropietario!:VehiculoPropietario;
}
