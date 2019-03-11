import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Categoria } from 'src/app/models/categoria';
import { CategoriaService } from 'src/app/services/categoria.service';
import { Token } from '../../models/token';
import { CartaoService } from 'src/app/services/cartao.service';
import { Cartao } from 'src/app/models/cartao';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  categorias: Categoria[];
  cartoes: Cartao[];
  currentToken: Token;

  categoriasExpandidas: Boolean = false;

  mostrarCartoes = 0;

  constructor(
    public navCtrl: NavController,
    private formBuilder: FormBuilder,
    private categoriaService: CategoriaService,
    private cartaoService: CartaoService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {

    this.route.params.subscribe(params => {

      this.currentToken = params as Token;
      const currentDate = new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' ');
      if (typeof(this.currentToken.id) === 'undefined' || ( this.currentToken.validade < currentDate ) ) {
        this.router.navigate(['login']);
      } else {

        this.categoriaService.getTodasCategorias().subscribe(
          (result) => {
            this.categorias = result as Categoria[];
          },
          err => {

          }
        );

        this.cartaoService.getTodosCartoes(this.currentToken).subscribe(
          (result) => {
            this.cartoes = result as Cartao[];
          },
          err => {

          }
        );

      }

    });
  }

  expandirCategorias() {
    this.categoriasExpandidas = !this.categoriasExpandidas;
  }

  selecionarCategorias(id: number) {
    this.mostrarCartoes = id;
    this.categoriasExpandidas = false;
  }

  voltarParaCategorias() {
    this.mostrarCartoes = 0;
    this.categoriasExpandidas = false;
  }
}
