import { Component, OnInit, ElementRef, Sanitizer, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Token } from '../token';
import { CategoriaService } from './categoria.service';
import { CartaoService } from './cartao.service';
import { Categoria } from '../categoria';
import { Cartao } from '../cartao';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  currentToken: Token;
  categorias: Categoria[];
  cartoes: Cartao[];
  mostrarCartoes: number;
  criandoCategoria: boolean;

  breakpoint: any;
  nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  constructor(private route: ActivatedRoute,
            private router: Router,
            private categoriaService: CategoriaService,
            private cartaoService: CartaoService,
            private sanitizer: DomSanitizer) {}

  ngOnDestroy() {
    localStorage.setItem('mostrarCartoes', '0');
    localStorage.setItem('criandoCategoria', 'false');
  }

  ngOnInit() {
    this.criandoCategoria = localStorage.getItem('criandoCategoria')==='true' ? true : false;
    this.mostrarCartoes = parseInt(localStorage.getItem('mostrarCartoes'));
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
          
          // Já que conseguiu pegar os cartões, pegar as imagens por id de cada cartão
          for (let i = 0; i<this.cartoes.length; i++ ) {
            this.cartaoService.getImagemCartao(this.currentToken, this.cartoes[i].id.toString())
              .subscribe(imagem => {
                var imagemURL = URL.createObjectURL(imagem);
                this.cartoes[i].imagem = this.sanitizer.bypassSecurityTrustUrl(imagemURL);
              },
              error => {
                console.log(error);
                // @TODO tratar erros e mensagens de erro
              });
          }
        },
        (response) => {
          console.log(response); 
          // @TODO Tratar erros e mensagens de erro
        }
      );

    this.breakpoint = (window.innerWidth <= 400) ? 1 : 4;


  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 4;
  }

  selecionarCategoria(id_categoria: number) {
    this.mostrarCartoes = id_categoria;
    localStorage.setItem('mostrarCartoes', JSON.stringify(this.mostrarCartoes));
  }

  voltarParaCategorias() {
    this.mostrarCartoes = 0;
    localStorage.setItem('mostrarCartoes', '0');

    this.criandoCategoria = false;
    localStorage.setItem('criandoCategoria', 'false');
  }

  criarCategoria() {
    this.criandoCategoria = true;
    localStorage.setItem('criandoCategoria', 'true');
  }

}
