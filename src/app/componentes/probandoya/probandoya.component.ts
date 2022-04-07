import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Taxista } from '../modelo/taxista/taxista';
import { TaxistaService } from '../servicio-conexion/taxista/taxista.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-probandoya',
  templateUrl: './probandoya.component.html',
  styleUrls: ['./probandoya.component.css']
})
export class ProbandoyaComponent implements OnInit {

  @ViewChild('asContainer') container!:ElementRef;
  @ViewChild('asSpan') asspan!:ElementRef;

  @ViewChild('asTable') astable!:ElementRef;
  @ViewChild('asTr') astr!:ElementRef;

  currenRate:number = 0;

  constructor(private taxService:TaxistaService, private renderer2:Renderer2) { }

  minuto1!:number;
  segundo1!:number;
  estado:boolean = false;

  taxista!:Taxista;
  data:any = {    
    persona: {
      dni: "66549992",
      nombre: "Empresita SAC",
      apellidos: "Solorzano Manzuelos",
      email: "soloempresita4@gmail.com",
      genero: "F",
      edad: 18,
      telefono: "362510002",
      direccion: "Leoncio Prado n° 350"     
    },
    estado: "Pendiente",
    disponibilidad: "No disponible",
    antecedentesPoliciales: "sfsda asdfsdaf",
    usuario: {
      username: "fasdfsadfsadd",
      password: "sdfdsafdsfdsfd"      
    },
    vehiculo: {      
      placa: "KHG-III",
      propiedad: "Alquilado",
      codigoTargetaPropiedad: "ewr325",      
      tipo: "Mototaxi",      
      numeroSeguroVehicular: "asdf64",
      companniaSeguro: "Seguros de lima norte",
      numeroPolicial: "asd658",
      codigoPermisoCirculacion: "ads302",
      descripcion: "asdf asdf",
      vehiculoPropietario: {        
        documento: "66548452",
        nombres: "Empresita SAC Solorzano Manzuelos"
      }
    },
    calificacion: {      
      una: 0,
      dos: 0,
      tres: 0,
      cuatro: 0,
      cinco: 0
    }
  }

  archivos:File[] = [];

  ngOnInit(): void {

    const fechahoy = formatDate(new Date(Date.now()),'yyyy-MM-dd','en');
    console.log(fechahoy);
    console.log(this.conpararFechas("2022-04-02","2022-04-09"));

  }

  public conpararFechas(f1:string,f2:string) : number {   

    const araryFinicio = f1.split('-');
    const arrayFfin = f2.split('-');

    const fecha1 = Date.UTC(+araryFinicio[0], +araryFinicio[1] - 1, +araryFinicio[2]);
    const fecha2 = Date.UTC(+arrayFfin[0], +arrayFfin[1] - 1, +arrayFfin[2]);
    const diferencia = fecha2 - fecha1;
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    return dias;

  }

  crear() : void {
    const con = this.container.nativeElement;

    const span = this.renderer2.createElement('span');    
    const texto = this.renderer2.createText("Hola mundo");
    this.renderer2.appendChild(span,texto);
    this.renderer2.appendChild(con,span);

  }

  agregarTexto() : void {
    const sspan = this.asspan.nativeElement;
    const texto = this.renderer2.createText("Hola gente");
    this.renderer2.appendChild(sspan,texto);
  }

  remover() : void {

    const conte = this.container.nativeElement;

    Array.from(conte.children).forEach(child => {
      console.log('children.length=' + conte.children.length);
      this.renderer2.removeChild(conte, child);
    }); 


  }

  fijarTimer1() : void {
    this.minuto1 = 2;
    this.segundo1 = 0;      
    
    const interval_segundo = setInterval(() => {
      if(this.segundo1 == 0 && this.minuto1 > 0){
        this.minuto1--;
        this.segundo1 = 59;
      }
      else{
        if(this.minuto1 >= 0){
          this.segundo1--;
        }        
      }
    }, 1000);    

    setTimeout(() => {
      clearInterval(interval_segundo);  
      console.log('Interval parado');   
    }, 120000);

  }

  capturarArchivo1(event:any) : void {
    this.archivos.push(event.target.files[0]);
  }

  capturarArchivo2(event:any) : void {
    this.archivos.push(event.target.files[0]);
  }
  capturarArchivo3(event:any) : void {
    this.archivos.push(event.target.files[0]);
  }

  capturarArchivo4(event:any) : void {
    this.archivos.push(event.target.files[0]);
  }

  capturarArchivo5(event:any) : void {
    this.archivos.push(event.target.files[0]);
  }

  enviar(){
    
    this.taxista = this.data;  

    this.taxService.taxistaGuardarCinco(this.taxista,this.archivos).pipe(
      /*mergeMap((resp) => {
        this.taxista.idtaxista = resp.idtaxista;
        return forkJoin(
          this.taxService.guardarImagenUno(this.archivos[0], resp.idtaxista),
          this.taxService.guardarImagenDos(this.archivos[1], resp.idtaxista),
          this.taxService.guardarImagenTres(this.archivos[2], resp.idtaxista),
          this.taxService.guardarImagenCuatro(this.archivos[3], resp.idtaxista)
          //this.taxService.guardarImagenCinco(this.archivos[4], resp.idtaxista)
        )
      })*/
      /*mergeMap((resp:any) => {        
        return this.taxService.guardarImagenUno(this.archivos[0], resp.idtaxista);
      }),
      mergeMap((respu : any) => {
        return this.taxService.guardarImagenDos(this.archivos[1],respu.idtaxista);
      }),
      mergeMap((res : any) => {
        return this.taxService.guardarImagenTres(this.archivos[2],res.idtaxista);
      }),
      mergeMap((re : any) => {
        return this.taxService.guardarImagenCuatro(this.archivos[3],re.idtaxista);
      }),
      mergeMap((r : any) => {
        return this.taxService.guardarImagenDos(this.archivos[4],r.idtaxista);
      })      */

    ).subscribe(data => {
      console.log('***********DATA',data);

      /*if(data[0].status != 201 || data[1].status != 201 || data[2].status != 201 ||
        data[3].status != 201 ){

        this.taxService.eliminarTaxista(this.taxista.idtaxista).subscribe();

      }*/

    });


  }

  mostrar() : void {
    this.estado = true;
    const table = this.astable.nativeElement;
    const tr = this.astr.nativeElement;

    this.renderer2.addClass(table,'stilo-modal');
    this.renderer2.addClass(tr,'wrapper2');  
  }

  mos() : void {
    console.log(this.currenRate);
  }


}
