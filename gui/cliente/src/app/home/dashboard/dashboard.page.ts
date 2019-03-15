import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Categoria } from 'src/app/models/categoria';
import { CategoriaService } from 'src/app/services/categoria.service';
import { Token } from '../../models/token';
import { CartaoService } from 'src/app/services/cartao.service';
import { Cartao } from 'src/app/models/cartao';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  categorias: Categoria[];
  cartoes: Cartao[] = [];
  todosCartoes: Cartao[];
  currentToken: Token;

  fraseVocalizada: string = "";

  categoriasExpandidas: Boolean = true;

  mostrarCartoes = 0;

  breakpoint: any;

  constructor(
    public navCtrl: NavController,
    private categoriaService: CategoriaService,
    private cartaoService: CartaoService,
    private router: Router,
    private route: ActivatedRoute,
    private tts: TextToSpeech
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

            // Já que conseguiu pegar as categorias, pegar as imagens por id de cada uma
            for (let i = 0; i < this.categorias.length; i++) {
              this.categoriaService.getImagemCategoria(this.currentToken, this.categorias[i].id.toString())
                .subscribe(imagem => {
                  const imagemURL = URL.createObjectURL(imagem);
                  this.categorias[i].imagem = imagemURL;
                },
                error => {
                  console.log(error);
                  // @TODO tratar erros e mensagens de erro
                });
            }
          },
          err => {

          }
        );

        this.cartaoService.getTodosCartoes(this.currentToken).subscribe(
          (result) => {
            this.todosCartoes = result as Cartao[];
            // Já que conseguiu pegar os cartões, pegar as imagens por id de cada cartão
            for (let i = 0; i < this.todosCartoes.length; i++ ) {
              this.cartaoService.getImagemCartao(this.currentToken, this.todosCartoes[i].id.toString())
                .subscribe(imagem => {
                  const imagemURL = URL.createObjectURL(imagem);
                  this.todosCartoes[i].imagem = imagemURL;
                },
                error => {
                  console.log(error);
                  console.log('Problema em pegar imagens dos cartões');
                  // @TODO tratar erros e mensagens de erro
                });
            }
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
    this.popularCartoes(id);

    this.mostrarCartoes = id;
    this.categoriasExpandidas = false;
  }

  popularCartoes(id: number) {
    this.cartoes = [];
    for(let i=0; i<this.todosCartoes.length; i++) {
      if(this.todosCartoes[i].id_categoria === id) {
        this.cartoes.push(this.todosCartoes[i]);
      }
    }
  }

  voltarParaCategorias() {
    this.mostrarCartoes = 0;
    this.categoriasExpandidas = true;
  }

  adicionarCartaoAFrase(nomeCartao: string) {
    this.fraseVocalizada += ' ' + nomeCartao;
  }

  limpar() {
    this.fraseVocalizada = '';
  }

  apagarAnterior() {
    const ultimoEspaco = this.fraseVocalizada.lastIndexOf(' ');
    this.fraseVocalizada = this.fraseVocalizada.substring(0, ultimoEspaco);
  }

  vocalizar() {
    this.tts.speak({
      text: 'Hello World',
      locale: 'en-US',
      rate: 1.0
    })
      .then(() => console.log('tudo certo'))
      .catch((reason: any) => {
        console.log(reason);
        console.log('deu ruim');
      });

  }

}
