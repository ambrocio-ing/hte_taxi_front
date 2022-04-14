import { EventEmitter, Injectable, Input } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Ubicacion } from '../socket_modelo/ubicacion/ubicacion';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})

export class MapboxserviceService {

  cbDatos: EventEmitter<any> = new EventEmitter();
  cbUbicacion: EventEmitter<Ubicacion> = new EventEmitter();
  cbPrecio: EventEmitter<number> = new EventEmitter();

  ubicacion: Ubicacion = new Ubicacion();

  mapbox = (mapboxgl as typeof mapboxgl);
  map!: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  zoom = 14;

  coordenadas: any = [];
  markerPoint: any = null;
  estadoTrazo: boolean = false;

  constructor(private http: HttpClient) {

    this.mapbox.accessToken = environment.mapKey;


  }

  construirMapa(coords: any): Promise<any> {

    return new Promise((resolve, reject) => {

      try {

        this.map = new mapboxgl.Map({
          container: 'map',
          style: this.style,
          zoom: this.zoom,
          center: coords
        });

        this.map.on('click', ($event) => {
          //console.log('******EVENTO CLICK*****',event);
          let coor = [$event.lngLat.lng, $event.lngLat.lat];
          this.agregarMarcadorConClick(coor);
          this.coordenadas.push($event.lngLat.lng);
          this.coordenadas.push($event.lngLat.lat);
          //console.log('******EVENTO CLICK*****',this.coordenadas);
        });

        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: (mapboxgl as any)

        });

        //escuchamos los eventos de geocoder
        geocoder.on('result', ($event) => {
          //console.log('***********',$event);
          const { result } = $event;
          geocoder.clear();
          this.cbDatos.emit(result);
        })

        resolve({
          map: this.map,
          geocoder

        });

      } catch (error) {
        reject(error);
      }

    });

  }

  dibujarRuta() {

    if (this.coordenadas != null && this.coordenadas.length >= 4) {

      const tamano = this.coordenadas.length;
      let coords = [this.coordenadas[tamano - 4], this.coordenadas[tamano - 3],
      this.coordenadas[tamano - 2], this.coordenadas[tamano - 1]];

      const url = [
        `https://api.mapbox.com/directions/v5/mapbox/driving/`,
        `${coords[0]},${coords[1]};${coords[2]},${coords[3]}`,
        `?steps=true&geometries=geojson&access_token=${environment.mapKey}`
      ].join('');

      this.http.get(url).subscribe((res: any) => {
        const data = res.routes[0];
        //console.log('**********DATA', data);

        this.ubicacion.origen_lng = coords[0];
        this.ubicacion.origen_lat = coords[1];
        this.ubicacion.destino_lng = coords[2];
        this.ubicacion.destino_lat = coords[3];
        this.ubicacion.distanciaestimado = this.redondeo(data.distance * 0.001);
        this.ubicacion.tiempoestimado = this.redondeo(data.duration * 0.017);

        const route = data.geometry.coordinates;

        this.map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route
            }
          }

        });

        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': 'red',
            'line-width': 5
          }

        });

        this.map.fitBounds([route[0], route[route.length - 1]], { padding: 100 });
        this.estadoTrazo = true;

      });

    }
    else {
      Swal.fire({
        icon: 'info',
        title: 'Datos incompletos',
        text: 'Para ver la ruta debe marcar punto de origen y destino usando click'
      });
    }

  }

  validarDistancia(coords: number[]): Observable<number[]> {
    //console.log('**********COORDENADAS', coords);
    const url = [
      `https://api.mapbox.com/directions/v5/mapbox/driving/`,
      `${coords[0]},${coords[1]};${coords[2]},${coords[3]}`,
      `?steps=true&geometries=geojson&access_token=${environment.mapKey}`
    ].join('');

    return this.http.get(url).pipe(
      map((resp: any) => {
        const data = resp.routes[0];

        return [this.redondeo(data.distance * 0.001), this.redondeo(data.duration * 0.017)];
      })
    );

  }  

  agregarMarcador(coords: any): void {

    /*const popup = new mapboxgl.Popup().setHTML(`
    
      <h6>Mi ubicación</h6>
      <span>Aqui estoy</span>

    `);
    const marker = new mapboxgl.Marker({ color: 'red' });
    marker.setLngLat(coords).setPopup(popup).addTo(this.map);*/

    const div = document.createElement('div');
    div.className = 'marker';

    this.markerPoint = new mapboxgl.Marker(div);
    this.markerPoint.setLngLat(coords).addTo(this.map);

  }

  agregarMarcadorConClick(coords: any): void {

    const marker = new mapboxgl.Marker({ color: 'blue' });
    marker.setLngLat(coords).addTo(this.map);

    //console.log('*********CREANDO MARCADOR', marker);

  }

  getPosition(): Promise<any> {
    return new Promise((resolve, reject) => {

      if ("geolocation" in navigator) {

        navigator.geolocation.getCurrentPosition(resp => {
          resolve({
            lng: resp.coords.longitude,
            lat: resp.coords.latitude
          });
        },
          err => {
            reject("No se ha podido establecer tu ubicación");
          });

      }
      else {
        reject("La geolocalización no está activa en tu navegador");
      }

    });

  }

  public redondeo(num: number): number {
    let m = Number((Math.abs(num) * 100).toPrecision(15));
    return (Math.round(m) / 100) * Math.sign(num);
  }

  confirmar(tipo: string, origen: string, destino: string): void {
    if (this.estadoTrazo == true && this.ubicacion.origen_lng != 0 && this.ubicacion.destino_lng != 0) {
      this.ubicacion.tipo = tipo;
      this.ubicacion.origen = origen;
      this.ubicacion.destino = destino;
      this.cbUbicacion.emit(this.ubicacion);
      Swal.fire({
        icon: 'success',
        title: 'Datos guardados',
        text: 'Felicidades esta listo para empezar a enviar solicitudes'
      });
    }
    else {
      Swal.fire({
        icon: 'info',
        title: 'Datos incompletos',
        text: 'Primero traze la ruta, luego confirme la acción'
      });
    }
  }

  //para taxista
  construir_Mapa(coords: any, coordenadas: number[]): Promise<any> {

    return new Promise((resolve, reject) => {

      try {

        this.map = new mapboxgl.Map({
          container: 'map',
          style: this.style,
          zoom: this.zoom,
          center: coords
        });

        this.agregarMarcador(coords);

        this.dibujar_Ruta(coordenadas);
        this.agregar_Marcador1(coordenadas);
        this.agregar_Marcador2(coordenadas);

        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: (mapboxgl as any)

        });

        //escuchamos los eventos de geocoder
        geocoder.on('result', ($event) => {
          //console.log('***********',$event);
          const { result } = $event;
          geocoder.clear();
          this.cbDatos.emit(result);
        });

        resolve({
          map: this.map,
          geocoder

        });

      } catch (error) {
        reject(error);
      }

    });

  }

  dibujar_Ruta(coords: number[]) {

    if (coords != null && coords.length == 4) {

      const url = [
        `https://api.mapbox.com/directions/v5/mapbox/driving/`,
        `${coords[0]},${coords[1]};${coords[2]},${coords[3]}`,
        `?steps=true&geometries=geojson&access_token=${environment.mapKey}`
      ].join('');

      this.http.get(url).subscribe((res: any) => {
        const data = res.routes[0];
        //console.log('**********DATA', data);       

        const route = data.geometry.coordinates;

        this.map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route
            }
          }

        });

        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': 'red',
            'line-width': 5
          }

        });

        this.map.fitBounds([route[0], route[route.length - 1]], { padding: 100 });


      });

    }

  }

  construirMapaPendiente(coordenadas:number[]): Promise<any> {

    return new Promise((resolve, reject) => {

      try {

        this.map = new mapboxgl.Map({
          container: 'map',
          style: this.style,
          zoom: this.zoom,
          center: [coordenadas[0],coordenadas[1]]
        });       

        this.dibujarRutaPenidente(coordenadas);
        this.agregar_Marcador1(coordenadas);
        this.agregar_Marcador2(coordenadas);        

        resolve({
          map: this.map
        });

      } catch (error) {
        reject(error);
      }

    });

  }  

  dibujarRutaPenidente(coords: number[]) {

    if (coords != null && coords.length == 4) {

      const url = [
        `https://api.mapbox.com/directions/v5/mapbox/driving/`,
        `${coords[0]},${coords[1]};${coords[2]},${coords[3]}`,
        `?steps=true&geometries=geojson&access_token=${environment.mapKey}`
      ].join('');

      this.http.get(url).subscribe((res: any) => {
        const data = res.routes[0];
        //console.log('**********DATA', data);       

        const route = data.geometry.coordinates;

        this.map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route
            }
          }

        });

        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': 'red',
            'line-width': 5
          }

        });

        this.map.fitBounds([route[0], route[route.length - 1]], { padding: 100 });


      });

    }

  }

  marcadorEnTimepoReal() {
    const div = document.createElement('div');
    div.className = 'marker-blue';

    this.getPosition().then(resp => {
      const coords = [resp.lng, resp.lat];
      if(!this.markerPoint){
        this.markerPoint = new mapboxgl.Marker(div);
      }
      else{
        this.markerPoint.setLngLat(coords).addTo(this.map);
      }
    });       
    
  }

  agregar_Marcador1(coords: number[]): void {

    const popup1 = new mapboxgl.Popup().setHTML(`    
      
      <span>Punto de origen</span>

    `);

    const marker1 = new mapboxgl.Marker({ color: 'red' });
    marker1.setLngLat([coords[0], coords[1]]).setPopup(popup1).addTo(this.map);

    //console.log('*********CREANDO MARCADOR', marker);   

  }

  agregar_Marcador2(coords: number[]): void {

    //console.log('*********CREANDO MARCADOR', marker);

    const popup2 = new mapboxgl.Popup().setHTML(`    
      
      <span>Punto destino</span>

    `);

    const marker2 = new mapboxgl.Marker({ color: 'blue' });
    marker2.setLngLat([coords[2], coords[3]]).setPopup(popup2).addTo(this.map);

  }


}
