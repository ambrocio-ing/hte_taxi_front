import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InicioComponent } from './componentes/sistema/inicio/inicio.component';
import { LoginComponent } from './componentes/sistema/login/login.component';
import { PerfilComponent } from './componentes/usuarios/perfil/perfil.component';
import { RankingComponent } from './componentes/usuarios/ranking/ranking.component';
import { RegistrarseComponent } from './componentes/sistema/registrarse/registrarse.component';
import { TerminoscondicionesComponent } from './componentes/sistema/terminoscondiciones/terminoscondiciones.component';
import { PasarelaComponent } from './componentes/sistema/pasarela/pasarela.component';
import { IntUsuarioComponent } from './componentes/usuarios/int-usuario/int-usuario.component';
import { IntTaxistaComponent } from './componentes/usuarios/int-taxista/int-taxista.component';
import { AdministradorComponent } from './componentes/administracion/administrador/administrador.component';
import { SuscripcionComponent } from './componentes/sistema/suscripcion/suscripcion.component';
import { ListaTaxiComponent } from './componentes/administracion/lista-taxistas/lista-taxi.component';
import { ListaReclamosComponent } from './componentes/administracion/lista-reclamos/lista-reclamos.component';
import { Perfil2Component } from './componentes/usuarios/perfil2/perfil2.component';
import { DetTaxistaComponent } from './componentes/usuarios/det-taxista/det-taxista.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MapboxModelComponent } from './componentes/mapbox-model-cliente/mapbox-model.component';
import { MapboxModelTaxistaComponent } from './componentes/mapbox-model-taxista/mapbox-model-taxista.component';
import { ReclamoComponent } from './componentes/usuarios/reclamo/reclamo.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TicketComponent } from './componentes/sistema/ticket/ticket.component';
import { EstadisticaComponent } from './componentes/usuarios/estadistica/estadistica.component';
import { DetalleTaxistaComponent } from './componentes/administracion/detalle-taxista/detalle-taxista.component';
import { AdministrativoComponent } from './componentes/sistema/administrativo/administrativo.component';
import { ListaUsuariosComponent } from './componentes/administracion/lista-usuarios/lista-usuarios.component';
import { ListaPagosComponent } from './componentes/administracion/lista-pagos/lista-pagos.component';
import { ListaServiciosTaxiComponent } from './componentes/administracion/lista-servicios-taxi/lista-servicios-taxi.component';
import { VisualizacionImagenComponent } from './componentes/administracion/visualizacion-imagen/visualizacion-imagen.component';
import { ChangePasswordComponent } from './componentes/sistema/change-password/change-password.component';
import { TokenInterceptor } from './componentes/interceptor/token.interceptor';
import { MapboxTaxiPendienteComponent } from './componentes/mapbox-model-taxi/mapbox-taxi-pendiente/mapbox-taxi-pendiente.component';
import { TaxistasPaginadorComponent } from './componentes/administracion/taxistas-paginador/taxistas-paginador.component';
import { CambioFotoPerfilComponent } from './componentes/sistema/cambio-foto-perfil/cambio-foto-perfil.component';

@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    LoginComponent,
    PerfilComponent,
    RankingComponent,    
    RegistrarseComponent,
    TerminoscondicionesComponent,
    PasarelaComponent,
    IntUsuarioComponent,
    IntTaxistaComponent,
    AdministradorComponent,
    SuscripcionComponent,
    ListaTaxiComponent,    
    ListaReclamosComponent,      
    Perfil2Component, 
    DetTaxistaComponent,    
    MapboxModelComponent,
    MapboxModelTaxistaComponent,
    ReclamoComponent,
    TicketComponent,
    EstadisticaComponent,
    DetalleTaxistaComponent,
    AdministrativoComponent,
    ListaUsuariosComponent,
    ListaPagosComponent,
    ListaServiciosTaxiComponent,
    VisualizacionImagenComponent,    
    ChangePasswordComponent, MapboxTaxiPendienteComponent, TaxistasPaginadorComponent, CambioFotoPerfilComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgbModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi:true}],

  bootstrap: [AppComponent]
})
export class AppModule { }
