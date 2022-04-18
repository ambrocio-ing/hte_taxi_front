import { Component, Input, OnInit } from '@angular/core';
import { MapboxserviceService } from '../../mapbox-model-cliente/mapboxservice.service';
import { SMServicioTaxi } from '../../socket_modelo/smserviciotaxi/smserviciotaxi';

@Component({
  selector: 'app-mapbox-taxi-pendiente',
  templateUrl: './mapbox-taxi-pendiente.component.html',
  styleUrls: ['./mapbox-taxi-pendiente.component.css']
})
export class MapboxTaxiPendienteComponent implements OnInit {  

  @Input() smservicioTaxi!:SMServicioTaxi;  
  coords!:[number,number];  
  posicion:any = null;

  constructor(private mapboxService:MapboxserviceService) { 

  }

  ngOnInit(): void {

    this.mapboxService.getPosition()
    .then((resp) => {

      this.coords = [resp.lng, resp.lat];         
      
      const coordenadas:number[] = [
        resp.lng,
        resp.lat,
        this.smservicioTaxi.ubicacion.origen_lng,
        this.smservicioTaxi.ubicacion.origen_lat        
      ];

      const coor:number[] = [
        this.smservicioTaxi.ubicacion.origen_lng,
        this.smservicioTaxi.ubicacion.origen_lat,  
        this.smservicioTaxi.ubicacion.destino_lng,
        this.smservicioTaxi.ubicacion.destino_lat
      ];

      this.mapboxService.construirMapaPendiente(coordenadas, coor)
      .then((map) => {
        
        //console.log('******TODO BIEN');

      }).catch(err => {
        console.log('********ERROR********', err);
      });

      this.posicion = setInterval(()=>{
        console.log('PONIENDO MARCADAR');
        this.mapboxService.marcadorEnTimepoReal();
      }, 2000);

    }).catch(err => {
      console.log('********ERROR********', err);
    });    
    
  }      


}
