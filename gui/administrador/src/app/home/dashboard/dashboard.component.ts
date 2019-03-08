import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Token } from '../token';
import { CategoriaService } from './categoria.service';
import { CartaoService } from './cartao.service';
import { Categoria } from '../categoria';
import { Cartao } from '../cartao';
import { DomSanitizer } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  currentToken: Token;
  categorias: Categoria[];
  cartoes: Cartao[];
  mostrarCartoes: number;

  criandoCategoria: boolean;
  criarCategoriaForm: FormGroup;
  erroCriarCategoria = '';

  breakpoint: any;
  arquivoSelecionado: any;

  constructor(private route: ActivatedRoute,
            private router: Router,
            private categoriaService: CategoriaService,
            private cartaoService: CartaoService,
            private sanitizer: DomSanitizer,
            private formBuilder: FormBuilder,
            private elementRef: ElementRef) {}



  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'white';
  }

  ngOnDestroy() {
    localStorage.setItem('mostrarCartoes', '0');
    localStorage.setItem('criandoCategoria', 'false');
    this.erroCriarCategoria = '';
  }

  ngOnInit() {

    this.erroCriarCategoria = '';

    this.criandoCategoria = localStorage.getItem('criandoCategoria') === 'true' ? true : false;

    this.mostrarCartoes = localStorage.getItem('criandoCategoria') ?  parseInt(localStorage.getItem('mostrarCartoes'), 10) : 0;
    this.route.params.subscribe(params => {
      this.currentToken = params as Token;
      const currentDate = new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' ');
      if (typeof(this.currentToken.id) === 'undefined' || ( this.currentToken.validade < currentDate ) ) {
        this.router.navigate(['login']);
      } else {
      }
    });

    this.categoriaService.getTodasCategorias()
      .subscribe(
        (response) => {
          this.categorias = response as Categoria[];

          // Já que conseguiu pegar as categorias, pegar as imagens por id de cada uma
          for (let i = 0; i < this.categorias.length; i++) {
            this.categoriaService.getImagemCategoria(this.currentToken, this.categorias[i].id.toString())
              .subscribe(imagem => {
                const imagemURL = URL.createObjectURL(imagem);
                this.categorias[i].imagem = this.sanitizer.bypassSecurityTrustUrl(imagemURL);
              },
              error => {
                console.log(error);
                // @TODO tratar erros e mensagens de erro
              });
          }
        },
        (error) => {
          console.log(error);
          // @TODO Tratar erros e mensagens de erro
        }
      );

    this.cartaoService.getTodosCartoes(this.currentToken)
      .subscribe(
        (response) => {
          this.cartoes = response as Cartao[];

          // Já que conseguiu pegar os cartões, pegar as imagens por id de cada cartão
          for (let i = 0; i < this.cartoes.length; i++ ) {
            this.cartaoService.getImagemCartao(this.currentToken, this.cartoes[i].id.toString())
              .subscribe(imagem => {
                const imagemURL = URL.createObjectURL(imagem);
                this.cartoes[i].imagem = this.sanitizer.bypassSecurityTrustUrl(imagemURL);
              },
              error => {
                console.log(error);
                console.log('Problema em pegar imagens dos cartões');

                // @TODO tratar erros e mensagens de erro
              });
          }
        },
        (error) => {
          // @TODO Tratar erros e mensagens de erro
        }
      );

    this.breakpoint = (window.innerWidth <= 400) ? 1 : 4;

    this.criarCategoriaForm = this.formBuilder.group({
      nome: ['', Validators.required],
      descricao: ['', Validators.required]
    });
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

    this.erroCriarCategoria = '';

  }

  criarCategoria() {
    this.criandoCategoria = true;
    localStorage.setItem('criandoCategoria', 'true');
  }

  cadastrarCategoria() {
    if (this.criarCategoriaForm.valid) {
      const categoria = this.criarCategoriaForm.getRawValue() as Categoria;
      if (categoria && this.arquivoSelecionado) {
        this.categoriaService.cadastrarCategoria(this.currentToken, categoria)
          .subscribe(
            (response) => {
              categoria.id = response['id'];
              // Já que foi criada com sucesso fazer upload da imagem
              this.categoriaService.cadastrarImagemCategoria(this.currentToken, categoria, this.arquivoSelecionado)
                .subscribe(
                  () => {
                    // Fez o que tinha que fazer agora limpa o arquivo selecionado
                    this.arquivoSelecionado = null;
                    // Fez tudo agora retorna pras categorias
                    this.voltarParaCategorias();
                    this.ngOnInit();

                  },
                  error => {
                    this.erroCriarCategoria = 'Não foi possível cadastrar imagem, tente novamente';
                    // Já que não deu pra cadastrar imagem, deleta categoria
                    this.categoriaService.deletarCategoria(this.currentToken, categoria.id)
                      .subscribe(
                        () => {
                          // Tudo certo categoria deletada
                        },
                        err => {
                          // Erro ao deletar a categoria
                        }
                      );
                  }
                );
            },
            err => {
              // Não foi possível criar a categoria
              this.erroCriarCategoria = 'Categoria já existente';
            }
          );

      } else {
        // Não foi selecionada uma imagem para a categoria
        this.erroCriarCategoria = 'Selecione uma imagem para a categoria';
      }
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.criarCategoriaForm.controls[controlName].hasError(errorName);
  }

  public onFileChanged(event) {
    const file = event.target.files[0];
    this.arquivoSelecionado = file;
  }

}
