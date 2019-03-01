import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Token } from '../token';
import { CategoriaService } from './categoria.service';
import { CartaoService } from './cartao.service';
import { Categoria } from '../categoria';
import { Cartao } from '../cartao';
import { element } from '@angular/core/src/render3';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  currentToken: Token;
  categorias: Categoria[];
  cartoes: Cartao[];
  mostrarCartoes: number;

  breakpoint: any;
  nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  constructor(private route: ActivatedRoute,
            private router: Router,
            private categoriaService: CategoriaService,
            private cartaoService: CartaoService,
            private elementRef: ElementRef) { }

  ngOnInit() {

    this.mostrarCartoes = 0;
    this.route.params.subscribe(params => {
      this.currentToken = params as Token;
      const currentDate = new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' ');
      if (typeof(this.currentToken.id) === 'undefined' || ( this.currentToken.validade < currentDate ) ) {
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

    this.cartaoService.getTodosCartoes(this.currentToken)
      .subscribe(
        (response) => {
          this.cartoes = response as Cartao[];
          console.log(this.cartoes);
        },
        (response) => {
          console.log(response);
        }
      );

    this.breakpoint = (window.innerWidth <= 400) ? 1 : 4;


  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 4;
  }

  selecionarCategoria(id_categoria: number) {
    console.log('hi ' + id_categoria);
    this.mostrarCartoes = id_categoria;
  }

}
