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
import { ReclamoComponent } from './componentes/usuarios/reclamo/reclamo.component';
import { TicketComponent } from './componentes/sistema/ticket/ticket.component';
import { ChangePasswordComponent } from './componentes/sistema/change-password/change-password.component';
import { AuthGuard } from './componentes/guards/auth.guard';
import { RoleGuard } from './componentes/guards/role.guard';

const routes: Routes = [
  {path: '',component:InicioComponent},
  {path: 'registrar',component:RegistrarseComponent},
  {path: 'login',component:LoginComponent},
  {path: 'terminos',component:TerminoscondicionesComponent},  
  
  {path: 'change-password/:tokenPassword', component:ChangePasswordComponent},

  {path: 'reclamo/:id/:tipo', component:ReclamoComponent, canActivate:[AuthGuard, RoleGuard], data:{role:['ROLE_CLIENT','ROLE_CABBIE']}},
  {path: 'pasarela',component:PasarelaComponent, canActivate:[AuthGuard, RoleGuard], data:{role:['ROLE_CABBIE']}},  
  {path: 'suscripcion/:id',component:SuscripcionComponent, canActivate:[AuthGuard, RoleGuard], data:{role:['ROLE_CABBIE']}},
  {path: 'suscripcion',component:SuscripcionComponent, canActivate:[AuthGuard, RoleGuard], data:{role:['ROLE_CABBIE']}},
  {path: 'ticket',component:TicketComponent, canActivate:[AuthGuard, RoleGuard], data:{role:['ROLE_CABBIE']}},  
  
  {path: 'inttaxista',component:IntTaxistaComponent, canActivate:[AuthGuard, RoleGuard], data:{role:['ROLE_CABBIE']}},
  {path: 'intusuario',component:IntUsuarioComponent, canActivate:[AuthGuard, RoleGuard], data:{role:['ROLE_CLIENT']}},  
      
  {path: 'admi',component:AdministradorComponent, canActivate:[AuthGuard, RoleGuard], data:{role:['ROLE_ADMIN', 'ROLE_USER']}} 
    
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
