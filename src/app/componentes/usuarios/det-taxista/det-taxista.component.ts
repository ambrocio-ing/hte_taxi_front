import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../servicio-conexion/login/login.service';
import { SMTaxista } from '../../socket_modelo/smtaxista/smtaxista';
import { URL_BACKEND } from '../../sistema/config/config';

@Component({
  selector: 'app-det-taxista',
  templateUrl: './det-taxista.component.html',
  styleUrls: ['./det-taxista.component.css']
})
export class DetTaxistaComponent implements OnInit { 

  @Input() estoDetalle! : boolean;
  @Input() taxista!: SMTaxista;
  @Output() cerrarDetalle : EventEmitter<boolean> = new EventEmitter();   

  @Input() estadoReclamo!:boolean;

  url_backend:string = URL_BACKEND+"/taxista";  

  estadoCalificacion:boolean = false;
  smtaxistaSelec!:SMTaxista;

  constructor(private router: Router,      
    public loginService:LoginService) {    

  }

  ngOnInit(): void {    

    /*this.activateRoute.params.subscribe((params : Params) => {
      
      this.idtaxista = +params.id;

      this.taxService.datos(this.idtaxista).subscribe(resp => {
        this.taxista = resp;        

      });

    });  */  

    /*this.activateRoute.paramMap.subscribe(resp => {
      let id = resp.get("id");
      if(id != null){
        this.idtaxista = +id;
        this.taxService.datos(this.idtaxista).subscribe(resp => {
          this.taxista = resp;        
  
        });
      }
      
    });*/
    
  }

  reportar() : void {
    this.router.navigate(['reclamo', this.taxista.idtaxista, 'cliente']);
  }

  calificar() : void {
    this.estadoCalificacion = true;
    this.smtaxistaSelec = this.taxista;
  }

  cerrar() : void {
    this.cerrarDetalle.emit(false);
  }  

}
