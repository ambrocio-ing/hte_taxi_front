import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terminoscondiciones',
  templateUrl: './terminoscondiciones.component.html',
  styleUrls: ['./terminoscondiciones.component.css']
})
export class TerminoscondicionesComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  Volver() {
    this.router.navigate(['registrar']);
  }
}
