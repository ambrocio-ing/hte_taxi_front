import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './componentes/sistema/inicio/inicio.component';
import { LoginComponent } from './componentes/sistema/login/login.component';
import { PasarelaComponent } from './componentes/sistema/pasarela/pasarela.component';
import { RegistrarseComponent } from './componentes/sistema/registrarse/registrarse.component';
import { SuscripcionComponent } from './componentes/sistema/suscripcion/suscripcion.component';
import { TerminoscondicionesComponent } from './componentes/sistema/terminoscondiciones/terminoscondiciones.component';
import { PerfilComponent } from './componentes/usuarios/perfil/perfil.component';
import { IntTaxistaComponent } from './componentes/usuarios/int-taxista/int-taxista.component';
import { IntUsuarioComponent } from './componentes/usuarios/int-usuario/int-usuario.component';
import { RankingComponent } from './componentes/usuarios/ranking/ranking.component';
import { SolicitarchoferComponent } from './componentes/usuarios/solicitarchofer/solicitarchofer.component';
import { SolicitarservicioComponent } from './componentes/usuarios/solicitarservicio/solicitarservicio.component';
import { AdministradorComponent } from './componentes/administracion/administrador/administrador.component';
import { ListaDeliveryComponent } from './componentes/administracion/lista-delivery/lista-delivery.component';
import { ListaReclamosComponent } from './componentes/administracion/lista-reclamos/lista-reclamos.component';
import { ListaRegistroComponent } from './componentes/administracion/lista-registro/lista-registro.component';
import { ListaSuscripcionesComponent } from './componentes/administracion/lista-suscripciones/lista-suscripciones.component';
import { ListaTaxiComponent } from './componentes/administracion/lista-taxi/lista-taxi.component';
import { Perfil2Component } from './componentes/usuarios/perfil2/perfil2.component';
import { DetTaxistaComponent } from './componentes/usuarios/det-taxista/det-taxista.component';
import { ReclamoComponent } from './componentes/usuarios/reclamo/reclamo.component';
import { TicketComponent } from './componentes/sistema/ticket/ticket.component';

const routes: Routes = [
  {path: '',component:InicioComponent},
  {path: 'registrar',component:RegistrarseComponent},
  {path: 'login',component:LoginComponent},
  {path: 'reclamo/:id/:tipo', component:ReclamoComponent},
  {path: 'pasarela',component:PasarelaComponent},  
  {path: 'suscripcion/:id',component:SuscripcionComponent},
  {path: 'suscripcion',component:SuscripcionComponent},
  {path: 'ticket',component:TicketComponent},
  {path: 'terminos',component:TerminoscondicionesComponent},
  
  {path: 'perfil-cli', component:PerfilComponent},
  {path: 'perfil-tax',component:Perfil2Component},
  {path: 'inttaxista',component:IntTaxistaComponent},
  {path: 'intusuario',component:IntUsuarioComponent},  
  {path: 'deta-taxista',component:DetTaxistaComponent},    
  {path: 'ranking',component:RankingComponent},
  {path: 'solichofer',component:SolicitarchoferComponent},
  {path: 'soliservi',component:SolicitarservicioComponent},

  {path: 'admi',component:AdministradorComponent},
  {path: 'lideli',component:ListaDeliveryComponent},
  {path: 'lirecla',component:ListaReclamosComponent},
  {path: 'liregis',component:ListaRegistroComponent},
  {path: 'lisuscrip',component:ListaSuscripcionesComponent},
  {path: 'listax',component:ListaTaxiComponent},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
