import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WayPoints } from '../mapbox-model-cliente/mapbox-model.component';
import { MapboxserviceService } from '../mapbox-model-cliente/mapboxservice.service';
import { SMServicioTaxi } from '../socket_modelo/smserviciotaxi/smserviciotaxi';

@Component({
  selector: 'app-mapbox-model-taxista',
  templateUrl: './mapbox-model-taxista.component.html',
  styleUrls: ['./mapbox-model-taxista.component.css']
})
export class MapboxModelTaxistaComponent implements OnInit {

  @ViewChild('asGeocoder') asGeocoder!: ElementRef;

  @Input() estadoMapatax!:boolean;
  @Input() smservicioTaxi!:SMServicioTaxi;
  @Output() cerrarMapaTaxi : EventEmitter<boolean> = new EventEmitter();

  wayPoints:WayPoints = {start : null};

  modeInput!:string;
  coords!:[number,number];
  botonReclamo:boolean = false;

  constructor(private mapboxService:MapboxserviceService,
    private renderer2:Renderer2, private router:Router) { 

  }

  ngOnInit(): void {

    this.mapboxService.getPosition()
    .then((resp) => {

      this.coords = [resp.lng, resp.lat];      

      if(this.smservicioTaxi.estado == "Iniciado" || this.smservicioTaxi.estado == "Finalizado"){
        this.botonReclamo = true;
      }

      const coordenadas:number[] = [
        this.smservicioTaxi.ubicacion.origen_lng,
        this.smservicioTaxi.ubicacion.origen_lat,
        this.smservicioTaxi.ubicacion.destino_lng,
        this.smservicioTaxi.ubicacion.destino_lat
      ];

      this.mapboxService.construir_Mapa(this.coords, coordenadas)
      .then(({ map, geocoder }) => {
        //console.log('********TODO BIEN*****');

        this.renderer2.appendChild(this.asGeocoder.nativeElement, geocoder.onAdd(map));

        /*this.mapboxService.agregarMarcador(this.coords);
        let coordenadas = [
          this.smservicioTaxi.ubicacion.origen_lng,
          this.smservicioTaxi.ubicacion.origen_lat,
          this.smservicioTaxi.ubicacion.destino_lng,
          this.smservicioTaxi.ubicacion.destino_lat
        ];    
        this.mapboxService.dibujar_Ruta(coordenadas);    
        this.mapboxService.agregar_Marcador1(coordenadas);
        this.mapboxService.agregar_Marcador2(coordenadas);*/

      }).catch(err => {
        
      });      

    }).catch(err => {
      
    });    

    this.mapboxService.cbDatos.subscribe((getPoint) => {
      //console.log('*********** getPoint *********', getPoint);

      this.modeInput = 'start'
      this.wayPoints.start = getPoint;

    });

  }

  cerrarModal(){
    this.cerrarMapaTaxi.emit(false);
  }

  reportar() : void {
    this.router.navigate(['reclamo', this.smservicioTaxi.cliente.idcliente, 'taxista']);
  }

}
