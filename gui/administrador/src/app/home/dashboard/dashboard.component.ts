import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Token } from '../token';
import { CategoriaService } from './categoria.service';
import { Categoria } from '../categoria';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  currentToken: Token;
  categorias: Categoria[];
  breakpoint: any;
  nums = [1, 2, 3, 4, 5, 6, 7,8, 9, 10];

  constructor(private route: ActivatedRoute,
            private router: Router,
            private categoriaService: CategoriaService) { }

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.currentToken = params as Token;
      if (typeof(this.currentToken.id) === 'undefined') {
        this.router.navigate(['login']);
      }
    });

    this.categoriaService.getTodasCategorias()
      .subscribe(
        (response) => {
          this.categorias = response as Categoria[];
          console.log(this.categorias);
        },
        (response) => {

        }
      );

    this.breakpoint = (window.innerWidth <= 400) ? 1 : 4;
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 4;
  }

}
