import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';

import { Ubicacion } from '../socket_modelo/ubicacion/ubicacion';
import { MapboxserviceService } from './mapboxservice.service';

@Component({
  selector: 'app-mapbox-model',
  templateUrl: './mapbox-model.component.html',
  styleUrls: ['./mapbox-model.component.css']
})

export class MapboxModelComponent implements OnInit {

  @Input() estadoMapa: boolean = false;
  @Output() cerrarMapa: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('asGeocoder') asGeocoder!: ElementRef;

  ubicacion!: Ubicacion;
  coords!: [number, number];
  modeInput!: string;
  wayPoints: WayPoints = { start: null };
  data:any = {};
  //array:[] = [];
  constructor(private mapboxService: MapboxserviceService, private renderer2: Renderer2) {

  }

  ngOnInit(): void {

    this.mapboxService.getPosition()
      .then((resp) => {

        this.coords = [resp.lng, resp.lat];

        this.mapboxService.construirMapa(this.coords)
          .then(({ map, geocoder }) => {
            //console.log('********TODO BIEN*****');

            this.renderer2.appendChild(this.asGeocoder.nativeElement, geocoder.onAdd(map));
            this.mapboxService.agregarMarcador(this.coords);

          })
          .catch(err => {
            console.log('********ERROR********', err);
          });

      }).catch();

    //(mapboxgl as any).accessToken = environment.mapKey;

    /*this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-77.1409194,-11.841006],
      zoom: 13
    })

    this.crearMarcador(-77.1409194,-11.841006);*/

    this.mapboxService.cbDatos.subscribe((getPoint) => {
      //console.log('*********** getPoint *********', getPoint);

      this.modeInput = 'start'
      this.wayPoints.start = getPoint;

    });


  }

  confirmar(): void {
    if(this.data.tipo != null && 
      this.data.origen != null && 
      this.data.destino != null){

      this.mapboxService.confirmar(this.data.tipo,this.data.origen,this.data.destino);

    }
    else{
      Swal.fire({
        icon:'info',
        title:'Datos incompletos',
        text:'Por favor escriba las referencias, esto ayudará a que el conductor tome una mejor decisión'
      });
    }   

  }

  cerrarModal(): void {
    this.cerrarMapa.emit(false);

  }

  verRua(): void {
    this.mapboxService.dibujarRuta();
  }

}

export class WayPoints {
  start: any;
}
