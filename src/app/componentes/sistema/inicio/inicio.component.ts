import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  public navbarabrir(){
    const navbar = document.querySelector('.navbar');
    navbar?.classList.add('active');
  }
  public navbarcerrar(){
    const navbar = document.querySelector('.navbar');
    navbar?.classList.remove('active');
  }
  irAdministracion() {
    this.router.navigate(['login']);
  }
  irRegistro() {
    this.router.navigate(['registrar']);
  }
  irIniciosesion() {
    this.router.navigate(['login']);
  }
}
