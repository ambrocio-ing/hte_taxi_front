import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './componentes/sistema/inicio/inicio.component';
import { LoginComponent } from './componentes/sistema/login/login.component';
import { PasarelaComponent } from './componentes/sistema/pasarela/pasarela.component';
import { RegistrarseComponent } from './componentes/sistema/registrarse/registrarse.component';
import { SuscripcionComponent } from './componentes/sistema/suscripcion/suscripcion.component';
import { TerminoscondicionesComponent } from './componentes/sistema/terminoscondiciones/terminoscondiciones.component';
import { IntTaxistaComponent } from './componentes/usuarios/int-taxista/int-taxista.component';
import { IntUsuarioComponent } from './componentes/usuarios/int-usuario/int-usuario.component';
import { AdministradorComponent } from './componentes/administracion/administrador/administrador.component';
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
  
  {path: 'inttaxista',component:IntTaxistaComponent},
  {path: 'intusuario',component:IntUsuarioComponent},  
  {path: 'deta-taxista',component:DetTaxistaComponent},    
  {path: 'admi',component:AdministradorComponent}  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
