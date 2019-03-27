import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NavController, IonCard, AlertController, Platform } from '@ionic/angular';
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
  painelSelecionadoId: number = 0;

  fraseVocalizada: string = "";

  categoriasExpandidas: Boolean = true;
  paineisExpandidos: Boolean = false;

  mostrarCartoes = 0;

  criandoPainel: boolean = false;
  criarPainelForm: FormGroup;

  editandoPainel: boolean = false;
  editarPainelForm: FormGroup;
  ehTablet: Boolean;
  cartoesSelecionadosAddPainel: Cartao[] = [];
  painelASerAdicionado: Painel;
  adicionandoCartoesAPainel: boolean = false;
  brightnessCartoes = [];

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
    private platform: Platform,
  ) { }

  ngOnInit() {

    this.ehTablet = this.platform.is('tablet') || this.platform.is('ipad');
    //console.log(this.ehTablet);
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
                  //console.log(error);
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
              this.brightnessCartoes[this.todosCartoes[i].id] = 'brightness(100%)';
              this.cartaoService.getImagemCartao(this.currentToken, this.todosCartoes[i].id.toString())
                .subscribe(imagem => {
                  const imagemURL = URL.createObjectURL(imagem);
                  this.todosCartoes[i].imagem = imagemURL;
                },
                error => {
                  ////console.log(error);
                  ////console.log('Problema em pegar imagens dos cartões');
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
            //console.log("Erro ao carregar cartões");
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
    this.categoriasExpandidas = false;
    this.paineisExpandidos = true;
    this.criandoPainel = false;
    this.adicionandoCartoesAPainel = false;
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
      .then(() => {})//console.log('tudo certo'))
      .catch((reason: any) => {
        //console.log(reason);
        //console.log('deu ruim');
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
          //console.log(result);
          this.ngOnInit();
        },
        err => {
          //console.log(err);
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
                //console.log(result);
                this.voltarParaCategorias();
                this.ngOnInit();
        
              },
              err => {
                //console.log("Erro ao deletar o painel");
                this.voltarParaCategorias();
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
          //console.log('Erro ao editar o painel.');
        }
      );
    }
  }

  selecionarPainel(id_painel: number) {
    this.painelSelecionadoId = id_painel;
    this.painelService.getPainel(this.currentToken, this.currentToken.id_usuario, id_painel).subscribe(
      result => {
        this.cartoes = [];
        //console.log(result);
        for(let i=0; i<this.todosCartoes.length; i++) {
          if(this.getById(result['cartoes'], this.todosCartoes[i].id).length > 0) {
            this.cartoes.push(this.todosCartoes[i]);
            //console.log("tudo certo");
          }
        }
        this.mostrarCartoes = -1;
      },
      err => {
        //console.log(err);
        //console.log('Não foi possível carregar os cartões do painel selecionado');
      }
    );
  }

  getById(cartoesAPI: any[], id: number) {
    return cartoesAPI.filter(function(cartaoAPI) {
      return cartaoAPI.id_cartao === id;
    });
  }

  selecionarCartaoAddPainel(cartaoSelecionado) {
    // se o cartao já foi selecionado
    if( this.getCartaoById(this.cartoesSelecionadosAddPainel, cartaoSelecionado.id).length > 0 ) {
      // desseleciona o cartão
      this.brightnessCartoes[cartaoSelecionado.id] = 'brightness(100%)';
      this.cartoesSelecionadosAddPainel = this.removeCartao(this.cartoesSelecionadosAddPainel, cartaoSelecionado.id);
      //console.log("desselecionando o cartão");
    }else {
      //se não foi selecionado, seleciona ele
      this.brightnessCartoes[cartaoSelecionado.id] = 'brightness(60%)';
      this.cartoesSelecionadosAddPainel.push(cartaoSelecionado);
      //console.log("selecionando o cartão");
      
    }
  }

  adicionarListaDeCartoesNoPainel() {
    for (let i=0; i<this.cartoesSelecionadosAddPainel.length; i++) {
      //console.log( this.painelASerAdicionado.id, this.cartoesSelecionadosAddPainel[i].id );
      this.painelService.addCartaoPainel(this.currentToken, this.painelASerAdicionado.id, this.cartoesSelecionadosAddPainel[i].id).subscribe(
        result => {
        },
        err => {
          //console.log(err);
        }
        );
      }
      this.adicionandoCartoesAPainel = false;
      this.voltarParaCategorias();
      this.selecionarPainel(this.painelASerAdicionado.id);
  }

  getCartaoById(cartoes: Cartao[], id: number) {
    return cartoes.filter(function(cartao){
      return cartao.id == id;
    });
  }

  removeCartao(cartoes: Cartao[], id: number) {
    return cartoes.filter(function(cartao) {
      return cartao.id != id;
    });
  }

  iniciarSelecaoDeCartoesParaAdicionarNoPainel(painelSelecionado: Painel) {
    this.painelASerAdicionado = painelSelecionado;
    this.adicionandoCartoesAPainel = true;

    
  }

  getButtonColor(cartao: Cartao) {
    if(this.getCartaoById(this.cartoesSelecionadosAddPainel, cartao.id).length > 0) {
      return '50%';
    }else {
      return '100%';
    }
  }

  deletarCartaoDoPainel(cartao: Cartao) {
    this.painelService.deletarCartaoDoPainel(this.currentToken, parseInt(this.currentToken.id_usuario.toString()), cartao.id, this.painelSelecionadoId)
      .subscribe(
        result => {
          console.log('Cartão excluido do painel');
          this.selecionarPainel(this.painelSelecionadoId);
          this.fraseVocalizada = "";
        },
        err => {
          console.log('Erro ao excluir cartao do painel');
        }
      );
  }

}
