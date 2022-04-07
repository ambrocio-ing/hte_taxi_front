import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InicioComponent } from './componentes/sistema/inicio/inicio.component';
import { LoginComponent } from './componentes/sistema/login/login.component';
import { PerfilComponent } from './componentes/usuarios/perfil/perfil.component';
import { RankingComponent } from './componentes/usuarios/ranking/ranking.component';
import { SolicitarservicioComponent } from './componentes/usuarios/solicitarservicio/solicitarservicio.component';
import { SolicitarchoferComponent } from './componentes/usuarios/solicitarchofer/solicitarchofer.component';
import { RegistrarseComponent } from './componentes/sistema/registrarse/registrarse.component';
import { TerminoscondicionesComponent } from './componentes/sistema/terminoscondiciones/terminoscondiciones.component';
import { PasarelaComponent } from './componentes/sistema/pasarela/pasarela.component';
import { IntUsuarioComponent } from './componentes/usuarios/int-usuario/int-usuario.component';
import { IntTaxistaComponent } from './componentes/usuarios/int-taxista/int-taxista.component';
import { AdministradorComponent } from './componentes/administracion/administrador/administrador.component';
import { SuscripcionComponent } from './componentes/sistema/suscripcion/suscripcion.component';
import { ListaTaxiComponent } from './componentes/administracion/lista-taxi/lista-taxi.component';
import { ListaDeliveryComponent } from './componentes/administracion/lista-delivery/lista-delivery.component';
import { ListaSuscripcionesComponent } from './componentes/administracion/lista-suscripciones/lista-suscripciones.component';
import { ListaRegistroComponent } from './componentes/administracion/lista-registro/lista-registro.component';
import { ListaReclamosComponent } from './componentes/administracion/lista-reclamos/lista-reclamos.component';
import { Perfil2Component } from './componentes/usuarios/perfil2/perfil2.component';
import { DetTaxistaComponent } from './componentes/usuarios/det-taxista/det-taxista.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProbandoyaComponent } from './componentes/probandoya/probandoya.component';
import { MapboxModelComponent } from './componentes/mapbox-model/mapbox-model.component';
import { MapboxModelTaxistaComponent } from './componentes/mapbox-model-taxista/mapbox-model-taxista.component';
import { ReclamoComponent } from './componentes/usuarios/reclamo/reclamo.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TicketComponent } from './componentes/sistema/ticket/ticket.component';
import { EstadisticaComponent } from './componentes/usuarios/estadistica/estadistica.component';
import { DetalleTaxistaComponent } from './componentes/administracion/detalle-taxista/detalle-taxista.component';
import { AdministrativoComponent } from './componentes/sistema/administrativo/administrativo.component';

@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    LoginComponent,
    PerfilComponent,
    RankingComponent,
    SolicitarservicioComponent,    
    SolicitarchoferComponent,
    RegistrarseComponent,
    TerminoscondicionesComponent,
    PasarelaComponent,
    IntUsuarioComponent,
    IntTaxistaComponent,
    AdministradorComponent,
    SuscripcionComponent,
    ListaTaxiComponent,
    ListaDeliveryComponent,
    ListaSuscripcionesComponent,
    ListaRegistroComponent,
    ListaReclamosComponent,      
    Perfil2Component, 
    DetTaxistaComponent,
    ProbandoyaComponent,
    MapboxModelComponent,
    MapboxModelTaxistaComponent,
    ReclamoComponent,
    TicketComponent,
    EstadisticaComponent,
    DetalleTaxistaComponent,
    AdministrativoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
