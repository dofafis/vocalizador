import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NavController, IonCard, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Categoria } from 'src/app/models/categoria';
import { CategoriaService } from 'src/app/services/categoria.service';
import { Token } from '../../models/token';
import { CartaoService } from 'src/app/services/cartao.service';
import { Cartao } from 'src/app/models/cartao';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { PainelService } from 'src/app/services/painel.service';
import { Painel } from 'src/app/models/painel';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  
  coresPaineis = ['#aea8d3', 'lightblue', 'lightgray', 'lightyellow', 'lightred', 'pink'];
  categorias: Categoria[];
  cartoes: Cartao[] = [];
  todosCartoes: Cartao[];
  paineis: Painel[];
  currentToken: Token;

  fraseVocalizada: string = "";

  categoriasExpandidas: Boolean = true;
  paineisExpandidos: Boolean = false;

  mostrarCartoes = 0;

  criandoPainel: boolean = false;
  criarPainelForm: FormGroup;

  editandoPainel: boolean = false;
  editarPainelForm: FormGroup;

  breakpoint: any;

  constructor(
    public navCtrl: NavController,
    private categoriaService: CategoriaService,
    private cartaoService: CartaoService,
    private router: Router,
    private route: ActivatedRoute,
    private tts: TextToSpeech,
    private formBuilder: FormBuilder,
    private painelService: PainelService,
    private elementRef: ElementRef,
    private alertCtrl: AlertController,
  ) { }

  ngOnInit() {

    this.criandoPainel = false;

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

        this.painelService.getPaineisUsuario(this.currentToken, parseInt(this.currentToken.id_usuario.toString())).subscribe(
          result => {
            this.paineis = result as Painel[];
            for(let i=0; i<this.paineis.length; i++) {
              var cor = (this.paineis[i].id) % (this.coresPaineis.length);
              this.paineis[i].imagem = this.coresPaineis[cor];
            }
          },
          err => {
            console.log("Erro ao carregar cartões");
          }
        );

      }

      this.criarPainelForm = this.formBuilder.group({
        nome: ['', Validators.required],
        descricao: ['', Validators.required]
      });

      this.editarPainelForm = this.formBuilder.group({
        id: [''],
        id_usuario: [''],
        nome: ['', Validators.required],
        descricao: ['', Validators.required],
        imagem: ['']
      });

    });
  }

  expandirCategorias() {
    this.categoriasExpandidas = !this.categoriasExpandidas;
  }
  expandirPaineis() {
    this.paineisExpandidos = !this.paineisExpandidos;
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
    this.criandoPainel = false;
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

  criarPainel() {
    this.criandoPainel = true;
  }
  cadastrarPainel() {
    if(this.criarPainelForm.valid) {
      const painel = this.criarPainelForm.getRawValue() as Painel;
      painel.id_usuario = parseInt(this.currentToken.id_usuario.toString(), 10);
      
      this.painelService.cadastrarPainel(this.currentToken, painel)
        .subscribe(result => {
          console.log(result);
          this.ngOnInit();
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  async excluirPainel(id_painel: number) {
    let alert = await this.alertCtrl.create({
      header: 'Confirmação',
      message: 'Tem certeza de que deseja excluir o painel?',
      buttons: [
        {
          text: 'Sim',
          handler: () => {
            this.painelService.deletarPainel(this.currentToken, parseInt(this.currentToken.id_usuario.toString()), id_painel).subscribe(
              result => {
                console.log(result);
                this.ngOnInit();
        
              },
              err => {
                console.log("Erro ao deletar o painel");
              }
            );
          }
        },
        {
          text: 'Não',
          role: 'cancel'
        }
      ]

    });
    await alert.present();
  }


  editarPainel(painel: Painel) {
    this.editarPainelForm.setValue({
      id: painel.id,
      id_usuario: painel.id_usuario,
      nome: painel.nome,
      descricao: painel.descricao,
      imagem: painel.imagem,
    });
    this.editandoPainel = true;
  }

  cadastrarEdicaoPainel() {
    if(this.editarPainelForm.valid) {
      const painel = this.editarPainelForm.getRawValue() as Painel;
      this.painelService.editarPainel(this.currentToken, painel).subscribe(
        result => {
          this.editandoPainel = false;
          this.ngOnInit();
        },
        err => {
          console.log('Erro ao editar o painel.');
        }
      );
    }
  }

  selecionarPainel(id_painel: number) {
    this.painelService.getPainel(this.currentToken, this.currentToken.id_usuario, id_painel).subscribe(
      result => {
        this.mostrarCartoes = -1;
        for(let i=0; i<this.todosCartoes.length; i++) {
          if(result['cartoes'].indexOf(this.todosCartoes[i]) != -1) {
            this.cartoes.push(this.todosCartoes[i]);
          }
        }
        console.log("tudo certo");
      },
      err => {
        console.log('Não foi possível carregar os cartões do painel selecionado');
      }
    );
  }
}
